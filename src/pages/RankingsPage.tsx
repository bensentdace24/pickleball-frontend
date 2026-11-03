import { useState, useMemo } from "react";
import { AdminHeader } from "../components/admin/AdminHeader";
import { useAsync } from "../hooks/useAsync";
import { rankingsApi } from "../services/api";
import { EmptyState, Spinner, Alert } from "../components/Feedback";
import { TierBadge } from "../components/TierBadge";
import { Page, Card, Badge, Input, Flex, Grid, Button } from "../components";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/Table";

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

// Icon Helper Components to prevent path/JSX errors
function PassIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTier = selectedTier === "All" || item.tier?.toLowerCase() === selectedTier.toLowerCase();
      return matchesSearch && matchesTier;
    });
  }, [data, searchTerm, selectedTier]);

  return (
    <Page withBackground>
      <AdminHeader active="rankings" />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Metric Cards Row */}
        <Grid cols={4} gap={4} className="mb-6 grid-cols-1 sm:grid-cols-2">
          <Card variant="bordered" className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Active Courts</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">4 <span className="text-base font-normal text-text-tertiary">/6</span></p>
          </Card>

          <Card variant="bordered" className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Open Ready</p>
            <p className="mt-2 text-2xl font-bold text-success-500">1</p>
          </Card>

          <Card variant="bordered" className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Waiting Queue</p>
            <p className="mt-2 text-2xl font-bold text-primary-500">2</p>
          </Card>

          <Card variant="bordered" className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">On-Deck Matchups</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">1</p>
          </Card>

          <Card variant="bordered" className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-warning-500">Kiosk Check-In</p>
              <p className="text-xs text-text-tertiary">Test walk-in approval</p>
            </div>
            <Button variant="outline" size="sm">Simulate</Button>
          </Card>
        </Grid>

        {/* Top 3 Featured Player Cards */}
        {topThree.length > 0 && (
          <Grid cols={3} gap={4} className="mb-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {topThree.map((player, idx) => (
              <Card key={player.player_id || idx} variant={idx === 0 ? "elevated" : "bordered"} className="p-5 relative">
                <Flex justify="between">
                  <Badge variant="warning" size="sm">#{player.rank || idx + 1}</Badge>
                  <TierBadge tier={player.tier || "PRO"} />
                </Flex>

                <h3 className="mt-4 text-lg font-bold text-text-primary">{player.name}</h3>

                <Flex justify="between" className="mt-2 text-xs font-medium text-text-secondary">
                  <span>{player.wins}W – {player.losses}L – {player.draws}D</span>
                  <span className="font-bold text-success-500">{player.win_rate}% Win Rate</span>
                </Flex>
              </Card>
            ))}
          </Grid>
        )}

        {/* Main Table Container */}
        <Card variant="bordered" className="overflow-hidden">
          {/* Controls Bar: Search & Filters */}
          <Flex justify="between" wrap gap={4} className="border-b border-border p-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <SearchIcon />
              <Input
                type="text"
                placeholder="Search club members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1 rounded-xl bg-surface-sunken p-1 text-xs font-semibold text-text-secondary">
              {["All", "Pro", "Advanced", "Intermediate", "Beginner"].map((tier) => (
                <Button
                  key={tier}
                  variant={selectedTier === tier ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedTier(tier)}
                >
                  {tier}
                </Button>
              ))}
            </div>
          </Flex>

          {/* Feedback States */}
          {error && <Alert type="error" className="p-5">{error}</Alert>}

          {loading && !data ? (
            <div className="p-12 text-center"><Spinner /></div>
          ) : !data || filteredData.length === 0 ? (
            <EmptyState title="No players found" description="Rankings appear once games are finished with scores." className="p-8" />
          ) : (
            /* Table */
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Record</TableHead>
                    <TableHead className="min-w-[140px]">Win %</TableHead>
                    <TableHead>Point diff</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Avg Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row) => (
                    <TableRow key={row.player_id} clickable className="hover:bg-surface-sunken">
                      <TableCell className="font-bold text-text-tertiary">#{row.rank}</TableCell>
                      <TableCell className="font-semibold text-text-primary">{row.name}</TableCell>
                      <TableCell><TierBadge tier={row.tier} /></TableCell>
                      <TableCell className="font-medium text-text-primary">{row.wins}W – {row.losses}L – {row.draws}D</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                            <div
                              className="h-full rounded-full bg-warning-500"
                              style={{ width: `${Math.min(row.win_rate, 100)}%` }}
                            />
                          </div>
                          <span className="font-semibold text-text-primary">{row.win_rate}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold tabular-nums text-text-primary">{row.point_diff > 0 ? "+" : ""}{row.point_diff}</TableCell>
                      <TableCell className="font-medium text-text-primary">{row.total_points}</TableCell>
                      <TableCell className="text-text-secondary">{formatDuration(row.avg_seconds)}</TableCell>
                      <TableCell className="text-right">
                        <Flex justify="end" gap={2}>
                          <Button variant="ghost" size="sm" icon={<PassIcon />} iconPosition="left">Pass</Button>
                        </Flex>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </main>
    </Page>
  );
}