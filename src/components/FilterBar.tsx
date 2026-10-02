import { DEFAULT_FILTERS, type DashboardFilters, type FilterOptions } from "../lib/filters";

type FilterBarProps = {
  filters: DashboardFilters;
  options: FilterOptions;
  onChange: (filters: DashboardFilters) => void;
};

export function FilterBar({ filters, options, onChange }: FilterBarProps) {
  function select<K extends keyof DashboardFilters>(key: K, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <section className="filter-panel" aria-label="Dashboard filters">
      <div className="filter-panel__heading">
        <div>
          <p className="eyebrow">Explore the records</p>
          <h2>Filter conditions</h2>
        </div>
        <button className="button button--quiet" type="button" onClick={() => onChange(DEFAULT_FILTERS)}>
          Reset filters
        </button>
      </div>
      <div className="filter-grid">
        <label>Year
          <select value={filters.year} onChange={(event) => select("year", event.target.value)}>
            <option value="all">All years</option>
            {options.years.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>
        <label>State
          <select value={filters.state} onChange={(event) => select("state", event.target.value)}>
            <option value="all">All states</option>
            {options.states.map((state) => <option key={state} value={state}>{state}</option>)}
          </select>
        </label>
        <label>Weather
          <select value={filters.weather} onChange={(event) => select("weather", event.target.value)}>
            <option value="all">All weather</option>
            {options.weather.map((weather) => <option key={weather} value={weather}>{weather}</option>)}
          </select>
        </label>
        <label>Visibility
          <select value={filters.visibility} onChange={(event) => select("visibility", event.target.value)}>
            <option value="all">All visibility</option>
            {options.visibility.map((visibility) => <option key={visibility} value={visibility}>{visibility}</option>)}
          </select>
        </label>
        <label>Time of day
          <select value={filters.timeOfDay} onChange={(event) => select("timeOfDay", event.target.value)}>
            <option value="all">All times</option>
            {options.timeOfDay.map((time) => <option key={time} value={time}>{time}</option>)}
          </select>
        </label>
        <label>Severity
          <select value={filters.severity} onChange={(event) => select("severity", event.target.value)}>
            <option value="all">All levels</option>
            {[1, 2, 3, 4].map((severity) => <option key={severity} value={severity}>{severity}</option>)}
          </select>
        </label>
      </div>
      <p className="filter-panel__hint" aria-live="polite">Each chart uses the same selected conditions.</p>
    </section>
  );
}
