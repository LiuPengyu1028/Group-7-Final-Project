
from pathlib import Path

import pandas as pd
import plotly.express as px
import pydeck as pdk
import streamlit as st
from ai.context import build_ai_context
from ai.report import generate_ai_report
from ai.qa import answer_ai_question, format_qa_answer
# ----------------------------
# Page configuration
# ----------------------------
st.set_page_config(
    page_title="California Fleet Safety Dashboard",
    page_icon="🚗",
    layout="wide",
)

DATA_DIR = Path(__file__).parent / "data" / "processed" / "california_accidents"

st.title("California Fleet Accident Safety Dashboard")
st.caption(
    "Explore recorded traffic accidents in California from 2016 to March 2023. "
    "This dashboard describes recorded incidents, not population-adjusted risk."
)

# ----------------------------
# Load processed data
# ----------------------------
@st.cache_data
def load_data(data_dir: str) -> pd.DataFrame:
    folder = Path(data_dir)
    files = sorted(folder.glob("part-*.parquet"))

    if not files:
        raise FileNotFoundError(
            f"No Parquet files found in {folder}. "
            "Run data_processing.py first."
        )

    df = pd.concat(
        [pd.read_parquet(file) for file in files],
        ignore_index=True,
    )

    df["Start_Time"] = pd.to_datetime(
        df["Start_Time"], errors="coerce"
    )
    df["Severity"] = pd.to_numeric(
        df["Severity"], errors="coerce"
    )

    df = df.dropna(
        subset=["Start_Time", "Start_Lat", "Start_Lng"]
    )

    return df


try:
    with st.spinner("Loading California accident data..."):
        df = load_data(str(DATA_DIR))
except Exception as error:
    st.error(f"Could not load the dataset: {error}")
    st.stop()

# ----------------------------
# Sidebar filters
# ----------------------------
st.sidebar.header("Filters")

years = sorted(df["Year"].dropna().astype(int).unique().tolist())
selected_years = st.sidebar.multiselect(
    "Year",
    options=years,
    default=years,
)

weather_values = sorted(
    df["Weather_Condition"].dropna().astype(str).unique().tolist()
)
selected_weather = st.sidebar.multiselect(
    "Weather condition",
    options=weather_values,
    default=[],
    help="Leave empty to include all weather conditions.",
)

severity_values = sorted(
    df["Severity"].dropna().astype(int).unique().tolist()
)
selected_severity = st.sidebar.multiselect(
    "Severity level",
    options=severity_values,
    default=severity_values,
)

# Show the 100 cities with the most records.
top_cities = (
    df["City"]
    .dropna()
    .value_counts()
    .head(100)
    .index
    .tolist()
)

selected_cities = st.sidebar.multiselect(
    "City (top 100 by record count)",
    options=top_cities,
    default=[],
    help="Leave empty to include all cities.",
)

filtered = df.copy()

if selected_years:
    filtered = filtered[filtered["Year"].isin(selected_years)]
else:
    filtered = filtered.iloc[0:0]

if selected_weather:
    filtered = filtered[
        filtered["Weather_Condition"].isin(selected_weather)
    ]

if selected_severity:
    filtered = filtered[
        filtered["Severity"].isin(selected_severity)
    ]
else:
    filtered = filtered.iloc[0:0]

if selected_cities:
    filtered = filtered[filtered["City"].isin(selected_cities)]

# ----------------------------
# KPI metrics
# ----------------------------
st.subheader("Overview")

total_accidents = len(filtered)
cities = filtered["City"].nunique()
avg_severity = filtered["Severity"].mean()
weather_missing_pct = (
    filtered["Weather_Condition"].isna().mean() * 100
    if total_accidents > 0
    else 0
)

col1, col2, col3, col4 = st.columns(4)

col1.metric("Recorded accidents", f"{total_accidents:,}")
col2.metric("Cities represented", f"{cities:,}")
col3.metric(
    "Average severity score",
    f"{avg_severity:.2f}" if pd.notna(avg_severity) else "N/A",
)
col4.metric("Missing weather (%)", f"{weather_missing_pct:.1f}%")

st.caption(
    "Severity is the dataset's recorded 1–4 impact-severity score; "
    "it is not a count of injuries or fatalities."
)

if filtered.empty:
    st.warning("No records match these filters. Please change your selections.")
    st.stop()

# ----------------------------
# AI Context Builder - Integration Test
# ----------------------------

current_filters = {
    "years": selected_years,
    "weather": selected_weather,
    "severity": selected_severity,
    "cities": selected_cities,
}

