import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { EmptyState, Spinner } from "../components/Feedback";
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
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4">
          <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
            Match History
          </h1>
          <Link
            to="/admin"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
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

        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
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
