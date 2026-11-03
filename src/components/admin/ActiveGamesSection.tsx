import type { Game } from "../../types";
import { formatTime } from "../../lib/format";
import { Button } from "../Button";
import { EmptyState, Spinner } from "../Feedback";
import { Section } from "../Section";
import { StatusBadge } from "../StatusBadge";
import { Card } from "../Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../Table";
import { Badge, Flex } from "../index";
import { useEffect, useState } from "react";

interface Props {
  games: Game[] | null;
  loading: boolean;
  busy: boolean;
  onFinish: (game: Game) => void;
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function TimeRemaining({ endsAt }: { endsAt: string }) {
  const now = useNow();
  const diffMs = new Date(endsAt).getTime() - now;
  const over = diffMs <= 0;
  const totalSec = Math.abs(Math.round(diffMs / 1000));
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  return (
    <Badge variant={over ? "danger" : "default"} size="sm">
      {over ? `+${mm}:${ss} over` : `${mm}:${ss} left`}
    </Badge>
  );
}

function TeamColumn({ team, color }: { team: { name: string }[]; color: "primary" | "warning" }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-text-secondary">
        {color === "primary" ? "Team A" : "Team B"}
      </p>
      <p className="mt-1 text-sm font-medium text-text-primary">
        {team.map((player) => player.name).join(" & ") || "Player details unavailable"}
      </p>
    </div>
  );
}

export function ActiveGamesSection({ games, loading, busy, onFinish }: Props) {
  return (
    <Section
      title="Active Matches"
      action={
        games && (
          <Badge variant="success" className="text-xs">
            {games.length} playing
          </Badge>
        )
      }
    >
      {loading && !games ? (
        <Spinner />
      ) : !games || games.length === 0 ? (
        <EmptyState
          title="No games in progress"
          description="Assign 4 players to an available court to start one."
        />
      ) : (
        <Card variant="bordered">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Court / Game</TableHead>
                <TableHead className="w-40">Status</TableHead>
                <TableHead className="w-48">Time</TableHead>
                <TableHead className="w-48">Team A</TableHead>
                <TableHead className="w-48">Team B</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => {
                // We need to get team info - for now use placeholder since we don't have getCourtTeams here
                // The actual team data would come from the game object
                return (
                  <TableRow key={game.id}>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-text-primary">
                          {game.court?.name ?? `Game #${game.id}`}
                        </span>
                        <span className="text-xs text-text-tertiary">#{game.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={game.status} />
                    </TableCell>
                    <TableCell className="text-sm">
                      <Flex gap={2} align="center">
                        {game.ends_at ? (
                          <TimeRemaining endsAt={game.ends_at} />
                        ) : (
                          <span className="text-text-secondary">
                            Started {formatTime(game.started_at)}
                          </span>
                        )}
                      </Flex>
                    </TableCell>
                    <TableCell>
                      <TeamColumn
                        team={game.team_a?.players?.map(p => ({ name: p.name })) ?? []}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <TeamColumn
                        team={game.team_b?.players?.map(p => ({ name: p.name })) ?? []}
                        color="warning"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="success"
                        disabled={busy}
                        onClick={() => onFinish(game)}
                      >
                        Finish match
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </Section>
  );
}