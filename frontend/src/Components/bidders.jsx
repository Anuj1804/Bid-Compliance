import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  TriangleAlert,
  ArrowUpRight,
  FilterX,
  FileText,
} from "lucide-react";

// Selected tender context — placeholder until wired to routing/API.
const selectedTender = {
  tenderId: "GEM/2026/B/18421",
  title: "Industrial Pumping Equipment",
  category: "Process Equipment",
  status: "ACTIVE",
};

// Overview summary for the full bidder pool on this tender.
// Kept independent of the sample records below (only 8 are shown for demo purposes).
const bidderOverview = {
  total: 18,
  low: 10,
  medium: 5,
  high: 3,
};

// Mock / demo bidder records — structured so they can be replaced by API data later.
const bidders = [
  {
    company: "Apex Industrial Solutions",
    bidderId: "BID-18421-001",
    gstin: "07AABCA1234F1Z5",
    score: 82,
    risk: "HIGH",
    flags: 2,
    status: "FLAGGED",
  },
  {
    company: "Bharat Energy Systems",
    bidderId: "BID-18421-002",
    gstin: "27AABCB2345G1Z6",
    score: 68,
    risk: "MEDIUM",
    flags: 1,
    status: "NEEDS REVIEW",
  },
  {
    company: "Nova Engineering Works",
    bidderId: "BID-18421-003",
    gstin: "29AABCN3456H1Z7",
    score: 74,
    risk: "MEDIUM",
    flags: 1,
    status: "NEEDS REVIEW",
  },
  {
    company: "Shree Infrastructure",
    bidderId: "BID-18421-004",
    gstin: "06AABCS4567J1Z8",
    score: 45,
    risk: "HIGH",
    flags: 3,
    status: "FLAGGED",
  },
  {
    company: "Vertex Process Equipment",
    bidderId: "BID-18421-005",
    gstin: "09AABCV5678K1Z9",
    score: 61,
    risk: "MEDIUM",
    flags: 1,
    status: "NEEDS REVIEW",
  },
  {
    company: "Precision Mechanical Systems",
    bidderId: "BID-18421-006",
    gstin: "19AABCP6789L1ZA",
    score: 94,
    risk: "LOW",
    flags: 0,
    status: "COMPLIANT",
  },
  {
    company: "National Industrial Components",
    bidderId: "BID-18421-007",
    gstin: "33AABCN7890M1ZB",
    score: 88,
    risk: "LOW",
    flags: 0,
    status: "COMPLIANT",
  },
  {
    company: "Eastern Pump Technologies",
    bidderId: "BID-18421-008",
    gstin: "21AABCE8901N1ZC",
    score: 91,
    risk: "LOW",
    flags: 0,
    status: "COMPLIANT",
  },
];

