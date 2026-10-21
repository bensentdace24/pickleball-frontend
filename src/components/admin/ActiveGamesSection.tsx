import type { Game } from "../../types";
import { formatTime } from "../../lib/format";
import { Button } from "../Button";
import { EmptyState, Spinner } from "../Feedback";
import { Section } from "../Section";
import { StatusBadge } from "../StatusBadge";
import { getCourtTeams } from "../../lib/courtDisplay";
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
    <span className={over ? "font-semibold text-red-600" : "text-slate-700"}>
      {over ? `+${mm}:${ss} over` : `${mm}:${ss} left`}
    </span>
  );
}

export function ActiveGamesSection({ games, loading, busy, onFinish }: Props) {
  return (
    <Section
      title="Active Matches Roster"
      action={games && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">{games.length} playing</span>}
    >
      {loading && !games ? (
        <Spinner />
      ) : !games || games.length === 0 ? (
        <EmptyState
          title="No games in progress"
          hint="Assign 4 players to an available court to start one."
        />
      ) : (
        <div className="grid gap-3">
          {games.map((game) => {
            const { teamA, teamB } = getCourtTeams(game);
            return (
              <article key={game.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 transition-colors hover:border-sky-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{game.court?.name ?? `Game #${game.id}`}</h3>
                    <span className="text-xs text-slate-500">#{game.id}</span>
                    <StatusBadge status={game.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {game.ends_at ? <TimeRemaining endsAt={game.ends_at} /> : <span className="text-slate-500">Started {formatTime(game.started_at)}</span>}
                    <Button size="sm" variant="success" disabled={busy} onClick={() => onFinish(game)}>Finish match</Button>
                  </div>
                </div>
                {game.skill_warning && <p className="mt-2 text-xs text-amber-700" title={game.skill_warning}>Player level note: {game.skill_warning}</p>}
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-sky-200 bg-white px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-sky-700">Team A</p>
                    <p className="mt-1 text-xs font-medium text-slate-800">{teamA.map((player) => player.name).join(" & ") || "Player details unavailable"}</p>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-white px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Team B</p>
                    <p className="mt-1 text-xs font-medium text-slate-800">{teamB.map((player) => player.name).join(" & ") || "Player details unavailable"}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Section>
  );
}
