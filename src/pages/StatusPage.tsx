import { useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { statusApi } from "../services/api";
import { Alert, Spinner } from "../components/Feedback";
import { StatusBadge } from "../components/StatusBadge";
import { formatWait, ordinal } from "../lib/format";
import type { RecentGame } from "../types";

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
  const { data, loading, error } = useAsync(
    () => statusApi.getByToken(token!),
    POLL_MS,
  );

  if (loading && !data) return <Spinner label="Loading your status…" />;
  if (error && !data)
    return (
      <div className="p-6">
        <Alert type="error">{error}</Alert>
      </div>
    );
  if (!data) return null;

  const { player, queue, matchup, stats, recent_games } = data;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-lg font-bold text-slate-900">{player.name}</h1>

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
              <div className="mt-4 flex items-center justify-between">
                <StatusBadge status={queue.status} />
                <span className="text-sm text-slate-500">
                  #{queue.queue_number}
                </span>
              </div>

              {queue.position !== null &&
                (queue.status === "waiting" || queue.status === "called") && (
                  <p className="mt-2 text-sm text-slate-700">
                    You're{" "}
                    <span className="font-semibold">
                      {ordinal(queue.position)}
                    </span>{" "}
                    in line.
                  </p>
                )}

              {(queue.status === "waiting" || queue.status === "called") &&
                formatWait(queue.estimated_minutes) && (
                  <p className="mt-1 text-sm text-slate-700">
                    Estimated wait:{" "}
                    <span className="font-semibold">
                      {formatWait(queue.estimated_minutes)}
                    </span>
                  </p>
                )}

              {queue.game && (
                <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm">
                  <p className="font-medium text-blue-900">
                    {queue.status === "completed" ? "Played on" : "Playing on"}{" "}
                    {queue.game.court?.name}
                  </p>
                  {queue.game.players && (
                    <p className="mt-1 text-blue-700">
                      With: {queue.game.players.map((p) => p.name).join(", ")}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {matchup && (
            <div className="mt-4 rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">
                {matchup.position === 1
                  ? "Up Next!"
                  : `Up Next #${matchup.position}`}
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
                <div className="rounded-md bg-blue-50 px-2 py-1.5">
                  <p className="font-semibold text-blue-900">Team A</p>
                  <p className="text-blue-800">
                    {matchup.team_a.map((p) => p.name).join(", ")}
                  </p>
                </div>
                <div className="rounded-md bg-amber-50 px-2 py-1.5">
                  <p className="font-semibold text-amber-900">Team B</p>
                  <p className="text-amber-800">
                    {matchup.team_b.map((p) => p.name).join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
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
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${resultStyles[g.result]}`}
                    >
                      {g.result}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
