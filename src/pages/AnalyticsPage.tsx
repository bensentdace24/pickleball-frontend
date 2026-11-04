import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnalyticsChart } from "../components/AnalyticsChart";
import { EmptyState, Alert, Skeleton } from "../components/Feedback";
import { AdminHeader } from "../components/admin/AdminHeader";
import { useAsync } from "../hooks/useAsync";
import { analyticsApi } from "../services/api";
import { Page, Container, Card, Badge, Grid, Flex, Button } from "../components";

function mins(seconds: number | null) {
  return seconds === null ? "—" : `${Math.round(seconds / 60)} min`;
}

function StatCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <Card variant="bordered" className="p-4 sm:p-5 hover-lift">
      <p className="text-label text-text-secondary">{label}</p>
      <p className="mt-2 text-stat font-bold tracking-tight text-text-primary animate-count-up">{value}</p>
      <p className="mt-1 text-label text-text-tertiary">{note}</p>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card variant="bordered" className="p-4 sm:p-5 animate-pulse">
      <Skeleton className="h-3 w-24 rounded mb-2" />
      <Skeleton className="h-7 w-16 rounded" />
      <Skeleton className="h-3 w-20 rounded mt-2" />
    </Card>
  );
}

interface ChartSkeletonProps {
  className?: string;
}

function ChartSkeleton({ className = "" }: ChartSkeletonProps) {
  return (
    <Card variant="bordered" className={`p-5 sm:p-6 animate-pulse ${className}`}>
      <div className="flex justify-between mb-4">
        <Skeleton className="h-5 w-32 rounded" />
        <Skeleton className="h-5 w-20 rounded" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="flex justify-between mb-1.5">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-4 w-28 rounded" />
        ))}
      </div>
    </Card>
  );
}

function TopPlayersSkeleton({ className = "" }: { className?: string }) {
  return (
    <Card variant="bordered" className={`p-5 sm:p-6 animate-pulse ${className}`}>
      <div className="flex justify-between mb-4">
        <Skeleton className="h-5 w-24 rounded" />
        <Skeleton className="h-5 w-20 rounded" />
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="bordered" className="p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3 w-20 rounded mt-1" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-5 w-12 rounded" />
              <Skeleton className="h-3 w-16 rounded mt-1" />
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}

function DurationStatsSkeleton({ className = "" }: { className?: string }) {
  return (
    <Card variant="bordered" className={`p-5 sm:p-6 animate-pulse ${className}`}>
      <div className="flex justify-between mb-5">
        <Skeleton className="h-5 w-32 rounded" />
        <Skeleton className="h-5 w-20 rounded" />
      </div>
      <Grid cols={3} gap={3}>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </Grid>
    </Card>
  );
}

class AnalyticsErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Analytics page failed to render", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <Page withBackground>
          <main className="mx-auto flex max-w-7xl flex-col gap-5 py-6 sm:py-8">
            <Container size="full">
              <Alert type="error" title="Analytics couldn't be displayed">
                {this.state.error.message || "An unexpected rendering error occurred."}
              </Alert>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Reload analytics
              </Button>
            </Container>
          </main>
        </Page>
      );
    }

    return this.props.children;
  }
}

