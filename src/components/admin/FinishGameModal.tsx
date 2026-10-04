import { useState } from "react";
import type { Game } from "../../types";
import { Button } from "../Button";
import { Alert } from "../Feedback";

interface Props {
  game: Game;
  busy: boolean;
  error: string | null;
  onSubmit: (teamAScore: number, teamBScore: number) => void;
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

  const a = Number(scoreA);
  const b = Number(scoreB);
  const ready =
    scoreA !== "" &&
    scoreB !== "" &&
    Number.isInteger(a) &&
    Number.isInteger(b) &&
    a >= 0 &&
    b >= 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
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
            onClick={() => onSubmit(a, b)}
          >
            {busy ? "Saving…" : "Save & Finish Game"}
          </Button>
        </div>
      </div>
    </div>
  );
}
