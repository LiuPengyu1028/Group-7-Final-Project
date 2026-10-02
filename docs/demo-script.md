# Five-minute course demonstration

## Problem — 0:00–0:40

“We built Roadwise to help people explore how recorded US accident conditions vary across weather, visibility, time, and place. It is an analytics dashboard for historical records—not a live driving recommendation or prediction system.”

## Data — 0:40–1:20

“Our source is Sobhan Moosavi’s US Accidents (2016–2023) dataset on Kaggle. For a reproducible course demo, we use its 500,000-row sample. We transform row-level data into compact counts before the browser loads it; the source CSV stays local and is not published in this repository.”

## Insight — 1:20–2:10

Start on Overview. Explain that the four KPI cards describe the currently selected slice of records. Point to the monthly trend and severity mix. Emphasize that Severity 3–4 means higher recorded traffic impact, not injuries or fatalities.

## Interaction — 2:10–3:35

Open Conditions and select a state such as CA, then choose a year or weather group. Show that every chart and the selected-filter labels update together. Mention that selections live in the URL, so refreshing preserves the view. Open Geography to compare states and cities; use Methodology to inspect definitions and the sample quality report.

## Limitation — 3:35–4:25

“These are counts among observed accidents. The dataset does not tell us how many total trips happened in each condition, so we cannot calculate per-trip accident probability. It also has no vehicle make/model field; it cannot support car-model comparisons. The patterns are descriptive, not causal.”

## Next step — 4:25–5:00

“A next research step would be to find a properly licensed exposure dataset—such as trips or vehicle miles by place and time—validate compatible coverage, and only then evaluate whether a carefully scoped risk model is supportable. Until then, we keep Roadwise as a transparent historical exploration tool.”
