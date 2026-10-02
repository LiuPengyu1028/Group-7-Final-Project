import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AggregateRow } from "../../data/dashboard-data";
import type { DashboardFilters } from "../../lib/filters";
import { EmptyState } from "../EmptyState";
import { ChartDataTable } from "./ChartDataTable";
import { chartRows, SEVERITY_COLORS, selectedFilterText } from "./chart-utils";

type Props = { rows: AggregateRow[]; filters: DashboardFilters };

export function SeverityMixChart({ rows, filters }: Props) {
  const points = useMemo(() => {
    const totals = new Map<number, number>();
    for (const row of chartRows(rows, filters)) totals.set(row.severity, (totals.get(row.severity) ?? 0) + row.count);
    return [1, 2, 3, 4].map((severity) => ({ severity: `Severity ${severity}`, value: totals.get(severity) ?? 0, level: severity }));
  }, [rows, filters]);
  const hasRecords = points.some((point) => point.value > 0);

  return (
    <article className="chart-card chart-card--compact">
      <div className="chart-card__header"><div><p className="eyebrow">Traffic impact scale</p><h3>Severity mix</h3></div><span className="chart-card__index">02</span></div>
      <p className="chart-card__summary">How recorded accidents are distributed across the source severity levels.</p>
      <p className="chart-card__filters">{selectedFilterText(filters)}</p>
      {hasRecords ? <><div className="chart-stage chart-stage--short"><ResponsiveContainer width="100%" height="100%"><BarChart data={points} layout="vertical" margin={{ left: 12, right: 20, top: 4, bottom: 4 }}>
        <CartesianGrid stroke="#e4e9e8" horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="severity" width={82} tickLine={false} axisLine={false} />
        <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Recorded accidents"]} />
        <Bar dataKey="value" name="Recorded accidents" radius={[0, 5, 5, 0]}>
          {points.map((point) => <Cell key={point.severity} fill={SEVERITY_COLORS[point.level]} />)}
        </Bar>
      </BarChart></ResponsiveContainer></div><ChartDataTable caption="Accidents by severity level" columns={[{ key: "severity", label: "Severity" }, { key: "value", label: "Recorded accidents" }]} rows={points.map(({ severity, value }) => ({ severity, value }))} /></> : <EmptyState>Change the filters to view severity counts.</EmptyState>}
    </article>
  );
}
