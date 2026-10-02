import { matchesFilters, type DashboardFilters, type FilterableRow } from "../../lib/filters";

export const SEVERITY_COLORS: Record<number, string> = {
  1: "#b7cfca",
  2: "#6f9d95",
  3: "#d99d66",
  4: "#9f5035",
};

export function selectedFilterText(filters: DashboardFilters): string {
  const selected = Object.entries(filters)
    .filter(([, value]) => value !== "all")
    .map(([key, value]) => `${key === "timeOfDay" ? "time" : key}: ${value}`);
  return selected.length ? `Selected filters · ${selected.join(" · ")}` : "Selected filters · all records";
}

export function chartRows<T extends FilterableRow>(rows: T[], filters: DashboardFilters): T[] {
  return rows.filter((row) => matchesFilters(row, filters));
}

export function formatMonth(month: string): string {
  const [year, rawMonth] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" }).format(new Date(year, rawMonth - 1, 1));
}
