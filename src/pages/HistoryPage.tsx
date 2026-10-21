import { useEffect, useState, type FormEvent } from "react";
import { EmptyState, Spinner } from "../components/Feedback";
import { AdminHeader } from "../components/admin/AdminHeader";
import { useAsync } from "../hooks/useAsync";
import { gamesApi } from "../services/api";
import type { TeamResult } from "../types";

function duration(start: string | null, end: string | null) {
  if (!start || !end) return "—";
  const mins = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000,
  );
  return `${mins} min`;
}

function Team({ team }: { team?: TeamResult }) {
  const won = team?.result === "win";
  return (
    <div className={won ? "font-semibold text-green-700" : "text-slate-700"}>
      {team?.players?.map((p) => p.name).join(", ") || "—"}
      <span className="ml-2 text-slate-900">{team?.points ?? "-"}</span>
      {won && <span className="ml-1 text-xs">(win)</span>}
    </div>
  );
}

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");

  const { data, loading, error, refresh } = useAsync(
    () =>
      gamesApi.list("completed", { limit: 100, player: applied || undefined }),
    15000,
  );

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applied]);

  function submit(e: FormEvent) {
    e.preventDefault();
    setApplied(search.trim());
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader active="history" />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Past play</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Match history</h1>
          <p className="mt-1 text-sm text-slate-500">Search completed games by player.</p>
        </div>
        <form onSubmit={submit} className="mb-4 flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by player name"
            className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Search
          </button>
          {applied && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setApplied("");
              }}
              className="text-sm text-slate-600 underline"
            >
              Clear
            </button>
          )}
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {loading && !data ? (
            <Spinner />
          ) : !data || data.length === 0 ? (
            <EmptyState
              title={
                applied
                  ? "No games found for that player"
                  : "No finished games yet"
              }
              hint="Finished games with scores show up here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2 pr-3">Game</th>
                    <th className="py-2 pr-3">Finished</th>
                    <th className="py-2 pr-3">Court</th>
                    <th className="py-2 pr-3">Team A</th>
                    <th className="py-2 pr-3">Team B</th>
                    <th className="py-2 pr-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((g) => (
                    <tr key={g.id}>
                      <td className="py-3 pr-3 font-semibold">#{g.id}</td>
                      <td className="py-3 pr-3">
                        {g.completed_at
                          ? new Date(g.completed_at).toLocaleString()
                          : "—"}
                      </td>
                      <td className="py-3 pr-3">{g.court?.name ?? "—"}</td>
                      <td className="py-3 pr-3">
                        <Team team={g.team_a} />
                      </td>
                      <td className="py-3 pr-3">
                        <Team team={g.team_b} />
                      </td>
                      <td className="py-3 pr-3">
                        {duration(g.started_at, g.completed_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
