import { Card } from "../Card";
import { Grid } from "../layout/Page";

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

const accentConfig: Record<Stat["accent"], { dot: string; value: string; badge: string }> = {
  live: { dot: "bg-primary-500", value: "text-primary", badge: "primary" },
  open: { dot: "bg-success-500", value: "text-success", badge: "success" },
  warn: { dot: "bg-warning-500", value: "text-warning", badge: "warning" },
  muted: { dot: "bg-neutral-400", value: "text-text-tertiary", badge: "default" },
  total: { dot: "bg-neutral-400", value: "text-text-primary", badge: "default" },
};

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
    <Grid cols={4} gap={3} className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" aria-label="Dashboard summary">
      {stats.map((stat) => {
        const config = accentConfig[stat.accent];
        return (
          <Card key={stat.label} variant="bordered" className="p-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${config.dot}`}
                aria-hidden="true"
              />
              <span className="text-label text-text-secondary">
                {stat.label}
              </span>
            </div>
            <p className="mt-2 text-stat-sm font-bold tabular-nums leading-none {config.value} animate-count-up">
              {loading && stat.value === null ? (
                <span className="inline-block h-6 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              ) : (
                stat.value ?? "—"
              )}
            </p>
          </Card>
        );
      })}
    </Grid>
  );
}