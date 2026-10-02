import type { AggregateRow } from "../data/dashboard-data";
import type { DashboardFilters } from "../lib/filters";
import { StateRiskTable } from "../components/charts/StateRiskTable";

type Props = { data: { states: AggregateRow[]; cities: AggregateRow[] }; filters: DashboardFilters };

export function GeographyPage({ data, filters }: Props) {
  return (
    <div className="page-stack">
      <section className="page-heading"><p className="eyebrow">Geographic explorer</p><h1>Compare places with care.</h1><p>Explore where accident records were collected, with counts and severity composition for context.</p></section>
      <div className="chart-grid"><StateRiskTable rows={data.states} filters={filters} /><StateRiskTable rows={data.cities} filters={filters} title="Selected cities" includeCity /></div>
      <aside className="note-panel"><span className="note-panel__icon" aria-hidden="true">i</span><p>A higher count can reflect more traffic, longer observation, or more complete reporting. The dataset does not measure trips or road exposure for these places.</p></aside>
    </div>
  );
}
