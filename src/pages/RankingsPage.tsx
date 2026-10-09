import { Link } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { rankingsApi } from "../services/api";
import { EmptyState, Spinner } from "../components/Feedback";

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function RankingsPage() {
  const { data, loading, error } = useAsync(rankingsApi.list, 10000);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
            Player Rankings
          </h1>
          <Link
            to="/admin"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {loading && !data ? (
            <Spinner />
          ) : !data || data.length === 0 ? (
            <EmptyState
              title="No completed games yet"
              hint="Rankings appear once games are finished with scores."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2 pr-3">Rank</th>
                    <th className="py-2 pr-3">Player</th>
                    <th className="py-2 pr-3">W-L-D</th>
                    <th className="py-2 pr-3">Win %</th>
                    <th className="py-2 pr-3">Percentile</th>
                    <th className="py-2 pr-3">Points</th>
                    <th className="py-2 pr-3">Games</th>
                    <th className="py-2 pr-3">Avg Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((row) => (
                    <tr key={row.player_id}>
                      <td className="py-3 pr-3 font-bold text-slate-900">
                        #{row.rank}
                      </td>
                      <td className="py-3 pr-3">{row.name}</td>
                      <td className="py-3 pr-3">
                        {row.wins}-{row.losses}-{row.draws}
                      </td>
                      <td className="py-3 pr-3">{row.win_rate}%</td>
                      <td className="py-3 pr-3">Top {row.top_percent}%</td>
                      <td className="py-3 pr-3">{row.total_points}</td>
                      <td className="py-3 pr-3">{row.games_played}</td>
                      <td className="py-3 pr-3">
                        {formatDuration(row.avg_seconds)}
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
