import { Link } from "react-router-dom";
import { EmptyState, Spinner } from "../components/Feedback";
import { Section } from "../components/Section";
import { useAsync } from "../hooks/useAsync";
import { analyticsApi } from "../services/api";

function mins(seconds: number | null) {
  return seconds === null ? "—" : `${Math.round(seconds / 60)} min`;
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-slate-50 px-4 py-3">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function Bar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-500">
          {value} ({pct}%)
        </span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-blue-600"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, loading, error } = useAsync(analyticsApi.get, 15000);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-4">
          <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
            Analytics
          </h1>
          <Link
            to="/admin"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {loading && !data ? (
          <Spinner />
        ) : !data || data.total_games === 0 ? (
          <EmptyState
            title="No finished games yet"
            hint="Analytics appear once games are finished with scores."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card label="Games played" value={data.total_games} />
              <Card label="Players" value={data.total_players} />
              <Card label="Doubles games" value={data.doubles_games} />
              <Card label="Singles games" value={data.singles_games} />
            </div>

            <Section title="Top Players">
              <ul className="divide-y divide-slate-100 text-sm">
                {data.top_players.map((p) => (
                  <li
                    key={p.player_id}
                    className="flex items-center justify-between py-2"
                  >
                    <span>
                      <span className="mr-2 font-bold">#{p.rank}</span>
                      {p.name}
                    </span>
                    <span className="text-slate-500">
                      {p.wins}W-{p.losses}L-{p.draws}D · {p.win_rate}% wins ·{" "}
                      {p.total_points} pts
                    </span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Score Margins">
              <div className="flex flex-col gap-3">
                <Bar
                  label="Close games (won by 1 to 2)"
                  value={data.scores.close}
                  total={data.total_games}
                />
                <Bar
                  label="Moderate (won by 3 to 5)"
                  value={data.scores.moderate}
                  total={data.total_games}
                />
                <Bar
                  label="Lopsided (won by 6+)"
                  value={data.scores.lopsided}
                  total={data.total_games}
                />
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Average final score: {data.scores.avg_winning ?? "—"} to{" "}
                {data.scores.avg_losing ?? "—"}
              </p>
            </Section>

            <Section title="Time to Complete">
              <div className="grid grid-cols-3 gap-3">
                <Card label="Average" value={mins(data.time.avg_seconds)} />
                <Card label="Fastest" value={mins(data.time.fastest_seconds)} />
                <Card label="Longest" value={mins(data.time.longest_seconds)} />
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Based on {data.time.counted_games} games. Games under 1 minute
                or over 3 hours are left out (test clicks or games finished
                late).
              </p>
            </Section>
          </>
        )}
      </main>
    </div>
  );
}
