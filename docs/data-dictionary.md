# Data dictionary

Source records come from [US Accidents (2016–2023)](https://www.kaggle.com/datasets/sobhanmoosavi/us-accidents), authored by Sobhan Moosavi and licensed CC BY-NC-SA 4.0. The dashboard uses the sampled file and processes it locally.

| Source field | Derived field | Display / handling | Interpretation limit |
| --- | --- | --- | --- |
| `ID` | — | Unique accident record; duplicate IDs after the first are dropped | A record is not a trip or exposure denominator |
| `Severity` | `severity` | Integer 1–4; 3–4 is grouped as high severity | Traffic impact, not injury or fatality severity |
| `Start_Time` | `year`, `month`, `weekday`, `hour`, `timeOfDay` | Local source time; four six-hour bands | Source date gaps may affect temporal comparisons |
| `State` | `state` | Missing/blank becomes `Unknown` | Coverage differs by location |
| `City` | `city` | Missing/blank becomes `Unknown`; city groups below 30 records are omitted | Small groups are not ranked |
| `Weather_Condition` | `weather` | Clear/Fair, Cloudy, Rain, Snow/Ice, Fog/Haze, Wind/Storm, Other/Unknown | Broad, rule-based groups summarize source text |
| `Visibility(mi)` | `visibilityBand` | `<1`, `1–<3`, `3–<10`, `≥10` miles; missing/negative becomes `Unknown` | Missingness may differ by source and region |
| Accident start coordinates | — | Reserved for optional sampled-point map; state and city tables are primary | Location points show recorded accidents, not relative trip risk |

Weather fields outside the documented keyword groups become `Other/Unknown`. Required fields are ID, Severity, Start_Time, State, City, Weather_Condition, and Visibility(mi); the processing script stops with a clear error when required columns are absent. Rows with invalid severity or timestamps and duplicate IDs are excluded and counted in `data-quality.json`.
