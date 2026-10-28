import { useState, useMemo } from "react";
import { AdminHeader } from "../components/admin/AdminHeader";
import { useAsync } from "../hooks/useAsync";
import { rankingsApi } from "../services/api";
import { EmptyState, Spinner } from "../components/Feedback";
import { TierBadge } from "../components/TierBadge";

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

// Icon Helper Components to prevent path/JSX errors
function PassIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

export default function RankingsPage() {
  const { data, loading, error } = useAsync(rankingsApi.list, 10000);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("All");

  // Top 3 Leaderboard Cards
  const topThree = useMemo(() => data?.slice(0, 3) || [], [data]);

  // Filtered List based on Search & Tier tab
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesTier =
        selectedTier === "All" ||
        item.tier?.toLowerCase() === selectedTier.toLowerCase();
      return matchesSearch && matchesTier;
    });
  }, [data, searchTerm, selectedTier]);

  return (
    <div className="min-h-screen bg-ink-950 font-sans text-cream-50">
      <AdminHeader active="rankings" />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Metric Cards Row */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
          <div className="rounded-2xl border border-ink-600 bg-ink-800 p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-cream-200">
              Active Courts
            </p>
            <p className="mt-2 text-2xl font-bold text-cream-50">
              4<span className="text-base font-normal text-mist-400">/6</span>
            </p>
          </div>

          <div className="rounded-2xl border border-ink-600 bg-ink-800 p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-cream-200">
              Open Ready
            </p>
            <p className="mt-2 text-2xl font-bold text-lime-400">1</p>
          </div>

          <div className="rounded-2xl border border-ink-600 bg-ink-800 p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-cream-200">
              Waiting Queue
            </p>
            <p className="mt-2 text-2xl font-bold text-sky-400">2</p>
          </div>

          <div className="rounded-2xl border border-ink-600 bg-ink-800 p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-cream-200">
              On-Deck Matchups
            </p>
            <p className="mt-2 text-2xl font-bold text-cream-50">1</p>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-ink-600 bg-ink-800 p-4 shadow-sm">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Kiosk Check-In
              </p>
              <p className="text-xs text-mist-400">Test walk-in approval</p>
            </div>
            <button className="flex items-center gap-1.5 rounded-xl border border-ink-600 bg-ink-700 px-3 py-1.5 text-xs font-semibold text-cream-100 transition-colors hover:bg-ink-600">
              Simulate
            </button>
          </div>
        </div>

        {/* Top 3 Featured Player Cards */}
        {topThree.length > 0 && (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {topThree.map((player, idx) => (
              <div
                key={player.player_id || idx}
                className={`relative rounded-2xl border bg-ink-800 p-5 shadow-sm transition-all ${
                  idx === 0
                    ? "border-amber-400 ring-1 ring-amber-400/50"
                    : "border-ink-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-amber-100/80 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                    #{player.rank || idx + 1}
                  </span>
                  <TierBadge tier={player.tier || "PRO"} />
                </div>

                <h3 className="mt-4 text-lg font-bold text-cream-50">
                  {player.name}
                </h3>

                <div className="mt-2 flex items-center justify-between text-xs font-medium text-cream-200">
                  <span>
                    {player.wins}W – {player.losses}L – {player.draws}D
                  </span>
                  <span className="font-bold text-lime-400">
                    {player.win_rate}% Win Rate
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Table Container */}
        <div className="overflow-hidden rounded-2xl border border-ink-600 bg-ink-800 shadow-sm">
          {/* Controls Bar: Search & Filters */}
          <div className="flex flex-col gap-4 border-b border-ink-600 p-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search club members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-ink-600 bg-ink-700 py-2 pl-10 pr-4 text-sm text-cream-50 placeholder:text-mist-400 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1 rounded-xl bg-ink-900 p-1 text-xs font-semibold text-cream-200">
              {["All", "Pro", "Advanced", "Intermediate", "Beginner"].map(
                (tier) => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`rounded-lg px-3 py-1.5 transition-all ${
                      selectedTier === tier
                        ? "bg-ink-700 text-lemon-600 shadow-sm"
                        : "text-cream-200 hover:text-cream-50"
                    }`}
                  >
                    {tier}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Feedback States */}
          {error && <p className="p-5 text-sm text-rose-400">{error}</p>}

          {loading && !data ? (
            <div className="p-12 text-center">
              <Spinner />
            </div>
          ) : !data || filteredData.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No players found"
                hint="Rankings appear once games are finished with scores."
              />
            </div>
          ) : (
            /* Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-cream-200">
                <thead className="border-b border-ink-600 bg-ink-900 text-[11px] font-bold uppercase tracking-wider text-cream-200">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-4">Tier</th>
                    <th className="py-3 px-4">Record</th>
                    <th className="min-w-[140px] py-3 px-4">Win %</th>
                    <th className="py-3 px-4">Point diff</th>
                    <th className="py-3 px-4">Points</th>
                    <th className="py-3 px-4">Avg Time</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-ink-600">
                  {filteredData.map((row) => (
                    <tr
                      key={row.player_id}
                      className="transition-colors hover:bg-ink-700/70"
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 font-bold text-mist-400">
                        #{row.rank}
                      </td>

                      {/* Player Name */}
                      <td className="py-3.5 px-4 font-semibold text-cream-50">
                        {row.name}
                      </td>

                      {/* Tier Badge */}
                      <td className="py-3.5 px-4">
                        <TierBadge tier={row.tier} />
                      </td>

                      {/* W-L-D Record */}
                      <td className="py-3.5 px-4 font-medium text-cream-100">
                        {row.wins}W – {row.losses}L – {row.draws}D
                      </td>

                      {/* Win Rate with Bar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-ink-600">
                            <div
                              className="h-full rounded-full bg-lemon-400"
                              style={{
                                width: `${Math.min(row.win_rate, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="font-semibold text-cream-100">
                            {row.win_rate}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold tabular-nums text-cream-100">
                        {row.point_diff > 0 ? "+" : ""}{row.point_diff}
                      </td>

                      {/* Points */}
                      <td className="py-3.5 px-4 font-medium text-cream-100">
                        {row.total_points}
                      </td>

                      {/* Avg Time */}
                      <td className="py-3.5 px-4 text-cream-200">
                        {formatDuration(row.avg_seconds)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="flex items-center gap-1 text-xs font-semibold text-cream-200 hover:text-lemon-600">
                            <PassIcon />
                            Pass
                          </button>
                        </div>
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
