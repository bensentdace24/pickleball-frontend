import { useState } from "react";
import type { Game } from "../../types";
import { Button } from "../Button";
import { Alert } from "../Feedback";
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../Dialog";
import { Input, Checkbox, Field } from "../form/Input";

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
    <Dialog open onClose={onClose} title={`Finish Game #${game.id}`} size="md">
      <DialogHeader>
        <DialogTitle>Finish Game #{game.id}</DialogTitle>
        <DialogDescription>{game.court?.name}</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`Team A${game.team_a?.players?.length ? ` (${game.team_a.players.map((p) => p.name).join(" / ")})` : ""}`}>
            <Input
              type="number"
              min={0}
              value={scoreA}
              onChange={(e) => setScoreA(e.target.value)}
              placeholder="0"
              className="text-center text-lg font-bold"
            />
          </Field>
          <Field label={`Team B${game.team_b?.players?.length ? ` (${game.team_b.players.map((p) => p.name).join(" / ")})` : ""}`}>
            <Input
              type="number"
              min={0}
              value={scoreB}
              onChange={(e) => setScoreB(e.target.value)}
              placeholder="0"
              className="text-center text-lg font-bold"
            />
          </Field>
        </div>

        {players.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">Put back in the queue?</p>
              <button
                type="button"
                onClick={() =>
                  setRequeue(
                    requeue.length === players.length
                      ? []
                      : players.map((p) => p.id),
                  )
                }
                className="text-xs text-primary-600 underline hover:text-primary-700"
              >
                {requeue.length === players.length ? "Clear all" : "Select all"}
              </button>
            </div>
            <div className="space-y-1 rounded-lg border border-border">
              {players.map((p) => (
                <Field key={p.id} className="flex items-center gap-3 px-3 py-2">
                  <Checkbox
                    checked={requeue.includes(p.id)}
                    onChange={() => toggle(p.id)}
                    label={p.name}
                  />
                </Field>
              ))}
            </div>
            <p className="text-xs text-text-tertiary">
              Checked players join the back of the line with a new queue number.
            </p>
          </div>
        )}

        {error && <Alert type="error">{error}</Alert>}

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="success" disabled={busy || !ready} onClick={() => onSubmit(a, b, requeue)}>
            {busy ? "Saving…" : "Save & Finish Game"}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}