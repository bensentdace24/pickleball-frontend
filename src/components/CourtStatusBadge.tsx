import type { CourtStatus } from "../types";

const statusMeta: Record<
  CourtStatus,
  { label: string; dotClass: string; className: string }
> = {
  available: {
    label: "Available",
    dotClass: "bg-emerald-500",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  playing: {
    label: "In play",
    dotClass: "bg-sky-500 animate-pulse",
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  maintenance: {
    label: "Maintenance",
    dotClass: "bg-amber-500",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
};

export function CourtStatusBadge({ status }: { status: CourtStatus }) {
  const meta = statusMeta[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className}`}
      aria-label={`Court status: ${meta.label}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`}>
      </span>
      {meta.label}
    </span>
  );
}
