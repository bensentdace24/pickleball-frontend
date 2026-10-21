export interface ChartValue {
  label: string;
  value: number;
}

export interface ChartSegment extends ChartValue {
  percent: number;
}

export function getChartSegments(values: ChartValue[]): ChartSegment[] {
  const max = Math.max(0, ...values.map(({ value }) => value));
  return values.map(({ label, value }) => ({
    label,
    value,
    percent: max > 0 ? Math.round((Math.max(0, value) / max) * 100) : 0,
  }));
}
