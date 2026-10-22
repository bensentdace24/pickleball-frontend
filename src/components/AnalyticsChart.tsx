import { getChartSegments, type ChartValue } from "../lib/analyticsDisplay";

interface Props {
  title: string;
  description: string;
  values: ChartValue[];
  colors?: string[];
}

const palette = ["bg-lime-400", "bg-amber-400", "bg-sky-400"];

export function AnalyticsChart({ title, description, values, colors = palette }: Props) {
  const segments = getChartSegments(values);
  return (
    <section className="rounded-2xl border border-ink-600 bg-ink-800 p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-cream-50">{title}</h2>
          <p className="mt-1 text-xs text-cream-200">{description}</p>
        </div>
        <span className="rounded-full bg-ink-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cream-200">
          All time
        </span>
      </div>
      {segments.length === 0 || segments.every((segment) => segment.value === 0) ? (
        <p className="mt-6 rounded-xl bg-ink-900 p-4 text-sm text-cream-200">
          No completed match data to chart yet.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {segments.map((segment, index) => (
            <div key={segment.label}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-cream-100">{segment.label}</span>
                <span className="tabular-nums text-cream-200">{segment.value.toLocaleString()}</span>
              </div>
              <div
                className="h-2.5 overflow-hidden rounded-full bg-ink-600"
                role="img"
                aria-label={`${segment.label}: ${segment.value}`}
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${colors[index % colors.length] ?? palette[index % palette.length]}`}
                  style={{ width: `${segment.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-ink-600 pt-3">
        {segments.map((segment, index) => (
          <span key={segment.label} className="inline-flex items-center gap-1.5 text-[11px] text-cream-200">
            <span className={`h-2 w-2 rounded-full ${colors[index % colors.length] ?? palette[index % palette.length]}`} />
            {segment.label}
          </span>
        ))}
      </div>
    </section>
  );
}
