import type { QueueEntry } from "../../types";
import { ordinal } from "../../lib/format";
import { Button } from "../Button";
import { StatusBadge } from "../StatusBadge";

interface Props {
  entry: QueueEntry;
  busy: boolean;
  onCancel: () => void;
  onLeave: () => void;
}

export function QueueStatusCard({ entry, busy, onCancel, onLeave }: Props) {
  const canCancel = entry.status === "waiting" || entry.status === "called";
  const isPending = entry.status === "pending";
  const game = entry.game;

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between">
        {isPending && (
          <div className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Registered! Please see the front desk to confirm your spot and get
            your queue number.
          </div>
        )}
        <div>
          <p className="text-sm text-slate-500">Player</p>
          <p className="text-lg font-bold text-slate-900">
            {entry.player?.name}
          </p>
        </div>
        <StatusBadge status={entry.status} />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-slate-500">Queue Number</dt>
          <dd className="text-xl font-bold text-slate-900">
            #{entry.queue_number}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Position</dt>
          <dd className="text-xl font-bold text-slate-900">
            {entry.position ? ordinal(entry.position) : "—"}
          </dd>
        </div>
      </dl>

      {game && (
        <div className="mt-5 rounded-lg bg-blue-50 p-3 text-sm">
          <p className="font-medium text-blue-900">
            {entry.status === "completed" ? "Played on" : "Playing on"}{" "}
            {game.court?.name}
          </p>
          {game.players && (
            <p className="mt-1 text-blue-700">
              With: {game.players.map((p) => p.name).join(", ")}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        {canCancel && (
          <Button
            variant="danger"
            disabled={busy}
            onClick={onCancel}
            className="flex-1"
          >
            Cancel My Spot
          </Button>
        )}
        {!canCancel && (
          <Button
            variant="secondary"
            disabled={busy}
            onClick={onLeave}
            className="flex-1"
          >
            Back to Join Form
          </Button>
        )}
      </div>
    </div>
  );
}
