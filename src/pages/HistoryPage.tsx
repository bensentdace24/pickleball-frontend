import { useEffect, useState, type FormEvent } from "react";
import { EmptyState, Spinner } from "../components/Feedback";
import { AdminHeader } from "../components/admin/AdminHeader";
import { useAsync } from "../hooks/useAsync";
import { gamesApi } from "../services/api";
import type { TeamResult } from "../types";
import { Page, Container, Card, Input, Button } from "../components";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/Table";

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
    <div className={won ? "font-semibold text-success-500" : "text-text-primary"}>
      {team?.players?.map((p) => p.name).join(", ") || "—"}
      <span className="ml-2 text-text-secondary">{team?.points ?? "-"}</span>
      {won && <span className="ml-1 text-xs text-success-500">(win)</span>}
    </div>
  );
}

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");

  const { data, loading, error, refresh } = useAsync(
    () => gamesApi.list("completed", { limit: 100, player: applied || undefined }),
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
    <Page withBackground>
      <AdminHeader active="history" />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Container size="full">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-success-500">Past play</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">Match history</h1>
            <p className="mt-1 text-sm text-text-secondary">Search completed games by player.</p>
          </div>
          <form onSubmit={submit} className="mb-4 flex gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by player name"
              className="w-full max-w-xs"
            />
            <Button type="submit">Search</Button>
            {applied && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setApplied(""); }}>
                Clear
              </Button>
            )}
          </form>

          <Card variant="bordered">
            {error && <div className="p-4"><div className="text-sm text-danger-600 dark:text-danger-400">{error}</div></div>}
            {loading && !data ? (
              <Spinner />
            ) : !data || data.length === 0 ? (
              <EmptyState
                title={applied ? "No games found for that player" : "No finished games yet"}
                description="Finished games with scores show up here."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Game</TableHead>
                      <TableHead>Finished</TableHead>
                      <TableHead>Court</TableHead>
                      <TableHead>Team A</TableHead>
                      <TableHead>Team B</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((g) => (
                      <TableRow key={g.id} clickable className="hover:bg-surface-sunken">
                        <TableCell className="font-semibold text-text-primary">#{g.id}</TableCell>
                        <TableCell className="text-text-secondary">
                          {g.completed_at ? new Date(g.completed_at).toLocaleString() : "—"}
                        </TableCell>
                        <TableCell>{g.court?.name ?? "—"}</TableCell>
                        <TableCell><Team team={g.team_a} /></TableCell>
                        <TableCell><Team team={g.team_b} /></TableCell>
                        <TableCell className="text-text-secondary">{duration(g.started_at, g.completed_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </Container>
      </main>
    </Page>
  );
}