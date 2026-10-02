import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "./components/EmptyState";
import { FilterBar } from "./components/FilterBar";
import { dashboardOptions, filtersFromLocation, loadDashboardData, type DashboardData } from "./data/dashboard-data";
import { serializeFilters, type DashboardFilters } from "./lib/filters";
import { calculateKpis } from "./lib/metrics";
import { ConditionsPage } from "./pages/ConditionsPage";
import { GeographyPage } from "./pages/GeographyPage";
import { MethodologyPage } from "./pages/MethodologyPage";
import { OverviewPage } from "./pages/OverviewPage";

type Page = "overview" | "conditions" | "geography" | "methodology";
type Props = { initialData?: DashboardData };
const PAGES: { id: Page; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "conditions", label: "Conditions" },
  { id: "geography", label: "Geography" },
  { id: "methodology", label: "Methodology" },
];

function pageFromHash(): Page {
  const page = window.location.hash.slice(1) as Page;
  return PAGES.some((item) => item.id === page) ? page : "overview";
}

export function App({ initialData }: Props) {
  const [data, setData] = useState<DashboardData | null>(initialData ?? null);
  const [filters, setFilters] = useState<DashboardFilters>(() => filtersFromLocation(window.location.search));
  const [page, setPage] = useState<Page>(pageFromHash);

  useEffect(() => {
    if (initialData) return;
    let active = true;
    void loadDashboardData().then((loaded) => { if (active) setData(loaded); });
    return () => { active = false; };
  }, [initialData]);

  useEffect(() => {
    const onLocationChange = () => {
      setFilters(filtersFromLocation(window.location.search));
      setPage(pageFromHash());
    };
    window.addEventListener("popstate", onLocationChange);
    window.addEventListener("hashchange", onLocationChange);
    return () => {
      window.removeEventListener("popstate", onLocationChange);
      window.removeEventListener("hashchange", onLocationChange);
    };
  }, []);

  const options = useMemo(() => data ? dashboardOptions(data) : { states: [], years: [], weather: [], visibility: [], timeOfDay: [] }, [data]);
  const kpis = useMemo(() => calculateKpis(data?.overview ?? [], filters), [data, filters]);

  function updateFilters(next: DashboardFilters) {
    setFilters(next);
    const query = serializeFilters(next);
    window.history.pushState(null, "", `${window.location.pathname}${query}${window.location.hash}`);
  }

  function navigate(next: Page) {
    setPage(next);
    window.history.pushState(null, "", `${window.location.pathname}${window.location.search}#${next}`);
  }

  if (!data) return <main className="loading-screen"><span className="loading-dot" />Loading the historical records…</main>;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#overview" onClick={(event) => { event.preventDefault(); navigate("overview"); }}><span className="brand__mark" aria-hidden="true">R</span><span>roadwise<small>US ACCIDENT CONDITIONS</small></span></a>
        <nav className="main-nav" aria-label="Main navigation">
          {PAGES.map((item) => <button key={item.id} type="button" onClick={() => navigate(item.id)} aria-current={page === item.id ? "page" : undefined}>{item.label}</button>)}
        </nav>
        <span className="topbar__period">2016—2023 <span>·</span> USA</span>
      </header>
      <main className="dashboard-main">
        {data.metadata.availability === "missing" && <div className="data-callout" role="status"><span className="data-callout__icon" aria-hidden="true">!</span><div><strong>Data file not loaded yet</strong><p>Download the 500,000-row Kaggle sample, place it in <code>data/raw/</code>, then run the preparation command listed on Methodology. Current charts will remain empty until the generated aggregates are available.</p></div></div>}
        {data.quality && <div className="quality-strip"><span>DATA CHECK</span><p>{data.quality.retainedRows.toLocaleString()} of {data.quality.inputRows.toLocaleString()} source rows retained · {((data.quality.nullRates.Weather_Condition ?? 0) * 100).toFixed(1)}% missing weather · {((data.quality.nullRates["Visibility(mi)"] ?? 0) * 100).toFixed(1)}% missing visibility; missing values appear as Unknown.</p></div>}
        <FilterBar filters={filters} options={options} onChange={updateFilters} />
        {page === "overview" && <OverviewPage data={data} filters={filters} kpis={kpis} />}
        {page === "conditions" && <ConditionsPage data={data} filters={filters} kpis={kpis} />}
        {page === "geography" && <GeographyPage data={data} filters={filters} />}
        {page === "methodology" && <MethodologyPage data={data} />}
        {data.metadata.availability === "missing" && page !== "methodology" && <EmptyState title="The dashboard is ready for your sample data">See Methodology for the source attribution, filtering definitions, and the command that generates the chart data.</EmptyState>}
        <footer className="app-footer"><span>ROADWISE · COURSE PROJECT</span><span>Historical records · descriptive analysis</span></footer>
      </main>
    </div>
  );
}
