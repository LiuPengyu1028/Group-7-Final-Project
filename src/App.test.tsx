import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import type { DashboardData } from "./data/dashboard-data";

const sample: DashboardData = {
  metadata: {
    availability: "loaded",
    source: "US Accidents (2016–2023)",
    sourceUrl: "https://www.kaggle.com/datasets/sobhanmoosavi/us-accidents",
    author: "Sobhan Moosavi",
    license: "CC BY-NC-SA 4.0",
    severityDefinition: "Severity 1–4 measures traffic impact; 3–4 is grouped as high severity.",
    interpretation: "Historical accident-record counts and severity composition; not future trip probability.",
  },
  overview: [
    { state: "CA", year: 2022, weather: "Rain", visibilityBand: "Low (1–3 mi)", timeOfDay: "Morning (06:00–11:59)", severity: 2, count: 2 },
    { state: "CA", year: 2022, weather: "Rain", visibilityBand: "Low (1–3 mi)", timeOfDay: "Morning (06:00–11:59)", severity: 3, count: 2 },
    { state: "NY", year: 2023, weather: "Clear/Fair", visibilityBand: "Good (≥10 mi)", timeOfDay: "Evening (18:00–23:59)", severity: 4, count: 1 },
  ],
  monthly: [
    { state: "CA", year: 2022, month: "2022-01", weather: "Rain", visibilityBand: "Low (1–3 mi)", timeOfDay: "Morning (06:00–11:59)", severity: 2, count: 2 },
    { state: "CA", year: 2022, month: "2022-01", weather: "Rain", visibilityBand: "Low (1–3 mi)", timeOfDay: "Morning (06:00–11:59)", severity: 3, count: 2 },
    { state: "NY", year: 2023, month: "2023-03", weather: "Clear/Fair", visibilityBand: "Good (≥10 mi)", timeOfDay: "Evening (18:00–23:59)", severity: 4, count: 1 },
  ],
  weatherSeverity: [
    { state: "CA", year: 2022, weather: "Rain", visibilityBand: "Low (1–3 mi)", timeOfDay: "Morning (06:00–11:59)", severity: 2, count: 2 },
    { state: "CA", year: 2022, weather: "Rain", visibilityBand: "Low (1–3 mi)", timeOfDay: "Morning (06:00–11:59)", severity: 3, count: 2 },
  ],
  visibilitySeverity: [
    { state: "CA", year: 2022, weather: "Rain", visibilityBand: "Low (1–3 mi)", timeOfDay: "Morning (06:00–11:59)", severity: 2, count: 2 },
    { state: "CA", year: 2022, weather: "Rain", visibilityBand: "Low (1–3 mi)", timeOfDay: "Morning (06:00–11:59)", severity: 3, count: 2 },
  ],
  hourWeekday: [],
  states: [],
  cities: [],
  quality: {
    inputRows: 5,
    retainedRows: 5,
    duplicateRows: 0,
    invalidSeverityRows: 0,
    invalidTimestampRows: 0,
    nullRates: { Weather_Condition: 0.02, "Visibility(mi)": 0.03, "Precipitation(in)": 0.25 },
    dateCoverage: { start: "2016-01-14T20:18:33", end: "2023-03-31T22:46:13" },
  },
};

describe("dashboard application", () => {
  it("renders four KPIs and the historical-data notice on the overview", () => {
    render(<App initialData={sample} />);
    expect(screen.getByRole("heading", { name: /understand the conditions/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Summary metrics").children).toHaveLength(4);
    expect(screen.getByText(/historical data/i)).toBeInTheDocument();
    expect(screen.getByText(/2\.0% missing weather/)).toBeInTheDocument();
  });

  it("applies a selected state to visible charts and explains the filter", () => {
    render(<App initialData={sample} />);
    fireEvent.change(screen.getByLabelText("State"), { target: { value: "CA" } });
    expect(screen.getAllByText(/state: CA/i).length).toBeGreaterThanOrEqual(2);
    expect(window.location.search).toContain("state=CA");
  });

  it("shows source attribution and methodological boundaries", async () => {
    render(<App initialData={sample} />);
    fireEvent.click(screen.getByRole("button", { name: "Methodology" }));
    expect(await screen.findByText(/does not contain vehicle make or model/i)).toBeInTheDocument();
    expect(screen.getByText(/cannot estimate the probability of an accident on a future trip/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /US Accidents \(2016–2023\)/i })).toHaveAttribute("href", sample.metadata.sourceUrl);
  });

  it("shows helpful empty states when a chart has no rows", () => {
    render(<App initialData={{ ...sample, weatherSeverity: [], visibilitySeverity: [], hourWeekday: [] }} />);
    fireEvent.click(screen.getByRole("button", { name: "Conditions" }));
    expect(screen.getAllByText(/change the filters to compare/i).length).toBeGreaterThanOrEqual(2);
  });

  it("provides a data table for each Recharts visualization", () => {
    window.history.replaceState(null, "", "/");
    render(<App initialData={sample} />);
    expect(screen.getAllByText("View data table")).toHaveLength(2);
    for (const summary of screen.getAllByText("View data table")) fireEvent.click(summary);
    expect(screen.getByRole("table", { name: "Monthly accident counts" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Accidents by severity level" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Conditions" }));
    expect(screen.getAllByText("View data table")).toHaveLength(2);
    for (const summary of screen.getAllByText("View data table")) fireEvent.click(summary);
    expect(screen.getByRole("table", { name: "Accident records by weather and severity" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Accident records by visibility and severity" })).toBeInTheDocument();
  });
});
