import { useMemo } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AggregateRow } from "../../data/dashboard-data";
import type { DashboardFilters } from "../../lib/filters";
import { EmptyState } from "../EmptyState";
import { chartRows, formatMonth, selectedFilterText } from "./chart-utils";

type Props = { rows: AggregateRow[]; filters: DashboardFilters };

export function MonthlyTrendChart({ rows, filters }: Props) {
  const points = useMemo(() => {
    const buckets = new Map<string, { month: string; accidents: number; highSeverity: number }>();
    for (const row of chartRows(rows, filters)) {
      if (!row.month) continue;
      const bucket = buckets.get(row.month) ?? { month: row.month, accidents: 0, highSeverity: 0 };
      bucket.accidents += row.count;
      if (row.severity >= 3) bucket.highSeverity += row.count;
      buckets.set(row.month, bucket);
    }
    return [...buckets.values()].sort((a, b) => a.month.localeCompare(b.month));
  }, [rows, filters]);

  return (
    <article className="chart-card">
      <div className="chart-card__header"><div><p className="eyebrow">Across the calendar</p><h3>Accidents by month</h3></div><span className="chart-card__index">01</span></div>
      <p className="chart-card__summary">Recorded accidents and Severity 3–4 counts in each month.</p>
      <p className="chart-card__filters">{selectedFilterText(filters)}</p>
      {points.length ? <div className="chart-stage"><ResponsiveContainer width="100%" height="100%"><LineChart data={points} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
        <CartesianGrid stroke="#e4e9e8" vertical={false} />
        <XAxis dataKey="month" tickFormatter={formatMonth} minTickGap={24} tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={45} />
        <Tooltip labelFormatter={(label) => formatMonth(String(label))} formatter={(value, name) => [Number(value).toLocaleString(), name === "accidents" ? "All recorded accidents" : "Severity 3–4"]} />
        <Legend />
        <Line type="monotone" dataKey="accidents" name="All recorded accidents" stroke="#335d58" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="highSeverity" name="Severity 3–4" stroke="#ba7041" strokeWidth={2.5} dot={false} />
      </LineChart></ResponsiveContainer></div> : <EmptyState>Prepare the Kaggle sample to see monthly results.</EmptyState>}
    </article>
  );
}
