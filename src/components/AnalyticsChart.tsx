import { getChartSegments, type ChartValue } from "../lib/analyticsDisplay";

interface Props {
  title: string;
  description: string;
  values: ChartValue[];
  colors?: string[];
}

const palette = ["bg-emerald-700", "bg-amber-500", "bg-sky-600"];

export function AnalyticsChart({ title, description, values, colors = palette }: Props) {
  const segments = getChartSegments(values);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          All time
        </span>
      </div>
      {segments.length === 0 || segments.every((segment) => segment.value === 0) ? (
        <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          No completed match data to chart yet.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {segments.map((segment, index) => (
            <div key={segment.label}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700">{segment.label}</span>
                <span className="tabular-nums text-slate-500">{segment.value.toLocaleString()}</span>
              </div>
              <div
                className="h-2.5 overflow-hidden rounded-full bg-slate-100"
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
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-3">
        {segments.map((segment, index) => (
          <span key={segment.label} className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className={`h-2 w-2 rounded-full ${colors[index % colors.length] ?? palette[index % palette.length]}`} />
            {segment.label}
          </span>
        ))}
      </div>
    </section>
  );
}
