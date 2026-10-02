# Roadwise — US Accident Conditions

Course-project interactive analytics dashboard for exploring recorded US traffic accidents alongside weather, visibility, time, and geography.

## Problem

Drivers, fleet operators, and insurance analysts need a clear way to explore how recorded accident severity varies across observed conditions. Roadwise supports historical exploration and classroom discussion; it is not a live route planner, driver alert, insurance-pricing model, or prediction tool.

## Dashboard features

- Overview of recorded accidents, Severity 3–4 counts/share, and states represented.
- Shared filters for year, state, grouped weather, visibility band, time of day, and severity. Filters are encoded in the URL so a selection can be refreshed or shared.
- Monthly trend and severity mix, grouped severity charts by weather and visibility, a weekday/hour heatmap, and state/city tables.
- Methodology view with dataset attribution, quality summary, transformations, definitions, and limitations.
- Responsive layouts and text/table alternatives for chart interpretation.

## Data source

The project uses the 500,000-row sample from [US Accidents (2016–2023) on Kaggle](https://www.kaggle.com/datasets/sobhanmoosavi/us-accidents), authored by Sobhan Moosavi. Dataset terms: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). The dataset page also lists the two source research papers; cite the dataset and those papers in a formal course presentation.

Download the sample CSV from the dataset page and save it as:

```text
data/raw/US_Accidents_March23_sampled_500k.csv
```

The raw CSV is intentionally ignored by Git. The small, pre-aggregated dashboard asset in `public/data/` is included so the course demo works immediately after checkout. It contains aggregates generated from the sample, not row-level source records, and is shared under the dataset's CC BY-NC-SA 4.0 terms.

## Run locally

Requirements: Python 3.11 or 3.12, Node.js 22 or newer, and pnpm.

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
pnpm install --frozen-lockfile
pnpm run dev
```

Open the local URL printed by Vite. To regenerate the dashboard aggregates after downloading the sample:

```powershell
python scripts/prepare_data.py --input data/raw/US_Accidents_March23_sampled_500k.csv --output data/processed
```

To verify the project and create a production build:

```powershell
python -m pytest -v
pnpm run test -- --run
pnpm run build
pnpm run preview
```

The preparation pipeline writes a compressed dashboard bundle and a local data-quality report; only the compressed dashboard bundle and compact quality summary are copied to `public/data/`. Raw and processed source-level files must not be committed.

## Limitations

- These are historical accident-record counts and severity composition, not the probability of an accident for a trip. There is no denominator for trips or miles driven.
- Severity 1–4 describes traffic impact in the source; Severity 3–4 is the dashboard’s “high severity” group. It does not mean injury or fatality severity.
- The sample does not include vehicle make or model, so the dashboard cannot compare car models.
- Weather, visibility, and location fields can be missing or unevenly covered. Unknown values are retained as an explicit category where applicable.
- Descriptive associations do not establish cause, and are not safety, routing, underwriting, or claims recommendations.
- This dataset is licensed for non-commercial research/academic use under CC BY-NC-SA 4.0; check the license before reusing the data or derived materials for other purposes.

## Course demo

See [docs/demo-script.md](docs/demo-script.md) for a five-minute presentation outline. To publish, push the `main` branch and configure the repository's Pages source as **GitHub Actions**; the workflow builds and deploys `dist/` automatically.
