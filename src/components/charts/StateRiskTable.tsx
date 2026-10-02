import { useMemo, useState } from "react";
import type { AggregateRow } from "../../data/dashboard-data";
import type { DashboardFilters } from "../../lib/filters";
import { calculateHighSeverityShare, formatCount, formatPercent } from "../../lib/metrics";
import { EmptyState } from "../EmptyState";
import { chartRows, selectedFilterText } from "./chart-utils";

type Props = { rows: AggregateRow[]; filters: DashboardFilters; title?: string; includeCity?: boolean };
type SortKey = "count" | "share";

export function StateRiskTable({ rows, filters, title = "Recorded accidents by state", includeCity = false }: Props) {
  const [sortBy, setSortBy] = useState<SortKey>("count");
  const grouped = useMemo(() => {
    const buckets = new Map<string, { state: string; city: string; count: number; high: number }>();
    for (const row of chartRows(rows, filters)) {
      const place = includeCity ? `${row.state} · ${row.city ?? "Unknown"}` : row.state;
      const item = buckets.get(place) ?? { state: row.state, city: row.city ?? "", count: 0, high: 0 };
      item.count += row.count;
      if (row.severity >= 3) item.high += row.count;
      buckets.set(place, item);
    }
    return [...buckets.values()].map((item) => ({ ...item, share: calculateHighSeverityShare(item.count, item.high) }))
      .sort((a, b) => sortBy === "count" ? b.count - a.count : (b.share ?? -1) - (a.share ?? -1));
  }, [rows, filters, includeCity, sortBy]);

  return (
    <article className="chart-card chart-card--wide">
      <div className="chart-card__header"><div><p className="eyebrow">Geographic comparison</p><h3>{title}</h3></div><span className="chart-card__index">06</span></div>
      <p className="chart-card__summary">Counts refer to records in this dataset. Small city groups are omitted.</p>
      <p className="chart-card__filters">{selectedFilterText(filters)}</p>
      {grouped.length ? <div className="table-wrap"><table>
        <thead><tr><th scope="col">{includeCity ? "Place" : "State"}</th><th scope="col"><button type="button" className="table-sort" onClick={() => setSortBy("count")}>Recorded accidents ↕</button></th><th scope="col"><button type="button" className="table-sort" onClick={() => setSortBy("share")}>Severity 3–4 share ↕</button></th></tr></thead>
        <tbody>{grouped.map((item) => <tr key={`${item.state}-${item.city}`}><th scope="row">{includeCity ? `${item.city}, ${item.state}` : item.state}</th><td>{formatCount(item.count)}</td><td>{formatPercent(item.share)}</td></tr>)}</tbody>
      </table></div> : <EmptyState>Change the filters to see geographic comparisons.</EmptyState>}
    </article>
  );
}