ai_context = build_ai_context(filtered, current_filters)

# ----------------------------
# Time-of-day and weekday analysis
# ----------------------------
st.subheader("When Are Accidents Recorded?")

time_left, time_right = st.columns(2)

with time_left:
    hourly_counts = (
        filtered["Start_Time"]
        .dt.hour
        .value_counts()
        .reindex(range(24), fill_value=0)
        .sort_index()
        .rename_axis("Hour")
        .reset_index(name="Accident records")
    )

    fig_hourly = px.bar(
        hourly_counts,
        x="Hour",
        y="Accident records",
        title="Recorded accidents by hour of day",
        labels={
            "Hour": "Hour of day (24-hour clock)",
            "Accident records": "Accident records",
        },
    )
    fig_hourly.update_xaxes(dtick=2)
    st.plotly_chart(fig_hourly, width="stretch")

with time_right:
    weekday_order = [
        "Monday", "Tuesday", "Wednesday", "Thursday",
        "Friday", "Saturday", "Sunday"
    ]

    weekday_counts = (
        filtered["Start_Time"]
        .dt.day_name()
        .value_counts()
        .reindex(weekday_order, fill_value=0)
        .rename_axis("Day")
        .reset_index(name="Accident records")
    )

    fig_weekday = px.bar(
        weekday_counts,
        x="Day",
        y="Accident records",
        title="Recorded accidents by day of week",
        category_orders={"Day": weekday_order},
        labels={
            "Day": "Day of week",
            "Accident records": "Accident records",
        },
    )
    st.plotly_chart(fig_weekday, width="stretch")

# ----------------------------
# Accident trend
# ----------------------------
st.subheader("Accident Trends Over Time")

trend = (
    filtered.assign(MonthStart=filtered["Start_Time"].dt.to_period("M").dt.to_timestamp())
    .groupby("MonthStart")
    .size()
    .reset_index(name="Accident records")
)

fig_trend = px.line(
    trend,
    x="MonthStart",
    y="Accident records",
    markers=True,
    title="Recorded accidents by month",
    labels={
        "MonthStart": "Month",
        "Accident records": "Accident records",
    },
)
fig_trend.update_layout(
    hovermode="x unified",
    margin=dict(l=20, r=20, t=60, b=20),
)
st.plotly_chart(fig_trend, width="stretch")

# ----------------------------
# Severity and weather charts
# ----------------------------
left, right = st.columns(2)

with left:
    severity_counts = (
        filtered["Severity"]
        .value_counts()
        .sort_index()
        .rename_axis("Severity")
        .reset_index(name="Accident records")
    )

    fig_severity = px.bar(
        severity_counts,
        x="Severity",
        y="Accident records",
        title="Recorded accidents by severity",
        labels={
            "Severity": "Severity level",
            "Accident records": "Accident records",
        },
    )
    st.plotly_chart(fig_severity, width="stretch")

with right:
    weather_counts = (
        filtered["Weather_Condition"]
        .fillna("Unknown")
        .value_counts()
        .head(10)
        .rename_axis("Weather condition")
        .reset_index(name="Accident records")
    )

    fig_weather = px.bar(
        weather_counts.sort_values("Accident records"),
        x="Accident records",
        y="Weather condition",
        orientation="h",
        title="Top 10 recorded weather conditions",
        labels={"Accident records": "Accident records"},
    )
    st.plotly_chart(fig_weather, width="stretch")

# ----------------------------
# Weather and severity analysis
# ----------------------------
st.subheader("Weather Conditions and Accident Severity")

weather_severity = filtered.copy()

weather_severity["Weather_Group"] = (
    weather_severity["Weather_Condition"]
    .fillna("Unknown")
    .astype(str)
)

# Keep the most common weather groups to make the chart readable.
top_weather = (
    weather_severity["Weather_Group"]
    .value_counts()
    .head(8)
    .index
)

weather_severity = weather_severity[
    weather_severity["Weather_Group"].isin(top_weather)
]

weather_severity["Severity"] = (
    weather_severity["Severity"].astype("Int64").astype(str)
)

weather_table = (
    weather_severity
    .groupby(["Weather_Group", "Severity"], observed=True)
    .size()
    .reset_index(name="Accident records")
)

weather_left, weather_right = st.columns([3, 2])

with weather_left:
    fig_weather_severity = px.bar(
        weather_table,
        x="Weather_Group",
        y="Accident records",
        color="Severity",
        barmode="stack",
        title="Severity composition across common weather conditions",
        labels={
            "Weather_Group": "Recorded weather condition",
            "Accident records": "Accident records",
            "Severity": "Severity level",
        },
    )
    fig_weather_severity.update_layout(
        xaxis_tickangle=-30,
        legend_title_text="Severity",
    )
    st.plotly_chart(
        fig_weather_severity,
        width="stretch",
    )

