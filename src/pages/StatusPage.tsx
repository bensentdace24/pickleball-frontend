import { useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { statusApi } from "../services/api";
import { Alert, Spinner } from "../components/Feedback";
import { StatusBadge } from "../components/StatusBadge";
import { formatWait, ordinal } from "../lib/format";
import { useState } from "react";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { TierBadge } from "../components/TierBadge";
import { MiniCourt } from "../components/MiniCourt";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Grid, Flex, Section, Container, Page, PageHeader } from "../components/layout/Page";

const POLL_MS = 4000;

function minutes(seconds: number | null) {
  return seconds === null ? "—" : `${Math.round(seconds / 60)} min`;
}

export default function StatusPage() {
  const { token } = useParams<{ token: string }>();
  const { data, loading, error, refresh } = useAsync(
    () => statusApi.getByToken(token!),
    POLL_MS,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  async function cancelSpot() {
    setBusy(true);
    setCancelError(null);
    try {
      await statusApi.cancel(token!);
      await refresh();
    } catch (e) {
      setCancelError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setConfirmOpen(false);
      setBusy(false);
    }
  }

  if (loading && !data) return <Spinner label="Loading your status…" />;
  if (error && !data)
    return (
      <Container size="lg" className="py-6">
        <Alert type="error">{error}</Alert>
      </Container>
    );
  if (!data) return null;

  const { player, queue, matchup, stats, recent_games, rank, active_courts } = data;
  const gameTeamA = queue?.game?.team_a?.players ?? [];
  const gameTeamB = queue?.game?.team_b?.players ?? [];
  const playerIsOnTeamA = gameTeamA.some((teamPlayer) => teamPlayer.id === player.id);
  const ownTeam = playerIsOnTeamA ? gameTeamA : gameTeamB;
  const opposingTeam = playerIsOnTeamA ? gameTeamB : gameTeamA;

  return (
    <>
      <Page withBackground>
        <Container size="xl" className="py-8 sm:py-12">
          <PageHeader
            title={`Welcome, ${player.name}`}
            subtitle="Your place in line and match updates are refreshed automatically."
            breadcrumbs={<span className="text-label text-team-a">Player waiting room</span>}
            actions={
              <Badge variant="primary" dot className="text-label">
                Live updates · every 4 sec
              </Badge>
            }
          />

          {error && <Alert type="error" className="mb-4">Live update issue: {error}. Showing your last update.</Alert>}

          <Grid cols={2} gap={4} className="lg:grid-cols-[1.15fr_0.85fr]">
            <Card variant="bordered" className="p-5 sm:p-7">
              <p className="text-label text-primary">Your queue status</p>

              {!queue && (
                <p className="mt-3 text-body text-text-secondary">You're not currently in the queue.</p>
              )}

              {queue && queue.status === "pending" && (
                <Alert type="warning" className="mt-3">
                  Registered! Please see the front desk to confirm your spot.
                </Alert>
              )}

              {queue && queue.status !== "pending" && (
                <>
                  <Flex align="center" justify="between" gap={3} className="mt-4">
                    <StatusBadge status={queue.status} />
                    <Badge variant="default" className="text-label">Queue #{queue.queue_number}</Badge>
                  </Flex>

                  {queue.position !== null &&
                    (queue.status === "waiting" || queue.status === "called") && (
                      <Card variant="elevated" className="mt-4 p-5 sm:p-6">
                        <p className="text-label text-text-tertiary">Your place in line</p>
                        <div className="mt-1 flex items-end justify-between gap-4">
                          <p className="text-stat font-bold tracking-tight text-text-primary animate-count-up">{ordinal(queue.position)}</p>
                          <div className="rounded-xl bg-surface-sunken px-3 py-2 text-right border border-border">
                            <p className="text-stat font-bold text-text-primary animate-count-up">{Math.max(queue.position - 1, 0)}</p>
                            <p className="text-label text-text-tertiary">ahead of you</p>
                          </div>
                        </div>
                        {(queue.status === "waiting" || queue.status === "called") && formatWait(queue.estimated_minutes) && (
                          <Badge variant="info" dot className="mt-3 text-label">
                            Estimated wait: {formatWait(queue.estimated_minutes)}
                          </Badge>
                        )}
                      </Card>
                    )}

                  {queue.game && queue.game.court && (
                    <>
                      <MiniCourt
                        key={queue.game.id}
                        court={queue.game.court}
                        mode="player"
                        compact
                      />
                      <Card variant="bordered" className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
                        <p className="font-semibold text-primary-900 dark:text-primary-300">
                          {queue.status === "completed" ? "Played on" : "Playing on"}{" "}
                          {queue.game.court.name}
                        </p>
                        {opposingTeam.length > 0 ? (
                          <div className="mt-2 grid gap-1 text-sm text-primary-800 dark:text-primary-400 sm:grid-cols-2">
                            <p><span className="font-semibold">With:</span> {ownTeam.map((p) => p.name).join(" · ") || player.name}</p>
                            <p><span className="font-semibold">Opponents:</span> {opposingTeam.map((p) => p.name).join(" · ")}</p>
                          </div>
                        ) : queue.game.players && (
                          <p className="mt-2 text-sm text-primary-800 dark:text-primary-400">On court: {queue.game.players.map((p) => p.name).join(" · ")}</p>
                        )}
                      </Card>
                    </>
                  )}
                </>
              )}

              {matchup && (
                <Card variant="bordered" className="mt-4 p-4">
                  <p className="text-label text-primary">
                    {matchup.position === 1
                      ? "Your match is next"
                      : `Upcoming matchup · #${matchup.position}`}
                  </p>
                  {formatWait(matchup.estimated_minutes) && (
                    <p className="mt-1 text-body text-text-secondary">
                      Expected to start in {formatWait(matchup.estimated_minutes)}
                    </p>
                  )}
                  {matchup.skill_warning && (
                    <Alert type="warning" className="mt-1">{matchup.skill_warning}</Alert>
                  )}
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Card variant="sunken" className="p-3 border-team-a">
                      <p className="text-label text-team-a">Team A</p>
                      <p className="mt-1 font-medium text-text-primary">{matchup.team_a.map((p) => p.name).join(", ")}</p>
                    </Card>
                    <Card variant="sunken" className="p-3 border-team-b">
                      <p className="text-label text-team-b">Team B</p>
                      <p className="mt-1 font-medium text-text-primary">{matchup.team_b.map((p) => p.name).join(", ")}</p>
                    </Card>
                  </div>
                </Card>
              )}
              {queue && ["pending", "waiting", "called"].includes(queue.status) && (
                <div className="mt-4">
                  {cancelError && <Alert type="error" className="mb-2">{cancelError}</Alert>}
                  <Button variant="danger" className="w-full" disabled={busy} onClick={() => setConfirmOpen(true)}>
                    Cancel my spot
                  </Button>
                </div>
              )}
            </Card>

            <Card variant="bordered" className="p-5 sm:p-6">
              <Flex justify="between">
                <h2 className="text-label text-text-primary">My Rank</h2>
                <TierBadge tier={rank.tier} />
              </Flex>
              <p className="mt-2 text-h2 font-bold text-text-primary animate-count-up">
                {rank.points}{" "}
                <span className="text-body font-medium text-text-secondary">rank points</span>
              </p>
              <div className="mt-3 h-2 rounded-full bg-surface-sunken border border-border">
                <div
                  className="h-2 rounded-full bg-primary animate-count-up"
                  style={{ width: `${rank.progress_percent}%` }}
                />
              </div>
              <p className="mt-2 text-body text-text-secondary">
                {rank.next_tier
                  ? `${rank.points_to_next} points to ${rank.next_tier}`
                  : "You reached the top tier!"}
              </p>
            </Card>

            <Card variant="bordered" className="p-5 sm:p-6 lg:col-span-2">
              <h2 className="text-label text-text-primary">My Record</h2>

              {stats.games_played === 0 ? (
                <p className="mt-3 text-body text-text-secondary">
                  No finished games yet. Your record shows up here after your first game.
                </p>
              ) : (
                <>
                  <Grid cols={4} gap={2} className="mt-3">
                    {[
                      { label: "Wins", value: stats.wins },
                      { label: "Losses", value: stats.losses },
                      { label: "Draws", value: stats.draws },
                      { label: "Points", value: stats.total_points },
                    ].map((s) => (
                      <Card key={s.label} variant="sunken" className="p-2 text-center">
                        <p className="text-stat font-bold text-text-primary animate-count-up">{s.value}</p>
                        <p className="text-label text-text-secondary">{s.label}</p>
                      </Card>
                    ))}
                  </Grid>
                  <p className="mt-2 text-body text-text-secondary">
                    {stats.games_played} games played · avg {minutes(stats.avg_seconds)} per game
                  </p>

                  <ul className="mt-4 divide-y divide-border">
                    {recent_games.map((g) => (
                      <li key={g.game_id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-text-primary tabular-nums">{g.my_points} – {g.their_points}</p>
                          <p className="text-body text-text-secondary">
                            {g.court} · {new Date(g.completed_at).toLocaleDateString()} · {minutes(g.duration_seconds)}
                          </p>
                        </div>
                        <Flex gap={2} align="center">
                          {g.rank_change !== null && g.rank_change !== undefined && (
                            <span className={`text-label font-semibold ${g.rank_change >= 0 ? "text-primary" : "text-danger"}`}>
                              {g.rank_change >= 0 ? "+" : ""}{g.rank_change} RP
                            </span>
                          )}
                          <Badge
                            variant={
                              g.result === "win" ? "success" :
                              g.result === "loss" ? "danger" : "default"
                            }
                            size="sm"
                          >
                            {g.result}
                          </Badge>
                        </Flex>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
          </Grid>

          <Section title="Live courts" subtitle="Around the club" className="mt-6" action={
            <Badge variant="primary" dot dotColor="var(--color-primary-500)" className="text-label">
              {active_courts.length} {active_courts.length === 1 ? "match" : "matches"} in play
            </Badge>
          }>
            {active_courts.length > 0 ? (
              <Grid cols={3} gap={4} className="sm:grid-cols-2">
                {active_courts.map((court) => (
                  <MiniCourt key={court.id} court={court} mode="player" />
                ))}
              </Grid>
            ) : (
              <Card variant="bordered" className="p-8 text-center border-dashed">
                <p className="text-body font-semibold text-text-secondary">No matches are on court right now</p>
                <p className="mt-1 text-label text-text-tertiary">Active courts will appear here automatically when play begins.</p>
              </Card>
            )}
          </Section>
        </Container>
      </Page>
      <ConfirmDialog
        open={confirmOpen}
        danger
        busy={busy}
        title="Cancel your spot?"
        message={
          matchup
            ? "You're in an Up Next match. Cancelling removes you from the queue and breaks up that match, so your teammates go back to waiting. To play again, register at the front desk."
            : "You will be removed from the queue. To play again, register at the front desk."
        }
        confirmLabel="Cancel my spot"
        onConfirm={cancelSpot}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}