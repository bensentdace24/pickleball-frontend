import { useState } from "react";
import type { Game } from "../../types";
import { Button } from "../Button";
import { Alert } from "../Feedback";

interface Props {
  game: Game;
  busy: boolean;
  error: string | null;
  onSubmit: (
    teamAScore: number,
    teamBScore: number,
    requeuePlayerIds: number[],
  ) => void;
  onClose: () => void;
}

export function FinishGameModal({
  game,
  busy,
  error,
  onSubmit,
  onClose,
}: Props) {
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [requeue, setRequeue] = useState<number[]>([]);

  const players = [
    ...(game.team_a?.players ?? []),
    ...(game.team_b?.players ?? []),
  ];
  const a = Number(scoreA);
  const b = Number(scoreB);
  const ready =
    scoreA !== "" &&
    scoreB !== "" &&
    Number.isInteger(a) &&
    Number.isInteger(b) &&
    a >= 0 &&
    b >= 0;

  function toggle(id: number) {
    setRequeue((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">
          Finish Game #{game.id}
        </h3>
        <p className="mt-1 text-sm text-slate-500">{game.court?.name}</p>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Team A
              {game.team_a?.players?.length
                ? ` (${game.team_a.players.map((p) => p.name).join(" / ")})`
                : ""}
            </label>
            <input
              type="number"
              min={0}
              value={scoreA}
              onChange={(e) => setScoreA(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-lg font-bold"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Team B
              {game.team_b?.players?.length
                ? ` (${game.team_b.players.map((p) => p.name).join(" / ")})`
                : ""}
            </label>
            <input
              type="number"
              min={0}
              value={scoreB}
              onChange={(e) => setScoreB(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-lg font-bold"
              placeholder="0"
            />
          </div>
        </div>

        {players.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">
                Put back in the queue?
              </p>
              <button
                type="button"
                onClick={() =>
                  setRequeue(
                    requeue.length === players.length
                      ? []
                      : players.map((p) => p.id),
                  )
                }
                className="text-xs text-blue-600 underline"
              >
                {requeue.length === players.length ? "Clear all" : "Select all"}
              </button>
            </div>
            <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {players.map((p) => (
                <li key={p.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={requeue.includes(p.id)}
                      onChange={() => toggle(p.id)}
                      className="h-4 w-4"
                    />
                    <span>{p.name}</span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-1 text-xs text-slate-500">
              Checked players join the back of the line with a new queue number.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4">
            <Alert type="error">{error}</Alert>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="success"
            disabled={busy || !ready}
            onClick={() => onSubmit(a, b, requeue)}
          >
            {busy ? "Saving…" : "Save & Finish Game"}
          </Button>
        </div>
      </div>
    </div>
  );
}
