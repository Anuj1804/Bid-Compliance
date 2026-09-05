import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  UsersRound,
  ShieldCheck,
  ShieldAlert,
  TriangleAlert,
  ArrowUpRight,
  FilterX,
} from "lucide-react";

// Mock / demo data — structured so it can be swapped for API data later.
const tenders = [
  {
    id: "GEM/2026/B/18421",
    title: "Industrial Pumping Equipment",
    category: "Process Equipment",
    bidders: 18,
    checks: ["GST", "PAN", "UDYAM", "BLACKLIST"],
    compliance: 82,
    risk: "LOW",
    status: "ACTIVE",
  },
  {
    id: "GEM/2026/B/18397",
    title: "Pipeline Safety Systems",
    category: "Industrial Safety",
    bidders: 24,
    checks: ["GST", "PAN", "UDYAM"],
    compliance: 68,
    risk: "MEDIUM",
    status: "UNDER REVIEW",
  },
  {
    id: "GEM/2026/B/18355",
    title: "Process Control Equipment",
    category: "Automation & Controls",
    bidders: 11,
    checks: ["GST", "PAN", "OEM AUTHORIZATION"],
    compliance: 91,
    risk: "LOW",
    status: "ACTIVE",
  },
  {
    id: "GEM/2026/B/18288",
    title: "Electrical Distribution Components",
    category: "Electrical Systems",
    bidders: 32,
    checks: ["GST", "PAN", "UDYAM", "BLACKLIST"],
    compliance: 61,
    risk: "HIGH",
    status: "CLOSING SOON",
  },
  {
    id: "GEM/2026/B/18512",
    title: "Refinery Maintenance Supplies",
    category: "Maintenance & Repair",
    bidders: 15,
    checks: ["GST", "PAN", "UDYAM"],
    compliance: 74,
    risk: "MEDIUM",
    status: "CLOSING SOON",
  },
  {
    id: "GEM/2026/B/18190",
    title: "Water Treatment Instrumentation",
    category: "Environmental Systems",
    bidders: 9,
    checks: ["GST", "PAN"],
    compliance: 95,
    risk: "LOW",
    status: "CLOSED",
  },
];

