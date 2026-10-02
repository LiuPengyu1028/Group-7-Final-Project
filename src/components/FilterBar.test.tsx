import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_FILTERS, type DashboardFilters } from "../lib/filters";
import { FilterBar } from "./FilterBar";

const options = {
  states: ["CA", "NY"],
  years: [2022, 2023],
  weather: ["Clear/Fair", "Rain"],
  visibility: ["Good (≥10 mi)", "Low (1–3 mi)"],
  timeOfDay: ["Morning (06:00–11:59)", "Night (00:00–05:59)"],
};

describe("FilterBar", () => {
  it("reports selected filters and resets them to all", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(filters: DashboardFilters) => void>();
    render(<FilterBar filters={DEFAULT_FILTERS} options={options} onChange={onChange} />);

    await user.selectOptions(screen.getByLabelText("State"), "CA");
    expect(onChange).toHaveBeenLastCalledWith({ ...DEFAULT_FILTERS, state: "CA" });

    await user.selectOptions(screen.getByLabelText("Weather"), "Rain");
    expect(onChange).toHaveBeenLastCalledWith({ ...DEFAULT_FILTERS, weather: "Rain" });

    await user.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(onChange).toHaveBeenLastCalledWith(DEFAULT_FILTERS);
  });
});
