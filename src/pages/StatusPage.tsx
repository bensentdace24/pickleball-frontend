import { useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { statusApi } from "../services/api";
import { Alert, Spinner } from "../components/Feedback";
import { StatusBadge } from "../components/StatusBadge";
import { formatWait, ordinal } from "../lib/format";
import type { RecentGame } from "../types";
import { useState } from "react";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { TierBadge } from "../components/TierBadge";
import { MiniCourt } from "../components/MiniCourt";

const POLL_MS = 4000;

const resultStyles: Record<RecentGame["result"], string> = {
  win: "bg-green-100 text-green-800",
  loss: "bg-red-100 text-red-800",
  draw: "bg-slate-200 text-slate-700",
};

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
      <div className="p-6">
        <Alert type="error">{error}</Alert>
      </div>
    );
  if (!data) return null;

  const { player, queue, matchup, stats, recent_games, rank, active_courts } = data;
  const gameTeamA = queue?.game?.team_a?.players ?? [];
  const gameTeamB = queue?.game?.team_b?.players ?? [];
  const playerIsOnTeamA = gameTeamA.some((teamPlayer) => teamPlayer.id === player.id);
  const ownTeam = playerIsOnTeamA ? gameTeamA : gameTeamB;
  const opposingTeam = playerIsOnTeamA ? gameTeamB : gameTeamA;

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Player waiting room</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Welcome, {player.name}</h1>
            <p className="mt-1 text-sm text-slate-500">Your place in line and match updates are refreshed automatically.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live updates · every 4 sec
          </div>
        </div>

        {error && <div className="mb-4"><Alert type="error">Live update issue: {error}. Showing your last update.</Alert></div>}

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">Your queue status</p>

          {!queue && (
            <p className="mt-3 text-sm text-slate-500">
              You're not currently in the queue.
            </p>
          )}

          {queue && queue.status === "pending" && (
            <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Registered! Please see the front desk to confirm your spot.
            </div>
          )}

          {queue && queue.status !== "pending" && (
            <>
              <div className="mt-4 flex items-center justify-between gap-3">
                <StatusBadge status={queue.status} />
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Queue #{queue.queue_number}</span>
              </div>

              {queue.position !== null &&
                (queue.status === "waiting" || queue.status === "called") && (
                  <div className="mt-4 rounded-xl bg-slate-900 p-5 text-white shadow-md shadow-slate-900/10 sm:p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Your place in line</p>
                    <div className="mt-1 flex items-end justify-between gap-4">
                      <p className="text-5xl font-bold tracking-tight">{ordinal(queue.position)}</p>
                      <div className="rounded-xl bg-white/10 px-3 py-2 text-right ring-1 ring-white/15">
                        <p className="text-xl font-bold">{Math.max(queue.position - 1, 0)}</p>
                      <p className="text-[10px] text-slate-300">ahead of you</p>
                      </div>
                    </div>
                    {(queue.status === "waiting" || queue.status === "called") && formatWait(queue.estimated_minutes) && (
                      <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-300 px-3 py-1.5 text-xs font-bold text-amber-950">
                        <span aria-hidden="true">◷</span> Estimated wait: {formatWait(queue.estimated_minutes)}
                      </p>
                    )}
                  </div>
                )}

              {queue.game && (
                <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm">
                  <p className="font-semibold text-blue-950">
                    {queue.status === "completed" ? "Played on" : "Playing on"}{" "}
                    {queue.game.court?.name}
                  </p>
                  {opposingTeam.length > 0 ? (
                    <div className="mt-2 grid gap-1 text-xs text-blue-800 sm:grid-cols-2">
                      <p><span className="font-semibold">With:</span> {ownTeam.map((p) => p.name).join(" · ") || player.name}</p>
                      <p><span className="font-semibold">Opponents:</span> {opposingTeam.map((p) => p.name).join(" · ")}</p>
                    </div>
                  ) : queue.game.players && <p className="mt-2 text-xs text-blue-800">On court: {queue.game.players.map((p) => p.name).join(" · ")}</p>}
                </div>
              )}
            </>
          )}

          {matchup && (
            <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50/60 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-sky-800">
                {matchup.position === 1
                  ? "Your match is next"
                  : `Upcoming matchup · #${matchup.position}`}
              </p>
              {formatWait(matchup.estimated_minutes) && (
                <p className="mt-1 text-xs text-slate-600">
                  Expected to start in {formatWait(matchup.estimated_minutes)}
                </p>
              )}
              {matchup.skill_warning && (
                <p className="mt-1 rounded-md bg-orange-50 px-2 py-1 text-xs text-orange-700">
                  ⚠️ {matchup.skill_warning}
                </p>
              )}
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
                  <p className="text-xs font-bold uppercase tracking-wider text-sky-800">Team A</p>
                  <p className="mt-1 text-blue-950">
                    {matchup.team_a.map((p) => p.name).join(", ")}
                  </p>
                </div>
                <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-amber-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Team B</p>
                  <p className="mt-1 text-amber-950">
                    {matchup.team_b.map((p) => p.name).join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}
          {queue && ["pending", "waiting", "called"].includes(queue.status) && (
            <div className="mt-4">
              {cancelError && (
                <div className="mb-2">
                  <Alert type="error">{cancelError}</Alert>
                </div>
              )}
              <Button
                variant="danger"
                className="w-full"
                disabled={busy}
                onClick={() => setConfirmOpen(true)}
              >
                Cancel my spot
              </Button>
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">My Rank</h2>
            <TierBadge tier={rank.tier} />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {rank.points}{" "}
            <span className="text-sm font-medium text-slate-500">
              rank points
            </span>
          </p>
          <div className="mt-3 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${rank.progress_percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {rank.next_tier
              ? `${rank.points_to_next} points to ${rank.next_tier}`
              : "You reached the top tier!"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">My Record</h2>

          {stats.games_played === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              No finished games yet. Your record shows up here after your first
              game.
            </p>
          ) : (
            <>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "Wins", value: stats.wins },
                  { label: "Losses", value: stats.losses },
                  { label: "Draws", value: stats.draws },
                  { label: "Points", value: stats.total_points },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg bg-slate-50 px-2 py-2"
                  >
                    <p className="text-lg font-bold text-slate-900">
                      {s.value}
                    </p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {stats.games_played} games played · avg{" "}
                {minutes(stats.avg_seconds)} per game
              </p>

              <ul className="mt-4 divide-y divide-slate-100 text-sm">
                {recent_games.map((g) => (
                  <li
                    key={g.game_id}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {g.my_points} – {g.their_points}
                      </p>
                      <p className="text-xs text-slate-500">
                        {g.court} ·{" "}
                        {new Date(g.completed_at).toLocaleDateString()} ·{" "}
                        {minutes(g.duration_seconds)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {g.rank_change !== null &&
                        g.rank_change !== undefined && (
                          <span
                            className={`text-xs font-semibold ${g.rank_change >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {g.rank_change >= 0 ? "+" : ""}
                            {g.rank_change} RP
                          </span>
                        )}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${resultStyles[g.result]}`}
                      >
                        {g.result}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        </div>

        <section className="mt-6" aria-labelledby="live-courts-heading">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Around the club</p>
              <h2 id="live-courts-heading" className="mt-1 text-lg font-bold text-slate-950">Live courts</h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800">
              <span className="court-live-dot court-live-dot--playing" />
              {active_courts.length} {active_courts.length === 1 ? "match" : "matches"} in play
            </span>
          </div>
          {active_courts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {active_courts.map((court) => (
                <MiniCourt key={court.id} court={court} mode="player" />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-5 py-8 text-center">
              <p className="text-sm font-semibold text-slate-700">No matches are on court right now</p>
              <p className="mt-1 text-xs text-slate-500">Active courts will appear here automatically when play begins.</p>
            </div>
          )}
        </section>
      </div>
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
    </div>
  );
}
