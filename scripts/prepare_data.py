"""Prepare compact, documented aggregates for the static dashboard."""

from __future__ import annotations

import argparse
import gzip
import json
import re
import shutil
from pathlib import Path
from typing import Any

import pandas as pd


SOURCE_URL = "https://www.kaggle.com/datasets/sobhanmoosavi/us-accidents"
MAX_ASSET_BYTES = 5 * 1024 * 1024
SEVERITIES = (1, 2, 3, 4)
WEATHER_GROUPS = (
    "Clear/Fair",
    "Cloudy",
    "Rain",
    "Snow/Ice",
    "Fog/Haze",
    "Wind/Storm",
    "Other/Unknown",
)
VISIBILITY_GROUPS = (
    "Very low (<1 mi)",
    "Low (1–3 mi)",
    "Moderate (3–10 mi)",
    "Good (≥10 mi)",
    "Unknown",
)
TIME_GROUPS = (
    "Night (00:00–05:59)",
    "Morning (06:00–11:59)",
    "Afternoon (12:00–17:59)",
    "Evening (18:00–23:59)",
)
WEEKDAYS = ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
REQUIRED_COLUMNS = (
    "ID",
    "Severity",
    "Start_Time",
    "State",
    "City",
    "Weather_Condition",
    "Visibility(mi)",
)
OPTIONAL_COLUMNS = (
    "Start_Lat",
    "Start_Lng",
    "Temperature(F)",
    "Humidity(%)",
    "Wind_Speed(mph)",
    "Precipitation(in)",
    "Sunrise_Sunset",
    "Junction",
    "Crossing",
    "Traffic_Signal",
)


def normalize_weather(value: str | None) -> str:
    """Map source weather descriptions to the dashboard's finite taxonomy."""
    if value is None or pd.isna(value) or not str(value).strip():
        return "Other/Unknown"
    text = re.sub(r"\s+", " ", str(value)).strip().lower()
    if any(token in text for token in ("fog", "haze", "mist")):
        return "Fog/Haze"
    if any(token in text for token in ("snow", "ice", "sleet", "wintry")):
        return "Snow/Ice"
    if any(token in text for token in ("thunder", "storm", "tornado", "squall", "wind")):
        return "Wind/Storm"
    if any(token in text for token in ("rain", "drizzle", "shower")):
        return "Rain"
    if any(token in text for token in ("cloud", "overcast")):
        return "Cloudy"
    if any(token in text for token in ("clear", "fair", "sunny")):
        return "Clear/Fair"
    return "Other/Unknown"


def visibility_band(value: float | None) -> str:
    """Bucket a visibility measurement using left-closed interval boundaries."""
    if value is None or pd.isna(value) or float(value) < 0:
        return "Unknown"
    miles = float(value)
    if miles < 1:
        return "Very low (<1 mi)"
    if miles < 3:
        return "Low (1–3 mi)"
    if miles < 10:
        return "Moderate (3–10 mi)"
    return "Good (≥10 mi)"


def time_of_day(timestamp: pd.Timestamp) -> str:
    """Return one of four local-time bands from the accident start timestamp."""
    hour = pd.Timestamp(timestamp).hour
    if hour < 6:
        return TIME_GROUPS[0]
    if hour < 12:
        return TIME_GROUPS[1]
    if hour < 18:
        return TIME_GROUPS[2]
    return TIME_GROUPS[3]


def high_severity_share(total: int, high_severity: int) -> float | None:
    """Return the recorded high-severity composition, or None for no records."""
    if total <= 0:
        return None
    return high_severity / total


def _records(frame: pd.DataFrame, dimensions: list[str]) -> list[dict[str, Any]]:
    grouped = frame.groupby(dimensions, dropna=False, observed=True).size().rename("count").reset_index()
    return grouped.to_dict(orient="records")


def _load_source(path: Path) -> tuple[pd.DataFrame, dict[str, Any]]:
    header = pd.read_csv(path, nrows=0).columns.tolist()
    missing = [column for column in REQUIRED_COLUMNS if column not in header]
    if missing:
        raise ValueError(f"Input CSV is missing required columns: {', '.join(missing)}")
    columns = [column for column in (*REQUIRED_COLUMNS, *OPTIONAL_COLUMNS) if column in header]
    source = pd.read_csv(path, usecols=columns, low_memory=False)
    input_rows = len(source)
    null_rates = {
        column: round(float(source[column].isna().mean()), 6)
        for column in columns
    }
    duplicate_mask = source["ID"].duplicated(keep="first")
    duplicate_rows = int(duplicate_mask.sum())
    source = source.loc[~duplicate_mask].copy()
    source["Severity"] = pd.to_numeric(source["Severity"], errors="coerce")
    invalid_severity = ~source["Severity"].isin(SEVERITIES)
    invalid_severity_rows = int(invalid_severity.sum())
    source = source.loc[~invalid_severity].copy()
    source["Start_Time"] = pd.to_datetime(source["Start_Time"], errors="coerce", format="mixed")
    invalid_timestamp = source["Start_Time"].isna()
    invalid_timestamp_rows = int(invalid_timestamp.sum())
    source = source.loc[~invalid_timestamp].copy()

    quality = {
        "inputRows": input_rows,
        "retainedRows": len(source),
        "duplicateRows": duplicate_rows,
        "invalidSeverityRows": invalid_severity_rows,
        "invalidTimestampRows": invalid_timestamp_rows,
        "nullRates": null_rates,
        "dateCoverage": {
            "start": source["Start_Time"].min().isoformat() if not source.empty else None,
            "end": source["Start_Time"].max().isoformat() if not source.empty else None,
        },
    }
    return source, quality


