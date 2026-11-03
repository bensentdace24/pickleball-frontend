import { getChartSegments, type ChartValue } from "../lib/analyticsDisplay";
import { Card, Badge } from "../components";
import { Flex } from "../components/layout/Page";

interface Props {
  title: string;
  description: string;
  values: ChartValue[];
  colors?: string[];
}

const palette = ["bg-success-500", "bg-warning-500", "bg-primary-500"];

export function AnalyticsChart({ title, description, values, colors = palette }: Props) {
  const segments = getChartSegments(values);

  return (
    <Card variant="bordered" className="p-5 sm:p-6">
      <Flex justify="between" wrap gap={3}>
        <div>
          <h2 className="font-semibold text-text-primary">{title}</h2>
          <p className="mt-1 text-xs text-text-secondary">{description}</p>
        </div>
        <Badge variant="default" size="sm">All time</Badge>
      </Flex>

      {segments.length === 0 || segments.every((segment) => segment.value === 0) ? (
        <div className="mt-6 rounded-xl bg-surface-sunken p-4 text-sm text-text-secondary">
          No completed match data to chart yet.
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-4">
            {segments.map((segment, index) => (
              <div key={segment.label}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-text-primary">{segment.label}</span>
                  <span className="tabular-nums text-text-secondary">{segment.value.toLocaleString()}</span>
                </div>
                <div
                  className="h-2.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
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

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3">
            {segments.map((segment, index) => (
              <span key={segment.label} className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary">
                <span className={`h-2 w-2 rounded-full ${colors[index % colors.length] ?? palette[index % palette.length]}`} />
                {segment.label}
              </span>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}