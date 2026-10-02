import { useMemo } from "react";
import type { AggregateRow } from "../../data/dashboard-data";
import type { DashboardFilters } from "../../lib/filters";
import { EmptyState } from "../EmptyState";
import { chartRows, selectedFilterText } from "./chart-utils";

type Props = { rows: AggregateRow[]; filters: DashboardFilters };
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function HourWeekdayHeatmap({ rows, filters }: Props) {
  const cells = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of chartRows(rows, filters)) {
      if (row.weekday === undefined || row.hour === undefined) continue;
      const key = `${row.weekday}:${row.hour}`;
      counts.set(key, (counts.get(key) ?? 0) + row.count);
    }
    return counts;
  }, [rows, filters]);
  const maximum = Math.max(0, ...cells.values());

  return (
    <article className="chart-card chart-card--wide">
      <div className="chart-card__header"><div><p className="eyebrow">Local start time</p><h3>When accidents were recorded</h3></div><span className="chart-card__index">05</span></div>
      <p className="chart-card__summary">Darker cells show more recorded accidents for that weekday and hour.</p>
      <p className="chart-card__filters">{selectedFilterText(filters)}</p>
      {cells.size ? <div className="heatmap-wrap" role="grid" aria-label="Accident records by weekday and local start hour">
        <div className="heatmap-row heatmap-row--header"><span aria-hidden="true" />{Array.from({ length: 24 }, (_, hour) => <span key={hour} className="heatmap-hour">{hour % 3 === 0 ? String(hour).padStart(2, "0") : ""}</span>)}</div>
        {WEEKDAYS.map((weekday) => <div className="heatmap-row" role="row" key={weekday}>
          <span className="heatmap-day" role="rowheader">{weekday.slice(0, 3)}</span>
          {Array.from({ length: 24 }, (_, hour) => {
            const count = cells.get(`${weekday}:${hour}`) ?? 0;
            const alpha = maximum ? 0.08 + 0.88 * count / maximum : 0.08;
            return <span role="gridcell" key={hour} title={`${weekday}, ${String(hour).padStart(2, "0")}:00 · ${count.toLocaleString()} records`} aria-label={`${weekday}, ${hour}:00, ${count} records`} className="heatmap-cell" style={{ backgroundColor: `rgba(49, 102, 94, ${alpha})` }} />;
          })}
        </div>)}
        <div className="heatmap-scale"><span>Fewer records</span><span className="heatmap-scale__ramp" aria-hidden="true" /><span>More records</span></div>
      </div> : <EmptyState>Change the filters to view the weekday and hour pattern.</EmptyState>}
    </article>
  );
}
