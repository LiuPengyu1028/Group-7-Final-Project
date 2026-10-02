import type { DashboardData } from "../data/dashboard-data";

type Props = { data: DashboardData };

export function MethodologyPage({ data }: Props) {
  return (
    <div className="page-stack">
      <section className="page-heading"><p className="eyebrow">About this dashboard</p><h1>Know what the records can tell us.</h1><p>Clear definitions make the patterns easier to interpret and easier to challenge.</p></section>
      <div className="method-grid">
        <article className="method-card method-card--source"><p className="eyebrow">Source & attribution</p><h2><a href={data.metadata.sourceUrl} target="_blank" rel="noreferrer">{data.metadata.source}</a></h2><p>Author: {data.metadata.author}. For the class project, use the Kaggle sample file with 500,000 accident records.</p><p>License: {data.metadata.license}. The dataset is for non-commercial research and academic use.</p><p className="method-card__citation">Please cite the dataset author and the two research papers listed on the source page when presenting this work.</p></article>
        <article className="method-card"><p className="eyebrow">What severity means</p><h2>Traffic impact</h2><p>{data.metadata.severityDefinition}</p><p>Severity 3–4 is the dashboard’s high-severity group. It does not mean that a person was injured or killed.</p></article>
        <article className="method-card"><p className="eyebrow">How fields are grouped</p><h2>Consistent comparisons</h2><ul><li>Weather descriptions are grouped into seven broad categories.</li><li>Visibility is grouped into four mile bands, plus Unknown.</li><li>Local start time is shown in four six-hour periods.</li><li>The city table includes up to 2,000 state-city pairs with at least 30 source records; all retained condition groups are available within those places.</li><li>Duplicate IDs and invalid severity/timestamps are removed and counted.</li></ul></article>
        {data.quality && <article className="method-card"><p className="eyebrow">Sample quality</p><h2>{data.quality.retainedRows.toLocaleString()} of {data.quality.inputRows.toLocaleString()} records retained</h2><p>Duplicate IDs: {data.quality.duplicateRows.toLocaleString()} · invalid severity: {data.quality.invalidSeverityRows.toLocaleString()} · invalid timestamps: {data.quality.invalidTimestampRows.toLocaleString()}.</p><p>Date coverage: {data.quality.dateCoverage.start ?? "unavailable"} to {data.quality.dateCoverage.end ?? "unavailable"}.</p><p>Missing values: weather {((data.quality.nullRates.Weather_Condition ?? 0) * 100).toFixed(1)}%, visibility {((data.quality.nullRates["Visibility(mi)"] ?? 0) * 100).toFixed(1)}%, precipitation {((data.quality.nullRates["Precipitation(in)"] ?? 0) * 100).toFixed(1)}%.</p></article>}
        <article className="method-card method-card--caution"><p className="eyebrow">Limits of the evidence</p><h2>Keep the denominator in view</h2><ul><li>The data contains accident records but no denominator for all trips or miles driven.</li><li>These records cannot estimate the probability of an accident on a future trip.</li><li>The data does not contain vehicle make or model.</li><li>Severity represents traffic impact, not injury or fatality severity.</li><li>Missing source days, weather measurements, and location coverage may affect comparisons.</li><li>Patterns are descriptive and do not establish cause or operational safety advice.</li></ul></article>
      </div>
      <p className="page-footnote">The app reads pre-aggregated data generated with <code>python scripts/prepare_data.py --input data/raw/US_Accidents_March23_sampled_500k.csv --output data/processed</code>.</p>
    </div>
  );
}
