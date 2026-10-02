import { filterRows, type DashboardFilters, type FilterableRow } from "./filters";

export type CountRow = FilterableRow & { count: number };

export type Kpis = {
  accidents: number;
  highSeverity: number;
  highSeverityShare: number | null;
  states: number;
};

export function calculateHighSeverityShare(total: number, highSeverity: number): number | null {
  return total <= 0 ? null : highSeverity / total;
}

export function formatPercent(value: number | null): string {
  return value === null || !Number.isFinite(value) ? "N/A" : `${(value * 100).toFixed(1)}%`;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function calculateKpis(rows: CountRow[], filters: DashboardFilters): Kpis {
  const filtered = filterRows(rows, filters);
  const accidents = filtered.reduce((sum, row) => sum + row.count, 0);
  const highSeverity = filtered.reduce(
    (sum, row) => sum + (row.severity >= 3 ? row.count : 0),
    0,
  );
  return {
    accidents,
    highSeverity,
    highSeverityShare: calculateHighSeverityShare(accidents, highSeverity),
    states: new Set(filtered.map((row) => row.state)).size,
  };
}
