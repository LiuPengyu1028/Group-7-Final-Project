import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AggregateRow } from "../../data/dashboard-data";
import type { DashboardFilters } from "../../lib/filters";
import { EmptyState } from "../EmptyState";
import { chartRows, SEVERITY_COLORS, selectedFilterText } from "./chart-utils";

type Props = { rows: AggregateRow[]; filters: DashboardFilters };
const ORDER = ["Very low (<1 mi)", "Low (1–3 mi)", "Moderate (3–10 mi)", "Good (≥10 mi)", "Unknown"];

export function VisibilitySeverityChart({ rows, filters }: Props) {
  const points = useMemo(() => {
    const buckets = new Map<string, Record<string, string | number>>();
    for (const row of chartRows(rows, filters)) {
      const visibility = row.visibilityBand;
      const point = buckets.get(visibility) ?? { visibility, "Severity 1": 0, "Severity 2": 0, "Severity 3": 0, "Severity 4": 0 };
      point[`Severity ${row.severity}`] = Number(point[`Severity ${row.severity}`]) + row.count;
      buckets.set(visibility, point);
    }
    return [...buckets.values()].sort((a, b) => ORDER.indexOf(String(a.visibility)) - ORDER.indexOf(String(b.visibility)));
  }, [rows, filters]);

  return (
    <article className="chart-card">
      <div className="chart-card__header"><div><p className="eyebrow">Visibility bands · miles</p><h3>Severity by visibility</h3></div><span className="chart-card__index">04</span></div>
      <p className="chart-card__summary">Accident-record counts across the documented visibility bands.</p>
      <p className="chart-card__filters">{selectedFilterText(filters)}</p>
      {points.length ? <div className="chart-stage"><ResponsiveContainer width="100%" height="100%"><BarChart data={points} margin={{ top: 8, right: 12, bottom: 18, left: 2 }}>
        <CartesianGrid stroke="#e4e9e8" vertical={false} />
        <XAxis dataKey="visibility" interval={0} angle={-10} textAnchor="end" height={48} tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={44} />
        <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Accident records"]} />
        <Legend />
        {[1, 2, 3, 4].map((severity) => <Bar key={severity} dataKey={`Severity ${severity}`} stackId="severity" fill={SEVERITY_COLORS[severity]} />)}
      </BarChart></ResponsiveContainer></div> : <EmptyState>Change the filters to compare visibility bands.</EmptyState>}
    </article>
  );
}
