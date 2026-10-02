import type { AggregateRow } from "../data/dashboard-data";
import type { DashboardFilters } from "../lib/filters";
import { type Kpis } from "../lib/metrics";
import { ConditionSummary } from "../components/ConditionSummary";
import { MetricCards } from "../components/MetricCards";
import { MonthlyTrendChart } from "../components/charts/MonthlyTrendChart";
import { SeverityMixChart } from "../components/charts/SeverityMixChart";

type Props = { data: { overview: AggregateRow[]; monthly: AggregateRow[] }; filters: DashboardFilters; kpis: Kpis };

export function OverviewPage({ data, filters, kpis }: Props) {
  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="hero-panel__copy">
          <p className="eyebrow">Roadwise · US road safety, explored</p>
          <h1>Understand the conditions around recorded accidents.</h1>
          <p>Explore how weather, visibility and timing appear alongside traffic impact across the United States.</p>
          <span className="historical-label"><span aria-hidden="true">●</span> Historical data · not a live prediction</span>
        </div>
        <div className="hero-panel__art" aria-hidden="true"><div className="road-line road-line--one" /><div className="road-line road-line--two" /><div className="road-dot road-dot--one" /><div className="road-dot road-dot--two" /><div className="road-dot road-dot--three" /><div className="art-caption">2016 <span>—</span> 2023<br />United States</div></div>
      </section>
      <MetricCards kpis={kpis} />
      <div className="chart-grid chart-grid--overview">
        <MonthlyTrendChart rows={data.monthly} filters={filters} />
        <SeverityMixChart rows={data.overview} filters={filters} />
      </div>
      <ConditionSummary kpis={kpis} hasRecords={kpis.accidents > 0} />
      <p className="page-footnote">Severity describes recorded traffic impact, not injury or fatality outcomes. Accident counts do not include a denominator for all trips.</p>
    </div>
  );
}