const riskStyles = {
  HIGH: { icon: TriangleAlert, dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  MEDIUM: { icon: ShieldAlert, dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  LOW: { icon: ShieldCheck, dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
};

const statusStyles = {
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "UNDER REVIEW": "border-amber-200 bg-amber-50 text-amber-700",
  "CLOSING SOON": "border-red-200 bg-red-50 text-red-700",
  CLOSED: "border-slate-200 bg-slate-50 text-slate-500",
};

const statusFilterOptions = ["All Status", "Active", "Under Review", "Closing Soon", "Closed"];
const riskFilterOptions = ["All Risk", "Low", "Medium", "High"];

const getComplianceTone = (value) => {
  if (value >= 75) return { bar: "bg-emerald-500", text: "text-emerald-700" };
  if (value >= 50) return { bar: "bg-amber-500", text: "text-amber-700" };
  return { bar: "bg-red-500", text: "text-red-700" };
};

const RiskBadge = ({ risk }) => {
  const styles = riskStyles[risk] ?? riskStyles.MEDIUM;
  const Icon = styles.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${styles.border} ${styles.bg} px-2 py-1 text-[11px] font-semibold tracking-wide ${styles.text}`}
    >
      <Icon className="h-3.5 w-3.5" size={14} strokeWidth={2} aria-hidden="true" />
      {risk}
    </span>
  );
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold tracking-wide ${
      statusStyles[status] ?? "border-slate-200 bg-slate-50 text-slate-600"
    }`}
  >
    {status}
  </span>
);

const ComplianceProgress = ({ value, isVisible, delay }) => {
  const tone = getComplianceTone(value);
  return (
    <div className="w-full max-w-[140px]">
      <span className={`text-sm font-semibold tabular-nums ${tone.text}`}>{value}%</span>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${tone.bar} transition-[width] duration-700 ease-out`}
          style={{ width: isVisible ? `${value}%` : "0%", transitionDelay: isVisible ? delay : "0ms" }}
        />
      </div>
    </div>
  );
};

const TenderRow = ({ tender, isVisible, index, onView }) => {
  const delay = `${index * 70}ms`;

  return (
    <div
      className={`group border-b border-slate-100 px-4 sm:px-5 py-4 transition-all duration-500 ease-out last:border-b-0 hover:bg-slate-50 md:hover:translate-x-[2px] hover:shadow-[0_1px_0_rgba(15,23,42,0.02)] ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
      style={{ transitionDelay: isVisible ? delay : "0ms" }}
    >
      {/* Desktop / tablet grid row */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(230px,1.5fr)_90px_1.3fr_140px_100px_140px_110px] lg:items-center lg:gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">{tender.title}</p>
          <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">{tender.id}</p>
          <p className="mt-0.5 truncate text-[11px] text-slate-400">{tender.category}</p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <UsersRound className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" size={14} aria-hidden="true" />
          {tender.bidders}
        </div>

        <p className="truncate text-xs text-slate-500">{tender.checks.join(" · ")}</p>

        <ComplianceProgress value={tender.compliance} isVisible={isVisible} delay={delay} />

        <RiskBadge risk={tender.risk} />

        <StatusBadge status={tender.status} />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onView(tender.id)}
            aria-label={`View tender ${tender.title}`}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            View
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile / tablet stacked card */}
      <div className="lg:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">{tender.title}</p>
            <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">{tender.id}</p>
          </div>
          <RiskBadge risk={tender.risk} />
        </div>

        <p className="mt-1 text-xs text-slate-400">{tender.category}</p>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <UsersRound className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" size={14} aria-hidden="true" />
          {tender.bidders} bidders
        </div>

        <p className="mt-2 truncate text-xs text-slate-500">{tender.checks.join(" · ")}</p>

        <div className="mt-3">
          <ComplianceProgress value={tender.compliance} isVisible={isVisible} delay={delay} />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <StatusBadge status={tender.status} />
        </div>

        <button
          type="button"
          onClick={() => onView(tender.id)}
          aria-label={`View tender ${tender.title}`}
          className="mt-3 inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          View Tender
          <ArrowUpRight className="h-3.5 w-3.5" size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

const Tenders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [riskFilter, setRiskFilter] = useState("All Risk");

  const listRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const filteredTenders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tenders.filter((tender) => {
      const matchesSearch =
        !query ||
        tender.id.toLowerCase().includes(query) ||
        tender.title.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All Status" ||
        tender.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesRisk =
        riskFilter === "All Risk" || tender.risk.toLowerCase() === riskFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [searchQuery, statusFilter, riskFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== "" || statusFilter !== "All Status" || riskFilter !== "All Risk";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All Status");
    setRiskFilter("All Risk");
  };

  const handleViewTender = (tenderId) => {
    // Placeholder — wire up to React Router navigation to /tenders/:tenderId later.
    console.log(`Navigate to /tenders/${tenderId}`);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Tenders</h1>
          <p className="mt-1 text-sm text-slate-500">
            Select a tender to review bidder compliance and verification status.
          </p>
        </div>

        <span
          className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-amber-700"
          title="These tenders are placeholder demo data, not live procurement records."
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
          SIMULATED DATA
        </span>
      </div>

      {/* Search + filter bar */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 min-w-0">
          <label htmlFor="tender-search" className="sr-only">
            Search by tender ID or title
          </label>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            size={16}
            aria-hidden="true"
          />
          <input
            id="tender-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tender ID or title..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-shrink-0">
          <div>
            <label htmlFor="status-filter" className="sr-only">
              Filter by status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 sm:w-auto"
            >
              {statusFilterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="risk-filter" className="sr-only">
              Filter by risk
            </label>
            <select
              id="risk-filter"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 sm:w-auto"
            >
              {riskFilterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main section */}
      <section aria-labelledby="active-pipeline-heading">
        <div className="mb-4">
          <h2 id="active-pipeline-heading" className="text-base font-semibold tracking-tight text-slate-900">
            Active Tender Pipeline
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">Current tenders requiring compliance monitoring.</p>
        </div>

        <div ref={listRef} className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          {/* Desktop column headings */}
          {filteredTenders.length > 0 && (
            <div className="hidden lg:grid lg:grid-cols-[minmax(230px,1.5fr)_90px_1.3fr_140px_100px_140px_110px] lg:items-center lg:gap-4 border-b border-slate-100 bg-slate-50/60 px-4 sm:px-5 py-2.5">
              <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">TENDER</span>
              <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">BIDDERS</span>
              <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">APPLICABLE CHECKS</span>
              <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">COMPLIANCE</span>
              <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">RISK</span>
              <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">STATUS</span>
              <span className="text-right text-[10px] font-semibold tracking-[0.1em] text-slate-400">ACTION</span>
            </div>
          )}

          {filteredTenders.length > 0 ? (
            <div role="list" aria-label="Tenders">
              {filteredTenders.map((tender, index) => (
                <div role="listitem" key={tender.id}>
                  <TenderRow tender={tender} isVisible={isVisible} index={index} onView={handleViewTender} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-200">
                <FilterX className="h-4.5 w-4.5 text-slate-400" size={18} aria-hidden="true" />
              </span>
              <p className="text-sm font-medium text-slate-600">No tenders match your current filters.</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-1 inline-flex items-center rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Tenders;
