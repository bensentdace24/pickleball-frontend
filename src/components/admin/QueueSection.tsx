import type { QueueEntry } from "../../types";
import { formatTime } from "../../lib/format";
import { Button } from "../Button";
import { EmptyState, Spinner } from "../Feedback";
import { Section } from "../Section";
import { StatusBadge } from "../StatusBadge";

interface Props {
  entries: QueueEntry[] | null;
  loading: boolean;
  busy: boolean;
  canAssign: boolean;
  onCallNext: () => void;
  onAssign: () => void;
  onCancel: (entry: QueueEntry) => void;
}

export function QueueSection({
  entries,
  loading,
  busy,
  canAssign,
  onCallNext,
  onAssign,
  onCancel,
}: Props) {
  const hasWaiting = !!entries?.some((e) => e.status === "waiting");

  const actions = (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        disabled={busy || !hasWaiting}
        onClick={onCallNext}
      >
        Call Next
      </Button>
      <Button disabled={busy || !canAssign} onClick={onAssign}>
        Assign Players
      </Button>
    </div>
  );

  return (
    <Section title="Queue" action={actions}>
      {loading && !entries ? (
        <Spinner />
      ) : !entries || entries.length === 0 ? (
        <EmptyState
          title="Nobody is waiting"
          hint="Players who join the queue will show up here."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-3">Queue #</th>
                <th className="py-2 pr-3">Player</th>
                <th className="py-2 pr-3">Wants</th>
                <th className="py-2 pr-3">Joined At</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="py-3 pr-3 font-semibold">
                    #{entry.queue_number}
                  </td>
                  <td className="py-3 pr-3">{entry.player?.name ?? "—"}</td>
                  <td className="py-3 pr-3 text-xs capitalize text-slate-500">
                    {entry.match_type === "any" ? "Either" : entry.match_type}
                  </td>
                  <td className="py-3 pr-3">{formatTime(entry.joined_at)}</td>
                  <td className="py-3 pr-3">
                    <StatusBadge status={entry.status} />
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busy}
                      onClick={() => onCancel(entry)}
                    >
                      Cancel Queue
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
