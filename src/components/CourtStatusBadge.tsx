import type { CourtStatus } from "../types";

const config: Record<
  CourtStatus,
  { label: string; dot: string; pill: string }
> = {
  playing: {
    label: "Live",
    dot: "bg-lemon-400",
    pill: "border-lemon-400/35 bg-lemon-400/[0.08] text-lemon-300",
  },
  available: {
    label: "Open",
    dot: "bg-lime-400",
    pill: "border-lime-400/35 bg-lime-400/[0.08] text-lime-300",
  },
  maintenance: {
    label: "Maint.",
    dot: "bg-amber-400",
    pill: "border-amber-400/35 bg-amber-400/[0.08] text-amber-300",
  },
};

export function CourtStatusBadge({ status }: { status: CourtStatus }) {
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wider ${c.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