function AnalyticsPageContent() {
  const { data, loading, error } = useAsync(analyticsApi.get, 15000);
  const topPlayers = Array.isArray(data?.top_players) ? data.top_players : [];

  return (
    <Page withBackground>
      <AdminHeader active="analytics" />

      <main className="mx-auto flex max-w-7xl flex-col gap-5 py-6 sm:py-8">
        <Container size="full">
          <div>
            <p className="text-label text-success">Club insights</p>
            <h1 className="mt-1 text-h2 font-bold tracking-tight text-text-primary sm:text-h1">Analytics</h1>
            <p className="mt-1 text-body text-text-secondary">Match results and participation from completed games.</p>
          </div>
          {error && <Alert type="error">Couldn't refresh analytics: {error}</Alert>}
          {loading && !data ? (
            <>
              <Grid cols={4} gap={3} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" aria-label="Analytics overview">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </Grid>
              <Grid cols={2} gap={4} className="mt-5 lg:grid-cols-2">
                <ChartSkeleton />
                <ChartSkeleton />
                <ChartSkeleton className="lg:col-span-2" />
              </Grid>
              <DurationStatsSkeleton className="mt-5" />
              <TopPlayersSkeleton className="mt-5" />
            </>
          ) : !data ? (
            <EmptyState title="Analytics are unavailable" description="Check the connection and try again." />
          ) : (
            <>
              <Grid cols={4} gap={3} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" aria-label="Analytics overview">
                <StatCard label="Completed matches" value={data.total_games} note="All-time completed games" />
                <StatCard label="Players" value={data.total_players} note="Players with a completed match" />
                <StatCard label="Singles matches" value={data.singles_games} note="One player per side" />
                <StatCard label="Doubles matches" value={data.doubles_games} note="Two players per side" />
              </Grid>

              {data.total_games === 0 ? (
                <EmptyState title="No finished matches yet" description="Match analytics will appear after games are completed and scored." />
              ) : (
                <>
                  <Grid cols={2} gap={4} className="mt-5 lg:grid-cols-2">
                    <AnalyticsChart
                      title="Participation by format"
                      description="Completed singles and doubles matches."
                      values={[
                        { label: "Singles", value: data.singles_games ?? 0 },
                        { label: "Doubles", value: data.doubles_games ?? 0 },
                      ]}
                      colors={["bg-primary", "bg-warning"]}
                    />
                    <AnalyticsChart
                      title="Score margins"
                      description="Completed games grouped by winning margin."
                      values={[
                        { label: "Close · 1–2 points", value: data.scores?.close ?? 0 },
                        { label: "Moderate · 3–5 points", value: data.scores?.moderate ?? 0 },
                        { label: "Wide · 6+ points", value: data.scores?.lopsided ?? 0 },
                      ]}
                      colors={["bg-primary", "bg-warning", "bg-danger"]}
                    />
                    <Card variant="bordered" className="lg:col-span-2 p-4 hover-lift">
                      <p className="text-body text-text-secondary">
                        Average final score: <span className="font-semibold text-text-primary animate-count-up">{data.scores?.avg_winning ?? "—"} to {data.scores?.avg_losing ?? "—"}</span>
                      </p>
                    </Card>
                  </Grid>

                  <Card variant="bordered" className="p-5 sm:p-6 hover-lift">
                    <Flex justify="between" wrap gap={3}>
                      <div>
                        <h2 className="text-h3 font-semibold text-text-primary">Match duration</h2>
                        <p className="mt-1 text-label text-text-secondary">Based on {data.time?.counted_games ?? 0} games between 1 minute and 3 hours.</p>
                      </div>
                      <Badge variant="success" size="sm">Observed data</Badge>
                    </Flex>
                    <Grid cols={3} gap={3} className="mt-5">
                      <StatCard label="Average" value={mins(data.time?.avg_seconds ?? null)} note="Typical match length" />
                      <StatCard label="Fastest" value={mins(data.time?.fastest_seconds ?? null)} note="Shortest counted match" />
                      <StatCard label="Longest" value={mins(data.time?.longest_seconds ?? null)} note="Longest counted match" />
                    </Grid>
                  </Card>

                  <Card variant="bordered" className="p-5 sm:p-6 hover-lift">
                    <Flex justify="between" wrap gap={3} className="mb-4">
                      <div>
                        <h2 className="text-h3 font-semibold text-text-primary">Top players</h2>
                        <p className="mt-1 text-label text-text-secondary">Ranked from completed match results.</p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/admin/rankings">Full rankings →</Link>
                      </Button>
                    </Flex>
                    {topPlayers.length === 0 ? (
                      <EmptyState title="No ranked players yet" />
                    ) : (
                      <Grid cols={2} gap={2} className="md:grid-cols-2">
                        {topPlayers.map((player) => (
                          <Card key={player.player_id} variant="bordered" className="p-3 flex items-center justify-between gap-3 hover:bg-surface-sunken transition-colors hover-lift">
                            <Flex gap={3} align="center" className="min-w-0">
                              <Badge variant="success" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-label font-bold animate-count-up">#{player.rank}</Badge>
                              <div className="min-w-0">
                                <p className="truncate text-body font-semibold text-text-primary">{player.name}</p>
                                <p className="text-label text-text-secondary">{player.wins}W · {player.losses}L · {player.draws}D</p>
                              </div>
                            </Flex>
                            <div className="shrink-0 text-right">
                              <p className="text-body font-bold text-success animate-count-up">{player.win_rate}%</p>
                              <p className="text-label text-text-secondary animate-count-up">{player.total_points} pts</p>
                            </div>
                          </Card>
                        ))}
                      </Grid>
                    )}
                  </Card>
                </>
              )}
            </>
          )}
        </Container>
      </main>
    </Page>
  );
}

export default function AnalyticsPage() {
  return (
    <AnalyticsErrorBoundary>
      <AnalyticsPageContent />
    </AnalyticsErrorBoundary>
  );
}
