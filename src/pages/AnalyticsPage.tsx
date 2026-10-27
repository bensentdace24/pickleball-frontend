import { Link } from "react-router-dom";
import { AnalyticsChart } from "../components/AnalyticsChart";
import { EmptyState, Spinner } from "../components/Feedback";
import { AdminHeader } from "../components/admin/AdminHeader";
import { useAsync } from "../hooks/useAsync";
import { analyticsApi } from "../services/api";

function mins(seconds: number | null) {
  return seconds === null ? "—" : `${Math.round(seconds / 60)} min`;
}

function StatCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <article className="rounded-2xl border border-ink-600 bg-ink-800 p-4 shadow-sm sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cream-200">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-cream-50">{value}</p>
      <p className="mt-1 text-xs text-mist-400">{note}</p>
    </article>
  );
}

export default function AnalyticsPage() {
  const { data, loading, error } = useAsync(analyticsApi.get, 15000);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <AdminHeader active="analytics" />

      <main className="mx-auto flex max-w-7xl flex-col gap-5 py-6 sm:py-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-400">Club insights</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-cream-50 sm:text-3xl">Analytics</h1>
          <p className="mt-1 text-sm text-cream-200">Match results and participation from completed games.</p>
        </div>
        {error && <div className="rounded-xl border border-rose-400/35 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-300">Couldn't refresh analytics: {error}</div>}
        {loading && !data ? (
          <Spinner label="Loading club analytics…" />
        ) : !data ? (
          <EmptyState title="Analytics are unavailable" hint="Check the connection and try again." />
        ) : (
          <>
            <section aria-label="Analytics overview" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Completed matches" value={data.total_games} note="All-time completed games" />
              <StatCard label="Players" value={data.total_players} note="Players with a completed match" />
              <StatCard label="Singles matches" value={data.singles_games} note="One player per side" />
              <StatCard label="Doubles matches" value={data.doubles_games} note="Two players per side" />
            </section>

            {data.total_games === 0 ? (
              <EmptyState title="No finished matches yet" hint="Match analytics will appear after games are completed and scored." />
            ) : (
              <>
                <section className="grid gap-4 lg:grid-cols-2">
                  <AnalyticsChart
                    title="Participation by format"
                    description="Completed singles and doubles matches."
                    values={[
                      { label: "Singles", value: data.singles_games },
                      { label: "Doubles", value: data.doubles_games },
                    ]}
                    colors={["bg-lime-400", "bg-amber-400"]}
                  />
                  <AnalyticsChart
                    title="Score margins"
                    description="Completed games grouped by winning margin."
                    values={[
                      { label: "Close · 1–2 points", value: data.scores.close },
                      { label: "Moderate · 3–5 points", value: data.scores.moderate },
                      { label: "Wide · 6+ points", value: data.scores.lopsided },
                    ]}
                    colors={["bg-sky-400", "bg-amber-400", "bg-rose-400"]}
                  />
                  <div className="lg:col-span-2 rounded-xl border border-ink-600 bg-ink-800 px-4 py-3 text-sm text-cream-200">
                    Average final score: <span className="font-semibold text-cream-50">{data.scores.avg_winning ?? "—"} to {data.scores.avg_losing ?? "—"}</span>
                  </div>
                </section>

                <section className="rounded-2xl border border-ink-600 bg-ink-800 p-5 shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-cream-50">Match duration</h2>
                      <p className="mt-1 text-xs text-cream-200">Based on {data.time.counted_games} games between 1 minute and 3 hours.</p>
                    </div>
                    <span className="rounded-full border border-lime-400/30 bg-lime-400/[0.08] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-lime-400">Observed data</span>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <StatCard label="Average" value={mins(data.time.avg_seconds)} note="Typical match length" />
                    <StatCard label="Fastest" value={mins(data.time.fastest_seconds)} note="Shortest counted match" />
                    <StatCard label="Longest" value={mins(data.time.longest_seconds)} note="Longest counted match" />
                  </div>
                </section>

                <section className="rounded-2xl border border-ink-600 bg-ink-800 p-5 shadow-sm sm:p-6">
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-cream-50">Top players</h2>
                      <p className="mt-1 text-xs text-cream-200">Ranked from completed match results.</p>
                    </div>
                    <Link to="/admin/rankings" className="text-xs font-semibold text-lemon-600 hover:underline">Full rankings →</Link>
                  </div>
                  {data.top_players.length === 0 ? (
                    <EmptyState title="No ranked players yet" />
                  ) : (
                    <ol className="grid gap-2 md:grid-cols-2">
                      {data.top_players.map((player) => (
                        <li key={player.player_id} className="flex items-center justify-between gap-3 rounded-xl bg-ink-900 px-3 py-3 transition hover:bg-ink-700">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime-400/15 text-xs font-bold text-lime-400">#{player.rank}</span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-cream-50">{player.name}</p>
                              <p className="text-xs text-cream-200">{player.wins}W · {player.losses}L · {player.draws}D</p>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold text-lime-400">{player.win_rate}%</p>
                            <p className="text-[10px] text-cream-200">{player.total_points} pts</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
