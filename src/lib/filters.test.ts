import { describe, expect, it } from "vitest";
import { DEFAULT_FILTERS, parseFilters, serializeFilters } from "./filters";

describe("dashboard URL filters", () => {
  it("round-trips selected state, year, and weather", () => {
    const filters = { ...DEFAULT_FILTERS, state: "CA", year: "2022", weather: "Rain" };

    expect(parseFilters(serializeFilters(filters))).toEqual(filters);
  });

  it("ignores unsupported values and leaves unspecified filters at all", () => {
    expect(parseFilters("?state=not-a-state&severity=9&weather=Rain")).toEqual({
      ...DEFAULT_FILTERS,
      weather: "Rain",
    });
  });
});
