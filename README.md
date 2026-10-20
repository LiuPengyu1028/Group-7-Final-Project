
# California Fleet Safety Dashboard

## 1. Project Overview

This project develops an interactive dashboard for fleet safety analysis using the US Accidents dataset (2016–2023).

The first version focuses on California and is designed for fleet managers who want to explore recorded accident patterns by time, weather condition, severity level, and location.

## 2. Target Audience

**Primary audience:** Fleet managers and fleet safety teams.

The dashboard helps users explore historical accident records and identify patterns that may deserve further safety investigation.

## 3. Dataset

Source: [US Accidents (2016–2023) on Kaggle](https://www.kaggle.com/datasets/sobhanmoosavi/us-accidents)

The original dataset contains accident records collected across the United States. This project processes the data to retain California records and selected fields relevant to fleet safety analysis.

The original CSV and processed data files are not included in this repository because of their large size.

## 4. Data Processing

The `data_processing.py` script:

- Reads the original CSV in chunks to reduce memory pressure.
- Selects records for California.
- Retains selected accident, time, location, weather, and road-feature columns.
- Creates time-based features, including year, month, hour, and day of week.
- Excludes records with missing timestamps or coordinates from the processed output.
- Saves the processed data as Parquet files.

## 5. Dashboard Features

The Streamlit dashboard (`app.py`) includes:

- Key metrics for filtered accident records.
- Interactive filters for year, weather condition, severity, and city.
- Monthly accident-record trends.
- Accident-record counts by severity.
- Common recorded weather conditions.
- Accident patterns by hour and day of week.
- Weather-condition and severity comparisons.
- An interactive map of sampled accident locations.
- Automatically updated fleet safety insights.

## 6. Technology Stack

- Python
- pandas
- Streamlit
- Plotly
- PyDeck
- PyArrow
- Parquet

## 7. Local Setup

### Prerequisites

Install Python and Git. Download the original dataset from the Kaggle source above.

### Step 1: Create and activate a virtual environment

From the project directory, run:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### Step 2: Install dependencies

```powershell
pip install -r requirements.txt
```

### Step 3: Place the source data

Place the downloaded CSV at the location expected by `data_processing.py`.

Check the source-data path in that script and update it if necessary.

### Step 4: Process the dataset

```powershell
python data_processing.py
```

### Step 5: Launch the dashboard

```powershell
python -m streamlit run app.py
```

Streamlit will display a local URL in the terminal, usually `http://localhost:8501`.

## 8. Important Limitations

- The dataset contains recorded accidents, not every trip or vehicle movement.
- Accident-record counts should not be interpreted as accident rates or the probability of a crash per trip.
- The dataset's `Severity` field is a severity score and should not be treated as a direct count of injuries or fatalities.
- Weather associations are descriptive and do not establish causation.
- The map displays a sample of records for performance reasons.
- Results depend on the source dataset's coverage and data quality.

## 9. Project Structure

```text
us-accidents-dashboard/
├── app.py
├── data_processing.py
├── requirements.txt
├── README.md
├── .gitignore
├── data/
│   └── processed/
└── outputs/
```
## 10. AI Features

The dashboard includes two AI-assisted features powered by OpenRouter.

### AI Report

- Generates a written summary based on the currently filtered accident records.
- Highlights descriptive patterns relevant to fleet safety management.
- Uses aggregated dashboard statistics as context.

### AI Q&A

- Allows users to ask questions about the filtered accident data.
- Provides explanations based on the supplied statistical context.
- Does not independently access the full accident dataset.

AI-generated responses are intended to support exploratory analysis. They may contain errors and should not be treated as verified safety recommendations or causal conclusions.

## 11. OpenRouter Configuration

AI features require an OpenRouter API key.

Create a file named `.env` in the project root directory and add:

```text
OPENROUTER_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your own OpenRouter API key.

The `.env` file is excluded from Git through `.gitignore`.

**Never commit or share your API key.**

The dashboard's non-AI visualizations can be used without configuring OpenRouter.

## 12. Data Preparation for Team Members

1. Download the US Accidents dataset from the Kaggle link in Section 3.
2. Create the directory `data/raw/` in the project root.
3. Place `US_Accidents_March23.csv` inside `data/raw/`.
4. Install dependencies using `pip install -r requirements.txt`.
5. Run `python data_processing.py` from the project root.
6. The script generates Parquet files in `data/processed/california_accidents/`.
7. Run `python -m streamlit run app.py` to start the dashboard.

The original CSV and generated Parquet files are excluded from GitHub because of their size.

## 13. Updated Project Structure

```text
Group-7-Final-Project/
├── app.py
├── data_processing.py
├── requirements.txt
├── README.md
├── .gitignore
├── .env                  # Local only; not committed
├── ai/
│   ├── client.py
│   ├── context.py
│   ├── qa.py
│   ├── report.py
│   └── validation.py
└── data/
    ├── raw/
    │   └── US_Accidents_March23.csv
    └── processed/
        └── california_accidents/
            └── part-*.parquet
```

**Note:** The data files shown above are created or downloaded locally and are not included in the GitHub repository.