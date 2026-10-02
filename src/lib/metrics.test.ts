import { describe, expect, it } from "vitest";
import { calculateHighSeverityShare, formatPercent } from "./metrics";

describe("safe dashboard metrics", () => {
  it("returns null and N/A when the denominator is empty", () => {
    expect(calculateHighSeverityShare(0, 0)).toBeNull();
    expect(formatPercent(calculateHighSeverityShare(0, 0))).toBe("N/A");
  });

  it("shows recorded severity composition as a percentage", () => {
    expect(calculateHighSeverityShare(4, 2)).toBe(0.5);
    expect(formatPercent(0.5)).toBe("50.0%");
  });
});
