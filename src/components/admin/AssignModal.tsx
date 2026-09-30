import { useState } from "react";
import type { Court, QueueEntry } from "../../types";
import { formatTime } from "../../lib/format";
import { Button } from "../Button";
import { Alert } from "../Feedback";
import { StatusBadge } from "../StatusBadge";

interface Props {
  courts: Court[];
  entries: QueueEntry[];
  initialCourtId: number | null;
  busy: boolean;
  error: string | null;
  onSubmit: (courtId: number, queueIds: number[]) => void;
  onClose: () => void;
}

export function AssignModal({
  courts,
  entries,
  initialCourtId,
  busy,
  error,
  onSubmit,
  onClose,
}: Props) {
  const [courtId, setCourtId] = useState<number | "">(
    initialCourtId ?? courts[0]?.id ?? "",
  );
  const [selected, setSelected] = useState<number[]>(() =>
    entries.slice(0, 4).map((e) => e.id),
  );

  // ignore anyone who left the queue since the modal opened
  const valid = selected.filter((id) => entries.some((e) => e.id === id));
  const ready = courtId !== "" && valid.length === 4;

  function toggle(id: number) {
    setSelected((cur) =>
      cur.includes(id)
        ? cur.filter((x) => x !== id)
        : cur.length < 4
          ? [...cur, id]
          : cur,
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">
          Assign players to a court
        </h3>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Court
          <select
            value={courtId}
            onChange={(e) => setCourtId(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            {courts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <p className="mt-4 text-sm font-medium text-slate-700">
          Players{" "}
          <span className="text-slate-500">({valid.length}/4 selected)</span>
        </p>
        <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {entries.map((entry) => {
            const checked = valid.includes(entry.id);
            return (
              <li key={entry.id}>
                <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!checked && valid.length >= 4}
                    onChange={() => toggle(entry.id)}
                    className="h-4 w-4"
                  />
                  <span className="font-semibold">#{entry.queue_number}</span>
                  <span className="flex-1">{entry.player?.name}</span>
                  <span className="text-slate-500">
                    {formatTime(entry.joined_at)}
                  </span>
                  <StatusBadge status={entry.status} />
                </label>
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
          <Button
            disabled={busy || !ready}
            onClick={() => onSubmit(Number(courtId), valid)}
          >
            {busy ? "Starting…" : "Assign & Start Game"}
          </Button>
        </div>
      </div>
    </div>
  );
}
