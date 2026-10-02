import type { AggregateRow } from "../data/dashboard-data";
import type { DashboardFilters } from "../lib/filters";
import type { Kpis } from "../lib/metrics";
import { ConditionSummary } from "../components/ConditionSummary";
import { HourWeekdayHeatmap } from "../components/charts/HourWeekdayHeatmap";
import { VisibilitySeverityChart } from "../components/charts/VisibilitySeverityChart";
import { WeatherSeverityChart } from "../components/charts/WeatherSeverityChart";

type Props = { data: { weatherSeverity: AggregateRow[]; visibilitySeverity: AggregateRow[]; hourWeekday: AggregateRow[] }; filters: DashboardFilters; kpis: Kpis };

export function ConditionsPage({ data, filters, kpis }: Props) {
  return (
    <div className="page-stack">
      <section className="page-heading"><p className="eyebrow">Conditions explorer</p><h1>Read the weather around the record.</h1><p>Compare conditions and the traffic impact severity recorded alongside them.</p><span className="historical-label"><span aria-hidden="true">●</span> Historical data · not a live prediction</span></section>
      <div className="chart-grid">
        <WeatherSeverityChart rows={data.weatherSeverity} filters={filters} />
        <VisibilitySeverityChart rows={data.visibilitySeverity} filters={filters} />
        <HourWeekdayHeatmap rows={data.hourWeekday} filters={filters} />
      </div>
      <ConditionSummary kpis={kpis} hasRecords={kpis.accidents > 0} />
      <p className="page-footnote">The figures compare accident records. They do not show how often people drove in each condition.</p>
    </div>
  );
}
