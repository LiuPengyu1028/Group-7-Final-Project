
import pandas as pd


def build_ai_context(filtered: pd.DataFrame, filters: dict) -> dict:
    """
    Build a compact statistical context for the AI features.

    All statistics are calculated from the currently filtered
    California accident records.
    """
    if filtered.empty:
        raise ValueError("No accident records match the selected filters.")

    total = len(filtered)

    # Basic statistics
    average_severity = filtered["Severity"].mean()
    severity_34_count = int(filtered["Severity"].isin([3, 4]).sum())

    # Hourly accident distribution
    hourly_counts = (
        filtered["Start_Time"]
        .dt.hour
        .value_counts()
        .reindex(range(24), fill_value=0)
        .sort_index()
    )

    # Weekday distribution
    weekday_order = [
        "Monday", "Tuesday", "Wednesday", "Thursday",
        "Friday", "Saturday", "Sunday"
    ]

    weekday_counts = (
        filtered["Start_Time"]
        .dt.day_name()
        .value_counts()
        .reindex(weekday_order, fill_value=0)
    )

    # Monthly accident trend
    monthly_counts = (
        filtered["Start_Time"]
        .dt.to_period("M")
        .value_counts()
        .sort_index()
    )

    # Severity distribution
    severity_counts = (
        filtered["Severity"]
        .value_counts()
        .sort_index()
    )

    # Weather distribution
    weather_counts = (
        filtered["Weather_Condition"]
        .fillna("Unknown")
        .value_counts()
    )

    # Top cities within the current selection
    city_counts = (
        filtered["City"]
        .fillna("Unknown")
        .value_counts()
        .head(10)
    )

    # Weather and severity cross-tabulation
    top_weather = weather_counts.head(8).index
    weather_severity = pd.crosstab(
        filtered["Weather_Condition"].fillna("Unknown"),
        filtered["Severity"],
    )
    weather_severity = weather_severity.reindex(
        top_weather, fill_value=0
    )

    context = {
        "scope": {
            "location": "California",
            "filters": filters,
            "record_count": total,
            "data_type": "historical recorded accidents",
        },
        "summary": {
            "total_accidents": total,
            "average_severity": (
                round(float(average_severity), 2)
                if pd.notna(average_severity)
                else None
            ),
            "severity_3_4_count": severity_34_count,
            "severity_3_4_share_pct": round(
                severity_34_count / total * 100, 2
            ),
        },
        "distributions": {
            "hourly": {
                str(int(k)): int(v)
                for k, v in hourly_counts.items()
            },
            "weekday": {
                str(k): int(v)
                for k, v in weekday_counts.items()
            },
            "monthly": {
                str(k): int(v)
                for k, v in monthly_counts.items()
            },
            "severity": {
                str(k): int(v)
                for k, v in severity_counts.items()
            },
            "weather_top_10": {
                str(k): int(v)
                for k, v in weather_counts.head(10).items()
            },
            "city_top_10": {
                str(k): int(v)
                for k, v in city_counts.items()
            },
            "weather_severity_top_8": {
                str(weather): {
                    str(severity): int(count)
                    for severity, count in row.items()
                }
                for weather, row in weather_severity.iterrows()
            },
        },
        "limitations": [
            "The dataset contains recorded accidents, not all vehicle trips.",
            "Accident counts do not measure crash probability or exposure-adjusted risk.",
            "The data cover California from 2016 to March 2023.",
            "Severity is a recorded impact-severity score, not an injury or fatality count.",
            "Weather and city distributions are limited to the top 10 categories.",
            "Weather-severity cross-tabulation covers the top 8 weather categories.",
            "Descriptive associations do not establish causation.",
        ],
    }

    return context
