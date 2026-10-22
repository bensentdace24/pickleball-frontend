interface Props {
  players: number | null;
  waiting: number | null;
  activeGames: number | null;
  availableCourts: number | null;
  maintenanceCourts: number | null;
  completedGames: number | null;
  loading: boolean;
}

interface Stat {
  label: string;
  value: number | null;
  accent: "live" | "open" | "warn" | "muted" | "total";
}

export function DashboardOverview({
  players,
  waiting,
  activeGames,
  availableCourts,
  maintenanceCourts,
  completedGames,
  loading,
}: Props) {
  const stats: Stat[] = [
    { label: "Live", value: activeGames, accent: "live" },
    { label: "Open courts", value: availableCourts, accent: "open" },
    { label: "Waiting", value: waiting, accent: "warn" },
    { label: "Maintenance", value: maintenanceCourts, accent: "muted" },
    { label: "Players", value: players, accent: "total" },
    { label: "Games played", value: completedGames, accent: "total" },
  ];

  return (
    <section
      aria-label="Dashboard summary"
      className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6"
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-slate-800 bg-[#0d1524] px-3.5 py-3 transition-colors hover:border-slate-700"
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`overview-dot overview-dot--${stat.accent}`}
              aria-hidden="true"
            />
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">
              {stat.label}
            </span>
          </div>
          <p
            className={`mt-1.5 text-2xl font-extrabold tabular-nums leading-none ${
              stat.accent === "live"
                ? "text-amber-400"
                : stat.accent === "open"
                  ? "text-lime-400"
                  : stat.accent === "warn"
                    ? "text-amber-300"
                    : "text-[#f4f1e8]"
            }`}
          >
            {loading && stat.value === null ? (
              <span className="inline-block h-6 w-8 animate-pulse rounded bg-slate-800" />
            ) : (
              (stat.value ?? "—")
            )}
          </p>
        </div>
      ))}
    </section>
  );
}
