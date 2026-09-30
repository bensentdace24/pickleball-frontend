import type { CourtStatus, GameStatus, QueueStatus } from "../types";

type Status = CourtStatus | GameStatus | QueueStatus;

const styles: Record<Status, string> = {
  available: "bg-green-100 text-green-800",
  playing: "bg-blue-100 text-blue-800",
  waiting: "bg-amber-100 text-amber-800",
  called: "bg-purple-100 text-purple-800",
  completed: "bg-slate-200 text-slate-700",
  cancelled: "bg-red-100 text-red-800",
  maintenance: "bg-orange-100 text-orange-800",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}
