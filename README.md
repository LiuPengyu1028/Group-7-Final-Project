# California Fleet Safety Dashboard

## 1. Project Overview

This project develops an interactive fleet safety dashboard using the US Accidents dataset (2016–2023), with an initial focus on California.

The dashboard is designed for fleet managers and fleet safety teams to explore historical accident patterns by time, weather condition, severity level, and geographic location.

**Live Dashboard:** https://california-fleet-safety-g7.streamlit.app/

## 2. Target Audience

**Primary audience:** Fleet managers and fleet safety teams.

The dashboard supports exploratory analysis of recorded accidents and helps identify patterns that may warrant further safety investigation. It does not estimate the probability of an accident for an individual driver or vehicle.

## 3. Dataset

**Source:** [US Accidents (2016–2023) on Kaggle](https://www.kaggle.com/datasets/sobhanmoosavi/us-accidents)

The project focuses on California accident records and selected fields relevant to fleet safety analysis.

- The original CSV dataset is not included in this GitHub repository.
- Processed California accident data is included as Parquet files in `data/processed/california_accidents/`.
- The dashboard reads the processed Parquet files directly, so downloading the original CSV is not required for normal operation.

## 4. Data Processing

The `data_processing.py` script:

- Reads the original CSV in chunks.
- Selects California accident records.
- Retains selected accident, time, location, weather, and road-feature variables.
- Creates additional time-based features.
- Saves the processed records as Parquet files.

The script uses the following paths relative to the project root:

- Input: `data/raw/US_Accidents_March23.csv`
- Output: `data/processed/california_accidents/`

The original dataset is only required when regenerating the processed data.

## 5. Dashboard Features

The Streamlit dashboard (`app.py`) includes:

- Key metrics based on filtered accident records.
- Interactive filters for year, weather condition, severity, and city.
- Monthly accident-record trends.
- Accident counts by severity level.
- Recorded weather-condition distributions.
- Accident patterns by hour and weekday.
- Comparisons of weather conditions and severity.
- An interactive map of accident locations.
- Fleet safety insights based on descriptive statistics.

The map displays up to 5,000 sampled accident records for performance, while dashboard summary metrics use the full filtered dataset.

## 6. AI Features

The dashboard provides two AI-assisted features powered by OpenRouter.

### AI Report

- Generates a written report using aggregated statistics from the current dashboard filters.
- Summarizes descriptive accident patterns relevant to fleet safety analysis.

### AI Q&A

- Allows users to ask questions about the filtered accident data.
- Generates explanations using statistical context prepared by the application.
- Does not independently query the full underlying dataset.

AI-generated content may contain errors. It is intended to support exploratory analysis and should not be interpreted as verified safety advice or evidence of causation.

## 7. Technology Stack

- Python
- Streamlit
- pandas
- Plotly
- PyDeck
- PyArrow and Parquet
- OpenRouter API
- OpenAI-compatible Python client

## 8. Local Setup

### Step 1: Clone the repository

```powershell
git clone https://github.com/LiuPengyu1028/Group-7-Final-Project.git
cd Group-7-Final-Project
```

### Step 2: Create a virtual environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### Step 3: Install dependencies

```powershell
pip install -r requirements.txt
```

### Step 4: Launch the dashboard

The repository already contains the processed Parquet files required by the dashboard.

```powershell
python -m streamlit run app.py
```

Open the local URL displayed by Streamlit, usually `http://localhost:8501`.

The non-AI dashboard features do not require an OpenRouter API key.

## 9. OpenRouter Configuration

AI Report and AI Q&A require an OpenRouter API key.

### Local development

Create a `.env` file in the project root:

```text
OPENROUTER_API_KEY=your_api_key_here
```

The application loads this file and reads the key from the `OPENROUTER_API_KEY` environment variable.

### Cloud deployment

Configure `OPENROUTER_API_KEY` securely in the deployment environment. For Streamlit Community Cloud, use the application's Secrets configuration and verify that the key is accessible to the AI client as an environment variable.

**Never commit API keys, `.env` files, or other credentials to GitHub.**

## 10. Regenerating the Processed Dataset (Optional)

To reproduce the data-processing step:

1. Download the original US Accidents dataset from Kaggle.
2. Place `US_Accidents_March23.csv` in `data/raw/`.
3. Run the processing script:

```powershell
python data_processing.py
```

The script writes processed Parquet files to `data/processed/california_accidents/`.

This step is optional for users who only want to run the existing dashboard.

## 11. Project Structure

```text
Group-7-Final-Project/
├── app.py
├── data_processing.py
├── requirements.txt
├── README.md
├── .gitignore
├── ai/
│   ├── client.py
│   ├── context.py
│   ├── qa.py
│   ├── report.py
│   └── validation.py
└── data/
    ├── raw/
    │   └── US_Accidents_March23.csv   # Not committed
    └── processed/
        └── california_accidents/
            └── part-*.parquet          # Included in GitHub
```

The `.env` file and virtual environment are local development files and are not committed.

## 12. Limitations and Responsible Use

- The dataset contains recorded accidents rather than all vehicle trips or movements.
- Accident counts must not be interpreted as accident rates or individual crash probabilities.
- The recorded `Severity` field is not a direct count of injuries or fatalities.
- Relationships between weather conditions and accidents are descriptive and do not establish causation.
- The map displays sampled records for performance.
- Results depend on the source dataset's coverage, completeness, and data quality.
- AI-generated interpretations require independent verification before operational use.