with weather_right:
    severity_34 = (
        weather_severity.assign(
            Severe_Record=weather_severity["Severity"].isin(["3", "4"])
        )
        .groupby("Weather_Group", observed=True)
        .agg(
            Total_Records=("ID", "size"),
            Severity_3_4_Records=("Severe_Record", "sum"),
        )
        .reset_index()
    )

    severity_34["Severity 3–4 share (%)"] = (
        severity_34["Severity_3_4_Records"]
        / severity_34["Total_Records"]
        * 100
    )

    fig_severe_share = px.bar(
        severity_34.sort_values("Severity 3–4 share (%)"),
        x="Severity 3–4 share (%)",
        y="Weather_Group",
        orientation="h",
        title="Share of Severity 3–4 records",
        labels={
            "Weather_Group": "Recorded weather condition",
            "Severity 3–4 share (%)": "Share (%)",
        },
        hover_data=[
            "Total_Records",
            "Severity_3_4_Records",
        ],
    )
    st.plotly_chart(
        fig_severe_share,
        width="stretch",
    )

st.caption(
    "Severity 3–4 share is calculated within each displayed weather group. "
    "It describes recorded incidents, not the probability of a crash per trip."
)

# ----------------------------
# Fleet Safety Insights
# ----------------------------
st.subheader("Fleet Safety Insights")

if filtered.empty:
    st.info("No accident records match the current filters.")
else:
    insight_left, insight_middle, insight_right = st.columns(3)

    # Most common recorded accident hour
    with insight_left:
        valid_hours = filtered["Hour"].dropna()
        if not valid_hours.empty:
            busiest_hour = int(valid_hours.mode().iloc[0])
            st.metric(
                "Most Recorded Accident Hour",
                f"{busiest_hour:02d}:00–{(busiest_hour + 1) % 24:02d}:00",
            )
        else:
            st.metric("Most Recorded Accident Hour", "N/A")

    # Most common recorded weather condition
    with insight_middle:
        weather_counts = (
            filtered["Weather_Condition"]
            .fillna("Unknown")
            .astype(str)
            .value_counts()
        )

        if not weather_counts.empty:
            common_weather = weather_counts.index[0]
            st.metric(
                "Most Recorded Weather",
                common_weather,
            )
        else:
            st.metric("Most Recorded Weather", "N/A")

    # Share of records with Severity 3 or 4
    with insight_right:
        valid_severity = filtered["Severity"].dropna()

        if not valid_severity.empty:
            severe_share = (
                valid_severity.isin([3, 4]).mean() * 100
            )
            st.metric(
                "Severity 3–4 Record Share",
                f"{severe_share:.1f}%",
            )
        else:
            st.metric("Severity 3–4 Record Share", "N/A")

st.caption(
    "Insights update with the selected filters. "
    "They describe recorded accident data, not crash risk per trip."
)

# ----------------------------
# Interactive accident map
# ----------------------------
st.subheader("Accident Location Map")

st.caption(
    "Each point represents a recorded accident. "
    "The map displays up to 5,000 sampled records for performance; "
    "the KPI metrics above use all records matching the filters."
)

map_columns = [
    "Start_Lat",
    "Start_Lng",
    "Severity",
    "City",
    "Weather_Condition",
    "Start_Time",
]

map_data = filtered[map_columns].dropna(
    subset=["Start_Lat", "Start_Lng"]
)

# Sample only for map rendering; do not change dashboard statistics.
if len(map_data) > 5000:
    map_data = map_data.sample(n=5000, random_state=42)

if map_data.empty:
    st.info("No valid accident coordinates match these filters.")
else:
    center_lat = float(map_data["Start_Lat"].median())
    center_lng = float(map_data["Start_Lng"].median())

    layer = pdk.Layer(
        "ScatterplotLayer",
        data=map_data,
        get_position=["Start_Lng", "Start_Lat"],
        get_radius=700,
        get_fill_color=[220, 55, 55, 130],
        pickable=True,
        auto_highlight=True,
    )

    view_state = pdk.ViewState(
        latitude=center_lat,
        longitude=center_lng,
        zoom=5,
        pitch=0,
    )

    deck = pdk.Deck(
        layers=[layer],
        initial_view_state=view_state,
        tooltip={
            "text": (
                "City: {City}\n"
                "Severity: {Severity}\n"
                "Weather: {Weather_Condition}\n"
                "Time: {Start_Time}"
            )
        },
        map_style=None,
    )

    st.pydeck_chart(deck, width="stretch")