const riskStyles = {
  HIGH: { icon: TriangleAlert, dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  MEDIUM: { icon: ShieldAlert, dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  LOW: { icon: ShieldCheck, dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
};

const statusStyles = {
  COMPLIANT: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "NEEDS REVIEW": "border-amber-200 bg-amber-50 text-amber-700",
  FLAGGED: "border-red-200 bg-red-50 text-red-700",
};

const statusFilterOptions = ["All Compliance", "Compliant", "Needs Review", "Flagged"];
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

const FlagsCell = ({ flags }) => (
  <div className="flex items-center gap-1.5 text-xs text-slate-600">
    {flags > 0 && (
      <TriangleAlert className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" size={14} aria-hidden="true" />
    )}
    <span>
      {flags} {flags === 1 ? "flag" : "flags"}
    </span>
  </div>
);

const BidderRow = ({ bidder, isVisible, index, onView }) => {
  const delay = `${index * 70}ms`;

  return (
    <div
      className={`group border-b border-slate-100 px-4 sm:px-5 py-4 transition-all duration-500 ease-out last:border-b-0 hover:bg-slate-50 md:hover:translate-x-[2px] hover:shadow-[0_1px_0_rgba(15,23,42,0.02)] ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
      style={{ transitionDelay: isVisible ? delay : "0ms" }}
    >
      {/* Desktop / tablet grid row */}
      <div className="hidden lg:grid lg:grid-cols-[100px_1.5fr_1.15fr_150px_110px_140px_110px] lg:items-center lg:gap-4">
        <RiskBadge risk={bidder.risk} />

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">{bidder.company}</p>
          <p className="mt-0.5 truncate text-[11px] text-slate-400">{bidder.bidderId}</p>
        </div>

        <p className="truncate font-mono text-xs text-slate-500">{bidder.gstin}</p>

        <ComplianceProgress value={bidder.score} isVisible={isVisible} delay={delay} />

        <FlagsCell flags={bidder.flags} />

        <StatusBadge status={bidder.status} />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onView(bidder.bidderId)}
            aria-label={`View bidder ${bidder.company}`}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            View
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              size={14}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Mobile / tablet stacked card */}
      <div className="lg:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">{bidder.company}</p>
            <p className="mt-0.5 truncate text-[11px] text-slate-400">{bidder.bidderId}</p>
          </div>
          <RiskBadge risk={bidder.risk} />
        </div>

        <p className="mt-2 truncate font-mono text-xs text-slate-500">{bidder.gstin}</p>

        <div className="mt-3">
          <ComplianceProgress value={bidder.score} isVisible={isVisible} delay={delay} />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <FlagsCell flags={bidder.flags} />
          <StatusBadge status={bidder.status} />
        </div>

        <button
          type="button"
          onClick={() => onView(bidder.bidderId)}
          aria-label={`View bidder ${bidder.company}`}
          className="mt-3 inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          View Bidder
          <ArrowUpRight className="h-3.5 w-3.5" size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

const Bidders = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("All Risk");
  const [complianceFilter, setComplianceFilter] = useState("All Compliance");
  const [flaggedOnly, setFlaggedOnly] = useState(false);

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

  const handleViewBidder = (bidderId) => {
  localStorage.setItem("selectedBidderId", bidderId);
  navigate("/bidder_details");
};

  const filteredBidders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return bidders.filter((bidder) => {
      const matchesSearch =
        !query ||
        bidder.company.toLowerCase().includes(query) ||
        bidder.bidderId.toLowerCase().includes(query) ||
        bidder.gstin.toLowerCase().includes(query);

      const matchesRisk = riskFilter === "All Risk" || bidder.risk.toLowerCase() === riskFilter.toLowerCase();

      const matchesCompliance =
        complianceFilter === "All Compliance" ||
        bidder.status.toLowerCase() === complianceFilter.toLowerCase();

      const matchesFlagged = !flaggedOnly || bidder.flags > 0;

      return matchesSearch && matchesRisk && matchesCompliance && matchesFlagged;
    });
  }, [searchQuery, riskFilter, complianceFilter, flaggedOnly]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    riskFilter !== "All Risk" ||
    complianceFilter !== "All Compliance" ||
    flaggedOnly;

  const clearFilters = () => {
    setSearchQuery("");
    setRiskFilter("All Risk");
    setComplianceFilter("All Compliance");
    setFlaggedOnly(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Page header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Bidders</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review bidder compliance, risk, and verification status for the selected tender.
          </p>
        </div>

        <span
          className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-amber-700"
          title="These bidder records are placeholder demo data, not live GeM/GST/PAN/Udyam verification results."
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
          SIMULATED DATA
        </span>
      </div>

      {/* Selected tender context strip */}
      <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 sm:px-5 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 flex-shrink-0 text-slate-400" size={16} aria-hidden="true" />
          <span className="font-mono text-xs text-slate-500">{selectedTender.tenderId}</span>
        </div>
        <span className="hidden sm:block h-4 w-px bg-slate-200" aria-hidden="true" />
        <p className="truncate text-sm font-medium text-slate-800">{selectedTender.title}</p>
        <span className="hidden sm:block h-4 w-px bg-slate-200" aria-hidden="true" />
        <p className="truncate text-xs text-slate-500">{selectedTender.category}</p>
        <span className="ml-auto">
          <StatusBadge status="COMPLIANT" />
        </span>
      </div>

      {/* Overview summary */}
      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 sm:px-5 py-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-slate-900">{bidderOverview.total}</span>
          <span className="text-xs text-slate-500">Total Bidders</span>
        </div>
        <span className="h-4 w-px bg-slate-200" aria-hidden="true" />
        <div className="flex items-baseline gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          <span className="text-sm font-semibold text-emerald-700">{bidderOverview.low}</span>
          <span className="text-xs text-slate-500">Low Risk</span>
        </div>
        <span className="h-4 w-px bg-slate-200" aria-hidden="true" />
        <div className="flex items-baseline gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
          <span className="text-sm font-semibold text-amber-700">{bidderOverview.medium}</span>
          <span className="text-xs text-slate-500">Medium Risk</span>
        </div>
        <span className="h-4 w-px bg-slate-200" aria-hidden="true" />
        <div className="flex items-baseline gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
          <span className="text-sm font-semibold text-red-700">{bidderOverview.high}</span>
          <span className="text-xs text-slate-500">High Risk</span>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1 min-w-0">
          <label htmlFor="bidder-search" className="sr-only">
            Search bidder name, ID, or GSTIN
          </label>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            size={16}
            aria-hidden="true"
          />
          <input
            id="bidder-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bidder name, ID, or GSTIN..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:flex-shrink-0">
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

          <div>
            <label htmlFor="compliance-filter" className="sr-only">
              Filter by compliance status
            </label>
            <select
              id="compliance-filter"
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 sm:w-auto"
            >
              {statusFilterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <label
            htmlFor="flagged-only"
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 cursor-pointer select-none transition-colors hover:bg-slate-50"
          >
            <input
              id="flagged-only"
              type="checkbox"
              checked={flaggedOnly}
              onChange={(e) => setFlaggedOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0 cursor-pointer"
            />
            Flagged only
          </label>
        </div>
      </div>

      {/* Main section */}
      <section aria-labelledby="bidder-review-heading">
        <div className="mb-4">
          <h2 id="bidder-review-heading" className="text-base font-semibold tracking-tight text-slate-900">
            Bidder Compliance Review
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Select a bidder to inspect detailed compliance checks and verification evidence.
          </p>
        </div>

        <div ref={listRef} className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          {/* Desktop column headings */}
          {filteredBidders.length > 0 && (
            <div className="hidden lg:grid lg:grid-cols-[100px_1.5fr_1.15fr_150px_110px_140px_110px] lg:items-center lg:gap-4 border-b border-slate-100 bg-slate-50/60 px-4 sm:px-5 py-2.5">
              <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">RISK</span>
              <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">BIDDER</span>
              <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">REGISTRATION</span>
              <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">COMPLIANCE</span>
              <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">FLAGS</span>
              <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">STATUS</span>
              <span className="text-right text-[10px] font-semibold tracking-[0.1em] text-slate-400">ACTION</span>
            </div>
          )}

          {filteredBidders.length > 0 ? (
            <div role="list" aria-label="Bidders">
              {filteredBidders.map((bidder, index) => (
                <div role="listitem" key={bidder.bidderId}>
                  <BidderRow bidder={bidder} isVisible={isVisible} index={index} onView={handleViewBidder} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-200">
                <FilterX className="h-4.5 w-4.5 text-slate-400" size={18} aria-hidden="true" />
              </span>
              <p className="text-sm font-medium text-slate-600">No bidders match your current filters.</p>
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

          {/* Footer info */}
          <div className="border-t border-slate-100 px-4 sm:px-5 py-3">
            <p className="text-xs text-slate-400">
              Showing {filteredBidders.length} of {bidderOverview.total} bidders
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Bidders;
