import json
from pathlib import Path

import pandas as pd
import pytest

from scripts.prepare_data import (
    high_severity_share,
    normalize_weather,
    prepare_data,
    time_of_day,
    visibility_band,
)


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        (0.9, "Very low (<1 mi)"),
        (1, "Low (1–3 mi)"),
        (3, "Moderate (3–10 mi)"),
        (10, "Good (≥10 mi)"),
        (None, "Unknown"),
    ],
)
def test_visibility_band_boundaries(value, expected):
    assert visibility_band(value) == expected


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        (None, "Other/Unknown"),
        ("Heavy Rain", "Rain"),
        ("Light Snow", "Snow/Ice"),
        ("Fair", "Clear/Fair"),
        ("Dense Fog", "Fog/Haze"),
        ("Overcast", "Cloudy"),
        ("Thunderstorm", "Wind/Storm"),
        ("Unusual condition", "Other/Unknown"),
    ],
)
def test_weather_is_normalized_to_documented_groups(value, expected):
    assert normalize_weather(value) == expected


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ("2022-01-01 00:00", "Night (00:00–05:59)"),
        ("2022-01-01 05:59", "Night (00:00–05:59)"),
        ("2022-01-01 06:00", "Morning (06:00–11:59)"),
        ("2022-01-01 12:00", "Afternoon (12:00–17:59)"),
        ("2022-01-01 18:00", "Evening (18:00–23:59)"),
    ],
)
def test_time_of_day_boundaries(value, expected):
    assert time_of_day(pd.Timestamp(value)) == expected


def test_high_severity_share_handles_empty_denominator():
    assert high_severity_share(0, 0) is None
    assert high_severity_share(4, 2) == 0.5


def test_pipeline_deduplicates_and_excludes_invalid_severity(tmp_path: Path):
    fixture = Path(__file__).parent / "fixtures" / "accidents_small.csv"
    prepare_data(fixture, tmp_path)

    dashboard = json.loads((tmp_path / "dashboard-data.json").read_text(encoding="utf-8"))
    quality = json.loads((tmp_path / "data-quality.json").read_text(encoding="utf-8"))

    assert sum(row["count"] for row in dashboard["overview"]) == 4
    assert quality["inputRows"] == 6
    assert quality["retainedRows"] == 4
    assert quality["duplicateRows"] == 1
    assert quality["invalidSeverityRows"] == 1
    assert any(row["weather"] == "Other/Unknown" for row in dashboard["weatherSeverity"])