def _derive(frame: pd.DataFrame) -> pd.DataFrame:
    data = frame.copy()
    data["year"] = data["Start_Time"].dt.year.astype(int)
    data["month"] = data["Start_Time"].dt.strftime("%Y-%m")
    data["weekday"] = data["Start_Time"].dt.day_name()
    data["hour"] = data["Start_Time"].dt.hour.astype(int)
    data["state"] = data["State"].fillna("Unknown").astype(str).str.strip().replace("", "Unknown")
    data["city"] = data["City"].fillna("Unknown").astype(str).str.strip().replace("", "Unknown")
    data["weather"] = data["Weather_Condition"].map(normalize_weather)
    data["visibilityBand"] = data["Visibility(mi)"].map(visibility_band)
    data["timeOfDay"] = data["Start_Time"].map(time_of_day)
    data["severity"] = data["Severity"].astype(int)
    return data


def prepare_data(input_path: Path, output_dir: Path) -> None:
    """Create filtered chart aggregates and an auditable data-quality summary."""
    source, quality = _load_source(Path(input_path))
    data = _derive(source)
    dimensions = ["state", "year", "weather", "visibilityBand", "timeOfDay", "severity"]
    overview = _records(data, dimensions)
    monthly = _records(data, [*dimensions, "month"])
    weather_severity = _records(
        data,
        ["state", "year", "visibilityBand", "timeOfDay", "weather", "severity"],
    )
    visibility_severity = _records(
        data,
        ["state", "year", "weather", "timeOfDay", "visibilityBand", "severity"],
    )
    hour_weekday = _records(
        data,
        ["state", "year", "weather", "visibilityBand", "timeOfDay", "weekday", "hour", "severity"],
    )
    states = _records(data, [*dimensions])
    city_totals = data.groupby(["state", "city"], dropna=False, observed=True).size().rename("count").reset_index()
    top_city_pairs = city_totals.loc[city_totals["count"] >= 30].nlargest(2000, "count")
    selected_city_pairs = set(zip(top_city_pairs["state"], top_city_pairs["city"]))
    selected_city_rows = data.loc[
        [(state, city) in selected_city_pairs for state, city in zip(data["state"], data["city"])]
    ]
    cities = _records(selected_city_rows, [*dimensions, "city"])

    dashboard = {
        "metadata": {
            "source": "US Accidents (2016–2023)",
            "sourceUrl": SOURCE_URL,
            "author": "Sobhan Moosavi",
            "license": "CC BY-NC-SA 4.0",
            "severityDefinition": "Severity 1–4 measures traffic impact; 3–4 is grouped as high severity.",
            "interpretation": "Historical accident-record counts and severity composition; not future trip probability.",
        },
        "overview": overview,
        "monthly": monthly,
        "weatherSeverity": weather_severity,
        "visibilitySeverity": visibility_severity,
        "hourWeekday": hour_weekday,
        "states": states,
        "cities": cities,
    }
    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)
    dashboard_path = output / "dashboard-data.bin"
    quality_path = output / "data-quality.json"
    dashboard_bytes = json.dumps(dashboard, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    dashboard_path.write_bytes(gzip.compress(dashboard_bytes, compresslevel=9, mtime=0))
    quality_path.write_text(
        json.dumps(quality, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    size = dashboard_path.stat().st_size + quality_path.stat().st_size
    if size > MAX_ASSET_BYTES:
        dashboard_path.unlink(missing_ok=True)
        quality_path.unlink(missing_ok=True)
        raise ValueError(
            f"Processed assets are {size / (1024 * 1024):.2f} MB; the course demo limit is 5 MB. "
            "Reduce the aggregation grain or process fewer source rows."
        )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True, help="Path to the Kaggle sample CSV")
    parser.add_argument("--output", type=Path, default=Path("data/processed"))
    arguments = parser.parse_args()
    prepare_data(arguments.input, arguments.output)
    public_data = Path("public/data")
    public_data.mkdir(parents=True, exist_ok=True)
    shutil.copy2(arguments.output / "dashboard-data.bin", public_data / "dashboard-data.bin")
    shutil.copy2(arguments.output / "data-quality.json", public_data / "data-quality.json")
    print(f"Wrote dashboard aggregates to {public_data} and a local quality summary to {arguments.output}")


if __name__ == "__main__":
    main()
