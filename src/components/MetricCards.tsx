import { formatCount, formatPercent, type Kpis } from "../lib/metrics";

type MetricCardsProps = { kpis: Kpis };

export function MetricCards({ kpis }: MetricCardsProps) {
  const metrics = [
    { label: "Recorded accidents", value: formatCount(kpis.accidents), note: "In the selected slice" },
    { label: "Severity 3–4", value: formatCount(kpis.highSeverity), note: "Higher traffic impact" },
    { label: "High severity share", value: formatPercent(kpis.highSeverityShare), note: "Of filtered records" },
    { label: "States represented", value: formatCount(kpis.states), note: "With matching records" },
  ];
  return (
    <section className="metric-grid" aria-label="Summary metrics">
      {metrics.map((metric, index) => (
        <article className={`metric-card metric-card--${index + 1}`} key={metric.label}>
          <p>{metric.label}</p><strong>{metric.value}</strong><span>{metric.note}</span>
        </article>
      ))}
    </section>
  );
}
