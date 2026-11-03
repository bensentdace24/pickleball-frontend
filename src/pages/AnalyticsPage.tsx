import { Link } from "react-router-dom";
import { AnalyticsChart } from "../components/AnalyticsChart";
import { EmptyState, Spinner, Alert } from "../components/Feedback";
import { AdminHeader } from "../components/admin/AdminHeader";
import { useAsync } from "../hooks/useAsync";
import { analyticsApi } from "../services/api";
import { Page, Container, Card, Badge, Grid, Flex, Button } from "../components";

function mins(seconds: number | null) {
  return seconds === null ? "—" : `${Math.round(seconds / 60)} min`;
}

function StatCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <Card variant="bordered" className="p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-tertiary">{note}</p>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { data, loading, error } = useAsync(analyticsApi.get, 15000);

  return (
    <Page withBackground>
      <AdminHeader active="analytics" />

      <main className="mx-auto flex max-w-7xl flex-col gap-5 py-6 sm:py-8">
        <Container size="full">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-success-500">Club insights</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">Analytics</h1>
            <p className="mt-1 text-sm text-text-secondary">Match results and participation from completed games.</p>
          </div>
          {error && <Alert type="error">Couldn't refresh analytics: {error}</Alert>}
          {loading && !data ? (
            <Spinner label="Loading club analytics…" />
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
                  <Grid cols={2} gap={4} className="lg:grid-cols-2">
                    <AnalyticsChart
                      title="Participation by format"
                      description="Completed singles and doubles matches."
                      values={[
                        { label: "Singles", value: data.singles_games },
                        { label: "Doubles", value: data.doubles_games },
                      ]}
                      colors={["bg-success-500", "bg-warning-500"]}
                    />
                    <AnalyticsChart
                      title="Score margins"
                      description="Completed games grouped by winning margin."
                      values={[
                        { label: "Close · 1–2 points", value: data.scores.close },
                        { label: "Moderate · 3–5 points", value: data.scores.moderate },
                        { label: "Wide · 6+ points", value: data.scores.lopsided },
                      ]}
                      colors={["bg-primary-500", "bg-warning-500", "bg-danger-500"]}
                    />
                    <Card variant="bordered" className="lg:col-span-2 p-4">
                      <p className="text-sm text-text-secondary">
                        Average final score: <span className="font-semibold text-text-primary">{data.scores.avg_winning ?? "—"} to {data.scores.avg_losing ?? "—"}</span>
                      </p>
                    </Card>
                  </Grid>

                  <Card variant="bordered" className="p-5 sm:p-6">
                    <Flex justify="between" wrap gap={3}>
                      <div>
                        <h2 className="font-semibold text-text-primary">Match duration</h2>
                        <p className="mt-1 text-xs text-text-secondary">Based on {data.time.counted_games} games between 1 minute and 3 hours.</p>
                      </div>
                      <Badge variant="success" size="sm">Observed data</Badge>
                    </Flex>
                    <Grid cols={3} gap={3} className="mt-5">
                      <StatCard label="Average" value={mins(data.time.avg_seconds)} note="Typical match length" />
                      <StatCard label="Fastest" value={mins(data.time.fastest_seconds)} note="Shortest counted match" />
                      <StatCard label="Longest" value={mins(data.time.longest_seconds)} note="Longest counted match" />
                    </Grid>
                  </Card>

                  <Card variant="bordered" className="p-5 sm:p-6">
                    <Flex justify="between" wrap gap={3} className="mb-4">
                      <div>
                        <h2 className="font-semibold text-text-primary">Top players</h2>
                        <p className="mt-1 text-xs text-text-secondary">Ranked from completed match results.</p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/admin/rankings">Full rankings →</Link>
                      </Button>
                    </Flex>
                    {data.top_players.length === 0 ? (
                      <EmptyState title="No ranked players yet" />
                    ) : (
                      <Grid cols={2} gap={2} className="md:grid-cols-2">
                        {data.top_players.map((player) => (
                          <Card key={player.player_id} variant="bordered" className="p-3 flex items-center justify-between gap-3 hover:bg-surface-sunken transition">
                            <Flex gap={3} align="center" className="min-w-0">
                              <Badge variant="success" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold">#{player.rank}</Badge>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-text-primary">{player.name}</p>
                                <p className="text-xs text-text-secondary">{player.wins}W · {player.losses}L · {player.draws}D</p>
                              </div>
                            </Flex>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-bold text-success-500">{player.win_rate}%</p>
                              <p className="text-[10px] text-text-secondary">{player.total_points} pts</p>
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