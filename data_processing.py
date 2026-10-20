
from pathlib import Path
import pandas as pd

DATA_PATH = Path(__file__).resolve().parent / "data" / "raw" / "US_Accidents_March23.csv"
OUTPUT_DIR = Path(__file__).resolve().parent / "data" / "processed" / "california_accidents"
CHUNK_SIZE = 200_000

# Only keep fields needed for the first dashboard version.
USECOLS = [
    "ID",
    "Severity",
    "Start_Time",
    "Start_Lat",
    "Start_Lng",
    "Distance(mi)",
    "City",
    "County",
    "State",
    "Temperature(F)",
    "Humidity(%)",
    "Visibility(mi)",
    "Wind_Speed(mph)",
    "Precipitation(in)",
    "Weather_Condition",
    "Junction",
    "Traffic_Signal",
    "Sunrise_Sunset",
]

def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Remove old output parts so rerunning does not duplicate records.
    for old_file in OUTPUT_DIR.glob("part-*.parquet"):
        old_file.unlink()

    total_rows = 0
    california_rows = 0
    saved_rows = 0
    part_number = 0

    print("Processing California accident records...")

    for chunk in pd.read_csv(
        DATA_PATH,
        usecols=USECOLS,
        chunksize=CHUNK_SIZE,
        low_memory=False,
    ):
        total_rows += len(chunk)

        # Keep California records only.
        ca = chunk.loc[chunk["State"].eq("CA")].copy()
        california_rows += len(ca)

        if ca.empty:
            continue

        # Parse time and remove unusable timestamps.
        ca["Start_Time"] = pd.to_datetime(
            ca["Start_Time"], errors="coerce"
        )
        ca = ca.dropna(
            subset=["Start_Time", "Start_Lat", "Start_Lng"]
        )

        # Create useful time features.
        ca["Year"] = ca["Start_Time"].dt.year
        ca["Month"] = ca["Start_Time"].dt.month
        ca["Hour"] = ca["Start_Time"].dt.hour
        ca["DayOfWeek"] = ca["Start_Time"].dt.day_name()

        output_file = OUTPUT_DIR / f"part-{part_number:04d}.parquet"
        ca.to_parquet(output_file, index=False)

        saved_rows += len(ca)
        part_number += 1

        print(
            f"Scanned {total_rows:,} rows | "
            f"California rows found {california_rows:,} | "
            f"valid rows saved {saved_rows:,}"
        )

    print("\n========== PROCESSING COMPLETE ==========")
    print(f"Rows scanned: {total_rows:,}")
    print(f"California rows found: {california_rows:,}")
    print(f"Rows saved after basic cleaning: {saved_rows:,}")
    print(f"Parquet files created: {part_number}")
    print(f"Output folder: {OUTPUT_DIR.resolve()}")

    if saved_rows > 0:
        # Read the processed files back to verify them.
        check = pd.read_parquet(OUTPUT_DIR)
        print("\nVerification:")
        print(f"Loaded rows: {len(check):,}")
        print(f"Date range: {check['Start_Time'].min()} to "
              f"{check['Start_Time'].max()}")
        print(f"Unique states: {check['State'].unique().tolist()}")
        print(f"Missing weather condition: "
              f"{check['Weather_Condition'].isna().sum():,}")

if __name__ == "__main__":
    main()
