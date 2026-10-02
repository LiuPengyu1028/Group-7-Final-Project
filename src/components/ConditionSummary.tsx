import { formatCount, formatPercent, type Kpis } from "../lib/metrics";

type ConditionSummaryProps = { kpis: Kpis; hasRecords: boolean };

export function ConditionSummary({ kpis, hasRecords }: ConditionSummaryProps) {
  return (
    <aside className="condition-summary">
      <p className="eyebrow">What this selection shows</p>
      {hasRecords ? (
        <p>Among recorded accidents in this selection, <strong>{formatCount(kpis.highSeverity)}</strong> were Severity 3–4, representing <strong>{formatPercent(kpis.highSeverityShare)}</strong> of the selected records.</p>
      ) : (
        <p>No recorded accidents match the current filters. Change one or more selections to explore another slice.</p>
      )}
      <small>This describes the composition of recorded accidents. It does not estimate risk per trip.</small>
    </aside>
  );
}
