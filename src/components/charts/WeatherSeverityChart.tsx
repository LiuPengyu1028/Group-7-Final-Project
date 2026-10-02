import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AggregateRow } from "../../data/dashboard-data";
import type { DashboardFilters } from "../../lib/filters";
import { EmptyState } from "../EmptyState";
import { chartRows, SEVERITY_COLORS, selectedFilterText } from "./chart-utils";

type Props = { rows: AggregateRow[]; filters: DashboardFilters };

export function WeatherSeverityChart({ rows, filters }: Props) {
  const points = useMemo(() => {
    const buckets = new Map<string, Record<string, string | number>>();
    for (const row of chartRows(rows, filters)) {
      const weather = row.weather;
      const point = buckets.get(weather) ?? { weather, "Severity 1": 0, "Severity 2": 0, "Severity 3": 0, "Severity 4": 0 };
      point[`Severity ${row.severity}`] = Number(point[`Severity ${row.severity}`]) + row.count;
      buckets.set(weather, point);
    }
    return [...buckets.values()].sort((a, b) => String(a.weather).localeCompare(String(b.weather)));
  }, [rows, filters]);

  return (
    <article className="chart-card">
      <div className="chart-card__header"><div><p className="eyebrow">Weather groups</p><h3>Severity by weather</h3></div><span className="chart-card__index">03</span></div>
      <p className="chart-card__summary">Counts within each recorded weather group. These are not rates per trip.</p>
      <p className="chart-card__filters">{selectedFilterText(filters)}</p>
      {points.length ? <div className="chart-stage"><ResponsiveContainer width="100%" height="100%"><BarChart data={points} margin={{ top: 8, right: 12, bottom: 36, left: 2 }}>
        <CartesianGrid stroke="#e4e9e8" vertical={false} />
        <XAxis dataKey="weather" interval={0} angle={-12} textAnchor="end" height={54} tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={44} />
        <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Accident records"]} />
        <Legend />
        {[1, 2, 3, 4].map((severity) => <Bar key={severity} dataKey={`Severity ${severity}`} stackId="severity" fill={SEVERITY_COLORS[severity]} />)}
      </BarChart></ResponsiveContainer></div> : <EmptyState>Change the filters to compare weather groups.</EmptyState>}
    </article>
  );
}
