import { DEFAULT_FILTERS, getFilterOptions, parseFilters, type DashboardFilters, type FilterableRow, type FilterOptions } from "../lib/filters";
import type { CountRow } from "../lib/metrics";

export type AggregateRow = CountRow & {
  month?: string;
  weekday?: string;
  hour?: number;
  city?: string;
};

export type DashboardMetadata = {
  availability: "loaded" | "missing";
  source: string;
  sourceUrl: string;
  author: string;
  license: string;
  severityDefinition: string;
  interpretation: string;
};

export type DataQuality = {
  inputRows: number;
  retainedRows: number;
  duplicateRows: number;
  invalidSeverityRows: number;
  invalidTimestampRows: number;
  nullRates: Record<string, number>;
  dateCoverage: { start: string | null; end: string | null };
};

export type DashboardData = {
  metadata: DashboardMetadata;
  overview: AggregateRow[];
  monthly: AggregateRow[];
  weatherSeverity: AggregateRow[];
  visibilitySeverity: AggregateRow[];
  hourWeekday: AggregateRow[];
  states: AggregateRow[];
  cities: AggregateRow[];
  quality?: DataQuality;
};

const EMPTY_DASHBOARD_DATA: DashboardData = {
  metadata: {
    availability: "missing",
    source: "US Accidents (2016–2023)",
    sourceUrl: "https://www.kaggle.com/datasets/sobhanmoosavi/us-accidents",
    author: "Sobhan Moosavi",
    license: "CC BY-NC-SA 4.0",
    severityDefinition: "Severity 1–4 measures traffic impact; 3–4 is grouped as high severity.",
    interpretation: "Historical accident-record counts and severity composition; not future trip probability.",
  },
  overview: [],
  monthly: [],
  weatherSeverity: [],
  visibilitySeverity: [],
  hourWeekday: [],
  states: [],
  cities: [],
};

export async function loadDashboardData(): Promise<DashboardData> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/dashboard-data.bin`);
    if (!response.ok) return EMPTY_DASHBOARD_DATA;
    const [compressed, qualityResponse] = await Promise.all([
      response.arrayBuffer(),
      fetch(`${import.meta.env.BASE_URL}data/data-quality.json`).catch(() => null),
    ]);
    const decompressed = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"));
    const payload = await new Response(decompressed).json() as Omit<DashboardData, "metadata"> & { metadata: Omit<DashboardMetadata, "availability"> };
    const quality = qualityResponse?.ok ? await qualityResponse.json() as DataQuality : undefined;
    return { ...payload, metadata: { ...payload.metadata, availability: "loaded" }, quality };
  } catch {
    return EMPTY_DASHBOARD_DATA;
  }
}

export function dashboardOptions(data: DashboardData): FilterOptions {
  return getFilterOptions(data.overview as FilterableRow[]);
}

export function filtersFromLocation(search: string): DashboardFilters {
  return search ? parseFilters(search) : DEFAULT_FILTERS;
}