# ----------------------------
# Data preview
# ----------------------------
with st.expander("Preview filtered records"):
    preview_columns = [
        "ID",
        "Start_Time",
        "City",
        "County",
        "Severity",
        "Weather_Condition",
        "Temperature(F)",
        "Start_Lat",
        "Start_Lng",
    ]
    available_columns = [
        column for column in preview_columns if column in filtered.columns
    ]

    st.dataframe(
        filtered[available_columns].head(1000),
        width="stretch",
        hide_index=True,
    )

st.caption(
    "Source: US Accidents (2016–2023), supplied CSV. "
    "Only California records with usable timestamps and coordinates "
    "are included in this processed dataset."
)
# ----------------------------
# AI Fleet Safety Assistant
# ----------------------------
st.divider()

st.header("AI Fleet Safety Assistant")

st.caption(
    "AI-generated analysis based on the currently selected "
    "dashboard filters and aggregated historical accident statistics. "
    "Results are descriptive and do not represent accident probabilities."
)

report_tab, qa_tab = st.tabs(
    ["AI Report", "AI Q&A"]
)

with report_tab:
    st.subheader("AI Accident Analysis Report")

    st.write(
        "Generate a structured AI report using the current "
        "dashboard filters and statistical summary."
    )

    if st.button(
        "Generate Report",
        key="generate_ai_report_button",
        type="primary",
    ):
        try:
            with st.spinner("Generating AI report..."):
                report = generate_ai_report(ai_context)

            st.session_state["ai_report"] = report
            st.session_state["ai_report_filters"] = current_filters.copy()

        except Exception as error:
            st.error(
                "AI report generation failed. "
                "Please check the API connection or report validation."
            )

            print(
                f"[AI REPORT ERROR] {type(error).__name__}: {str(error)[:200]}",
                flush=True,
            )

    saved_report = st.session_state.get("ai_report")
    saved_filters = st.session_state.get("ai_report_filters")

    if saved_report:
        if saved_filters != current_filters:
            st.warning(
                "Dashboard filters have changed. "
                "Please generate a new report."
            )
        else:
            st.markdown("### 1. Analysis Scope")
            st.write(saved_report["analysis_scope"])

            st.markdown("### 2. Key Finding")
            st.write(saved_report["key_finding"])

            st.markdown("### 3. Supporting Evidence")
            st.write(saved_report["supporting_evidence"])

            st.markdown("### 4. Suggested Follow-up")
            st.write(saved_report["suggested_follow_up"])

            st.markdown("### 5. Data Limitation")
            st.write(saved_report["data_limitation"])

with qa_tab:
    st.subheader("Ask Questions About Accident Data")

    st.caption(
        "Ask questions about the currently filtered "
        "California accident statistics."
    )

    user_question = st.text_area(
        "Your question",
        placeholder=(
            "Example: Which hour has the highest "
            "number of recorded accidents?"
        ),
        height=100,
        key="ai_qa_question",
    )

    if st.button(
        "Ask AI",
        key="ask_ai_button",
        type="primary",
    ):
        if not user_question.strip():
            st.warning("Please enter a question first.")
        else:
            try:
                with st.spinner("Generating AI answer..."):
                    answer = answer_ai_question(
                        user_question,
                        ai_context,
                    )

                st.session_state["ai_qa_answer"] = answer
                st.session_state["ai_qa_filters"] = current_filters.copy()
                st.session_state["ai_qa_saved_question"] = user_question.strip()

            except Exception as error:
                st.error(
                    "AI Q&A failed. Please check the API connection."
                )
                print(
                    f"[AI QA ERROR] {type(error).__name__}",
                    flush=True,
                )

    saved_answer = st.session_state.get("ai_qa_answer")
    saved_qa_filters = st.session_state.get("ai_qa_filters")
    saved_question = st.session_state.get("ai_qa_saved_question")

    if saved_answer:
        if saved_qa_filters != current_filters:
            st.warning(
                "Dashboard filters have changed. "
                "Please ask your question again."
            )
        elif saved_question != user_question.strip():
            st.info(
                "The question has changed. "
                "Click Ask AI to generate an updated answer."
            )
        else:
            st.markdown("### AI Answer")
            st.markdown(format_qa_answer(saved_answer))

            st.caption(
                "AI-generated interpretation of historical accident data. "
                "Verify important findings against the dashboard statistics."
            )