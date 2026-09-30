import type { Game } from "../../types";
import { formatTime } from "../../lib/format";
import { Button } from "../Button";
import { EmptyState, Spinner } from "../Feedback";
import { Section } from "../Section";
import { StatusBadge } from "../StatusBadge";

interface Props {
  games: Game[] | null;
  loading: boolean;
  busy: boolean;
  onFinish: (game: Game) => void;
}

export function ActiveGamesSection({ games, loading, busy, onFinish }: Props) {
  return (
    <Section title="Active Games">
      {loading && !games ? (
        <Spinner />
      ) : !games || games.length === 0 ? (
        <EmptyState
          title="No games in progress"
          hint="Assign 4 players to an available court to start one."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-3">Game #</th>
                <th className="py-2 pr-3">Court</th>
                <th className="py-2 pr-3">Players</th>
                <th className="py-2 pr-3">Started At</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {games.map((game) => (
                <tr key={game.id}>
                  <td className="py-3 pr-3 font-semibold">#{game.id}</td>
                  <td className="py-3 pr-3">{game.court?.name ?? "—"}</td>
                  <td className="py-3 pr-3">
                    {game.players?.map((p) => p.name).join(", ") ?? "—"}
                  </td>
                  <td className="py-3 pr-3">{formatTime(game.started_at)}</td>
                  <td className="py-3 pr-3">
                    <StatusBadge status={game.status} />
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      size="sm"
                      variant="success"
                      disabled={busy}
                      onClick={() => onFinish(game)}
                    >
                      Game Finished
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}
