export type DashboardFilters = {
  state: string;
  year: string;
  weather: string;
  visibility: string;
  timeOfDay: string;
  severity: string;
};

export type FilterOptions = {
  states: string[];
  years: number[];
  weather: string[];
  visibility: string[];
  timeOfDay: string[];
};

export type FilterableRow = {
  state: string;
  year: number;
  weather: string;
  visibilityBand: string;
  timeOfDay: string;
  severity: number;
};

export const DEFAULT_FILTERS: DashboardFilters = {
  state: "all",
  year: "all",
  weather: "all",
  visibility: "all",
  timeOfDay: "all",
  severity: "all",
};

const WEATHER_VALUES = new Set([
  "Clear/Fair", "Cloudy", "Rain", "Snow/Ice", "Fog/Haze", "Wind/Storm", "Other/Unknown",
]);
const VISIBILITY_VALUES = new Set([
  "Very low (<1 mi)", "Low (1–3 mi)", "Moderate (3–10 mi)", "Good (≥10 mi)", "Unknown",
]);
const TIME_VALUES = new Set([
  "Night (00:00–05:59)", "Morning (06:00–11:59)",
  "Afternoon (12:00–17:59)", "Evening (18:00–23:59)",
]);
const SEVERITY_VALUES = new Set(["1", "2", "3", "4"]);

function validValue(key: keyof DashboardFilters, value: string): boolean {
  if (value === "all") return true;
  switch (key) {
    case "state": return /^[A-Z]{2}$/.test(value);
    case "year": return /^20\d{2}$/.test(value);
    case "weather": return WEATHER_VALUES.has(value);
    case "visibility": return VISIBILITY_VALUES.has(value);
    case "timeOfDay": return TIME_VALUES.has(value);
    case "severity": return SEVERITY_VALUES.has(value);
  }
}

export function parseFilters(search: string): DashboardFilters {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const filters = { ...DEFAULT_FILTERS };
  (Object.keys(filters) as (keyof DashboardFilters)[]).forEach((key) => {
    const value = params.get(key);
    if (value && validValue(key, value)) filters[key] = value;
  });
  return filters;
}

export function serializeFilters(filters: DashboardFilters): string {
  const params = new URLSearchParams();
  (Object.keys(DEFAULT_FILTERS) as (keyof DashboardFilters)[]).forEach((key) => {
    if (filters[key] !== "all") params.set(key, filters[key]);
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function matchesFilters(row: FilterableRow, filters: DashboardFilters): boolean {
  return (filters.state === "all" || row.state === filters.state)
    && (filters.year === "all" || String(row.year) === filters.year)
    && (filters.weather === "all" || row.weather === filters.weather)
    && (filters.visibility === "all" || row.visibilityBand === filters.visibility)
    && (filters.timeOfDay === "all" || row.timeOfDay === filters.timeOfDay)
    && (filters.severity === "all" || String(row.severity) === filters.severity);
}

export function filterRows<T extends FilterableRow>(rows: T[], filters: DashboardFilters): T[] {
  return rows.filter((row) => matchesFilters(row, filters));
}

export function getFilterOptions(rows: FilterableRow[]): FilterOptions {
  const unique = <T,>(values: T[]) => [...new Set(values)];
  return {
    states: unique(rows.map((row) => row.state)).sort(),
    years: unique(rows.map((row) => row.year)).sort((a, b) => a - b),
    weather: unique(rows.map((row) => row.weather)).sort(),
    visibility: unique(rows.map((row) => row.visibilityBand)).sort(),
    timeOfDay: unique(rows.map((row) => row.timeOfDay)).sort(),
  };
}
