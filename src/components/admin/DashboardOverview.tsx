interface Metric {
  label: string;
  value: number | string;
  detail: string;
  tone: "green" | "blue" | "amber" | "slate";
}

interface Props {
  players: number | null;
  waiting: number | null;
  activeGames: number | null;
  availableCourts: number | null;
  maintenanceCourts: number | null;
  completedGames: number | null;
  loading: boolean;
}

const tones = {
  green: "text-emerald-700",
  blue: "text-sky-700",
  amber: "text-amber-700",
  slate: "text-slate-900",
};

export function DashboardOverview(props: Props) {
  const metrics: Metric[] = [
    {
      label: "Registered players",
      value: props.players ?? "—",
      detail: "All player profiles",
      tone: "slate",
    },
    {
      label: "Waiting",
      value: props.waiting ?? "—",
      detail: "Players in line",
      tone: "amber",
    },
    {
      label: "Active matches",
      value: props.activeGames ?? "—",
      detail: "Games in progress",
      tone: "blue",
    },
    {
      label: "Available courts",
      value: props.availableCourts ?? "—",
      detail: "Ready for assignment",
      tone: "green",
    },
    {
      label: "Maintenance",
      value: props.maintenanceCourts ?? "—",
      detail: "Temporarily closed",
      tone: "amber",
    },
    {
      label: "Completed matches",
      value: props.completedGames ?? "—",
      detail: "All-time total",
      tone: "slate",
    },
  ];

  return (
    <section aria-label="Club overview" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.11em] text-slate-500">
            {metric.label}
          </p>
          <p className={`mt-1 font-mono text-2xl font-extrabold tabular-nums ${tones[metric.tone]}`} aria-live="polite">
            {props.loading && metric.value === "—" ? "…" : metric.value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{metric.detail}</p>
        </article>
      ))}
    </section>
  );
}
