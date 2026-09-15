import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Building2,
  ShieldCheck,
  ShieldAlert,
  TriangleAlert,
  ArrowUpRight,
  FilterX,
} from "lucide-react";
import DashboardSidebar from "../Components/dashboard/DashboardSidebar";

const riskStyles = {
  HIGH: { icon: TriangleAlert, text: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  MEDIUM: { icon: ShieldAlert, text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  LOW: { icon: ShieldCheck, text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  UNVERIFIED: { icon: ShieldAlert, text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
};

const riskFilterOptions = ["All Risk", "Low", "Medium", "High"];

const RiskBadge = ({ risk }) => {
  const level = risk || "UNVERIFIED";
  const styles = riskStyles[level] ?? riskStyles.UNVERIFIED;
  const Icon = styles.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${styles.border} ${styles.bg} px-2 py-1 text-[11px] font-semibold tracking-wide ${styles.text}`}
    >
      <Icon className="h-3.5 w-3.5" size={14} strokeWidth={2} aria-hidden="true" />
      {level}
    </span>
  );
};

const ComplianceCell = ({ score }) => {
  if (score === null || score === undefined) {
    return <span className="text-sm font-medium text-slate-400">Not verified</span>;
  }
  const tone =
    score >= 75 ? "text-emerald-700" : score >= 50 ? "text-amber-700" : "text-red-700";
  return <span className={`text-sm font-semibold tabular-nums ${tone}`}>{score}%</span>;
};

const BidderRow = ({ bidder, isVisible, index, onView }) => {
  const delay = `${index * 60}ms`;

  return (
    <div
      className={`group border-b border-slate-100 px-4 sm:px-5 py-4 transition-all duration-500 ease-out last:border-b-0 hover:bg-slate-50 md:hover:translate-x-[2px] ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
      style={{ transitionDelay: isVisible ? delay : "0ms" }}
    >
      {/* Desktop / tablet grid row */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(220px,1.4fr)_150px_110px_110px_90px_110px] lg:items-center lg:gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">{bidder.companyName}</p>
          <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">
            {bidder.declaredGstin || "GSTIN not provided"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onView(bidder.tenderId)}
          className="flex min-w-0 items-center gap-1.5 text-left text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 group-hover:text-blue-500" size={14} aria-hidden="true" />
          <span className="truncate">{bidder.tenderLabel}</span>
        </button>

        <ComplianceCell score={bidder.complianceScore} />

        <RiskBadge risk={bidder.riskLevel} />

        <div className="text-xs text-slate-500">
          {bidder.flagCount > 0 ? (
            <span className="font-semibold text-amber-700">{bidder.flagCount} flags</span>
          ) : (
            <span className="text-slate-400">No flags</span>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onView(bidder.tenderId, bidder.id)}
            aria-label={`View ${bidder.companyName}`}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            View
            <ArrowUpRight className="h-3.5 w-3.5" size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile / tablet stacked card */}
      <div className="lg:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">{bidder.companyName}</p>
            <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">
              {bidder.declaredGstin || "GSTIN not provided"}
            </p>
          </div>
          <RiskBadge risk={bidder.riskLevel} />
        </div>

        <button
          type="button"
          onClick={() => onView(bidder.tenderId)}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" size={14} aria-hidden="true" />
          {bidder.tenderLabel}
        </button>

        <div className="mt-3 flex items-center justify-between">
          <ComplianceCell score={bidder.complianceScore} />
          <span className="text-xs text-slate-500">
            {bidder.flagCount > 0 ? (
              <span className="font-semibold text-amber-700">{bidder.flagCount} flags</span>
            ) : (
              <span className="text-slate-400">No flags</span>
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onView(bidder.tenderId, bidder.id)}
          aria-label={`View ${bidder.companyName}`}
          className="mt-3 inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          View Bidder
          <ArrowUpRight className="h-3.5 w-3.5" size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

const AllBidders = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [bidders, setBidders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("All Risk");

  useEffect(() => {
    const fetchBidders = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("http://localhost:8000/api/bidders");
        if (!response.ok) throw new Error("Failed to fetch bidders");

        const data = await response.json();

        const formatted = data.map((b) => ({
          id: b.id,
          tenderId: b.tender_id,
          tenderLabel: `TENDER-${String(b.tender_id).padStart(5, "0")}`,
          companyName: b.company_name || "Unnamed Bidder",
          declaredGstin: b.declared_gstin,
          complianceScore: b.compliance_score ?? null,
          riskLevel: b.risk_level ?? "UNVERIFIED",
          flagCount: b.flag_count ?? 0,
        }));

        setBidders(formatted);
      } catch (err) {
        console.error("Bidder fetch error:", err);
        setError("Unable to load bidders from backend.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBidders();
  }, []);

  const filteredBidders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return bidders.filter((b) => {
      const matchesSearch =
        !query ||
        b.companyName.toLowerCase().includes(query) ||
        (b.declaredGstin || "").toLowerCase().includes(query) ||
        b.tenderLabel.toLowerCase().includes(query);

      const matchesRisk =
        riskFilter === "All Risk" || (b.riskLevel || "UNVERIFIED").toLowerCase() === riskFilter.toLowerCase();

      return matchesSearch && matchesRisk;
    });
  }, [bidders, searchQuery, riskFilter]);

  const hasActiveFilters = searchQuery.trim() !== "" || riskFilter !== "All Risk";

  const clearFilters = () => {
    setSearchQuery("");
    setRiskFilter("All Risk");
  };

  const handleView = (tenderId, bidderId) => {
    if (bidderId) {
      navigate(`/tenders/${tenderId}/bidders/${bidderId}`);
    } else {
      navigate(`/tenders/${tenderId}/bidders`);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      <div className="min-w-0 flex-1">
        <main className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Page header */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Bidders</h1>
              <p className="mt-1 text-sm text-slate-500">
                All bidders across every tender, with compliance and risk status.
              </p>
            </div>

            <span
              className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-emerald-700"
              title="Bidder records are loaded from the backend database."
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              LIVE DATA
            </span>
          </div>

          {/* Search + filter bar */}
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 min-w-0">
              <label htmlFor="bidder-search" className="sr-only">
                Search by company name, GSTIN, or tender
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
                placeholder="Search by company name, GSTIN, or tender..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
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

          {/* Main section */}
          <section aria-labelledby="all-bidders-heading">
            <div className="mb-4">
              <h2 id="all-bidders-heading" className="text-base font-semibold tracking-tight text-slate-900">
                All Bidders
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {filteredBidders.length} bidder{filteredBidders.length === 1 ? "" : "s"} shown.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              {isLoading && (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm text-slate-500">Loading bidders from database...</p>
                </div>
              )}

              {error && !isLoading && (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
              )}

              {!isLoading && !error && filteredBidders.length > 0 && (
                <div className="hidden lg:grid lg:grid-cols-[minmax(220px,1.4fr)_150px_110px_110px_90px_110px] lg:items-center lg:gap-4 border-b border-slate-100 bg-slate-50/60 px-4 sm:px-5 py-2.5">
                  <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">BIDDER</span>
                  <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">TENDER</span>
                  <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">COMPLIANCE</span>
                  <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">RISK</span>
                  <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">FLAGS</span>
                  <span className="text-right text-[10px] font-semibold tracking-[0.1em] text-slate-400">ACTION</span>
                </div>
              )}

              {!isLoading && !error && filteredBidders.length > 0 ? (
                <div role="list" aria-label="Bidders">
                  {filteredBidders.map((bidder, index) => (
                    <div role="listitem" key={bidder.id}>
                      <BidderRow bidder={bidder} isVisible={isVisible} index={index} onView={handleView} />
                    </div>
                  ))}
                </div>
              ) : !isLoading && !error ? (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
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
              ) : null}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AllBidders;