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
  onAssign: () => void;
  onCancel: (entry: QueueEntry) => void;
}

export function QueueSection({
  entries,
  loading,
  busy,
  canAssign,
  onAssign,
  onCancel,
}: Props) {
  const actions = (
    <Button disabled={busy || !canAssign} onClick={onAssign}>
      Assign Players
    </Button>
  );

  return (
    <Section
      title="Waiting Queue"
      action={
        <div className="flex items-center gap-2">
          {entries && <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800">{entries.length} waiting</span>}
          {actions}
        </div>
      }
    >
      {loading && !entries ? (
        <Spinner />
      ) : !entries || entries.length === 0 ? (
        <EmptyState
          title="Nobody is waiting"
          hint="Players who join the queue will show up here."
        />
      ) : (
        <div className="divide-y divide-slate-100">
          {entries.map((entry, index) => (
            <article key={entry.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">{entry.position ?? index + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3 className="truncate text-sm font-bold text-slate-900">{entry.player?.name ?? "Unknown player"}</h3>
                  <span className="text-xs text-slate-400">#{entry.queue_number}</span>
                  {entry.player?.skill_level && <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-800">{entry.player.skill_level}</span>}
                  <StatusBadge status={entry.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {entry.match_type === "any" ? "Either format" : `${entry.match_type} requested`}
                  <span className="mx-1.5">·</span>
                  Joined {formatTime(entry.joined_at)}
                </p>
              </div>
              <Button size="sm" variant="danger" disabled={busy} onClick={() => onCancel(entry)}>Remove</Button>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
