import { useState } from "react";
import type { QueueEntry } from "../../types";
import { formatTime } from "../../lib/format";
import { Button } from "../Button";
import { Alert } from "../Feedback";
import { StatusBadge } from "../StatusBadge";

interface Props {
  entries: QueueEntry[];
  busy: boolean;
  error: string | null;
  onSubmit: (
    assignments: { queue_id: number; side: 0 | 1 }[],
    durationMinutes?: number,
  ) => void;
  onClose: () => void;
}

export function FormMatchupModal({
  entries,
  busy,
  error,
  onSubmit,
  onClose,
}: Props) {
  const [matchSize, setMatchSize] = useState<2 | 4>(4);
  const [duration, setDuration] = useState<number | "">("");
  const [sides, setSides] = useState<Record<number, 0 | 1>>({});

  const perSide = matchSize / 2;
  const validIds = Object.keys(sides)
    .map(Number)
    .filter((id) => entries.some((e) => e.id === id));
  const countA = validIds.filter((id) => sides[id] === 0).length;
  const countB = validIds.filter((id) => sides[id] === 1).length;
  const ready = countA === perSide && countB === perSide;

  function changeMatchSize(size: 2 | 4) {
    setMatchSize(size);
    setSides({});
  }

  function setSide(id: number, side: 0 | 1) {
    setSides((cur) => {
      const next = { ...cur };
      if (next[id] === side) {
        delete next[id];
        return next;
      }
      const countOnSide = Object.values(next).filter((s) => s === side).length;
      if (countOnSide >= perSide) return cur;
      next[id] = side;
      return next;
    });
  }

  function submit() {
    const assignments = validIds.map((id) => ({
      queue_id: id,
      side: sides[id],
    }));
    onSubmit(assignments, duration || undefined);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">
          Form an upcoming matchup
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          No court needed yet — this just reserves the pairing.
        </p>

        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700">Match type</p>
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={() => changeMatchSize(4)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                matchSize === 4
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-300 text-slate-600"
              }`}
            >
              Doubles (4)
            </button>
            <button
              type="button"
              onClick={() => changeMatchSize(2)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                matchSize === 2
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-300 text-slate-600"
              }`}
            >
              Singles (2)
            </button>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700">Time limit</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {[
              { label: "No limit", value: "" as const },
              { label: "30 min", value: 30 },
              { label: "1 hr", value: 60 },
              { label: "1.5 hr", value: 90 },
              { label: "2 hr", value: 120 },
            ].map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setDuration(opt.value)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                  duration === opt.value
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 text-slate-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-sm font-medium text-slate-700">
          Team A ({countA}/{perSide}) &nbsp;vs&nbsp; Team B ({countB}/{perSide})
        </p>
        <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {entries.map((entry) => {
            const side = sides[entry.id];
            return (
              <li
                key={entry.id}
                className="flex items-center gap-2 px-3 py-2.5 text-sm"
              >
                <span className="font-semibold">#{entry.queue_number}</span>
                <span className="flex-1">{entry.player?.name}</span>
                <span className="hidden text-slate-500 sm:inline">
                  {formatTime(entry.joined_at)}
                </span>
                <StatusBadge status={entry.status} />
                <button
                  type="button"
                  onClick={() => setSide(entry.id, 0)}
                  disabled={side !== 0 && countA >= perSide}
                  className={`rounded-md px-2 py-1 text-xs font-semibold ${
                    side === 0
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 disabled:opacity-40"
                  }`}
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setSide(entry.id, 1)}
                  disabled={side !== 1 && countB >= perSide}
                  className={`rounded-md px-2 py-1 text-xs font-semibold ${
                    side === 1
                      ? "bg-amber-600 text-white"
                      : "bg-slate-100 text-slate-600 disabled:opacity-40"
                  }`}
                >
                  B
                </button>
              </li>
            );
          })}
        </ul>

        {error && (
          <div className="mt-4">
            <Alert type="error">{error}</Alert>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Close
          </Button>
          <Button disabled={busy || !ready} onClick={submit}>
            {busy ? "Forming…" : "Form Matchup"}
          </Button>
        </div>
      </div>
    </div>
  );
}
