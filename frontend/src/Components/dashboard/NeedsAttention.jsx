import React, { useEffect, useRef, useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";

// Mock / demo data — structured so it can be swapped for API data later.


const riskStyles = {
  HIGH: {
    icon: TriangleAlert,
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  MEDIUM: {
    icon: ShieldAlert,
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  LOW: {
    icon: ShieldCheck,
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
};

const statusStyles = {
  MISMATCH: "border-red-200 bg-red-50 text-red-700",
  MISSING: "border-red-200 bg-red-50 text-red-700",
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  "REVIEW REQUIRED": "border-amber-200 bg-amber-50 text-amber-700",
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
    className={`inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold tracking-wide ${statusStyles[status] ?? "border-slate-200 bg-slate-50 text-slate-600"
      }`}
  >
    {status}
  </span>
);

const AttentionRow = ({ item, isVisible, index }) => {
  return (
    <div
      className={`group border-b border-slate-100 px-4 sm:px-5 py-4 transition-all duration-500 ease-out last:border-b-0 hover:-translate-y-0 md:hover:translate-x-[2px] hover:bg-slate-50/60 hover:shadow-[0_1px_0_rgba(15,23,42,0.02)] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      style={{ transitionDelay: isVisible ? `${index * 70}ms` : "0ms" }}
    >
      {/* Desktop / tablet grid row */}
      <div className="hidden lg:grid lg:grid-cols-[100px_1.5fr_1.05fr_0.95fr_1.7fr_1.15fr] lg:items-center lg:gap-4">
        <RiskBadge risk={item.risk} />

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">
            {item.bidder}
          </p>
        </div>

        <p className="truncate text-xs font-medium text-slate-500">
          {item.tender}
        </p>

        <p className="truncate text-xs font-semibold tracking-wide text-slate-600">
          {item.check}
        </p>

        <p className="truncate text-sm text-slate-600">{item.issue}</p>

        <StatusBadge status={item.status} />
      </div>

      {/* Mobile / tablet stacked card */}
      <div className="lg:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">
              {item.bidder}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{item.tender}</p>
          </div>
          <RiskBadge risk={item.risk} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="text-xs font-semibold tracking-wide text-slate-600">
            {item.check}
          </span>
          <StatusBadge status={item.status} />
        </div>

        <p className="mt-2 text-sm text-slate-600">{item.issue}</p>

        
      </div>
    </div>
  );
};

const NeedsAttention = () => {
  const [attentionItems, setAttentionItems] = useState([]);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  // Fetch the live flagged bidders
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/api/bidders", {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((r) => r.json())
      .then((bidders) => {
        if (!Array.isArray(bidders)) return;
        const flagged = bidders
          .filter((b) => b.risk_level === "HIGH" || b.risk_level === "MEDIUM")
          .map((b) => ({
            id: b.id,
            risk: b.risk_level,
            bidder: b.company_name,
            tender: `TENDER-0000${b.tender_id}`,
            check: "COMPLIANCE",
            issue: `${b.flag_count} flagged item(s) require review`,
            status: "REVIEW REQUIRED",
          }));
        setAttentionItems(flagged);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
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
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="needs-attention-heading" className="mb-10">
      {/* Section header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="needs-attention-heading"
            className="text-base font-semibold tracking-tight text-slate-900"
          >
            Needs Attention
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Flagged compliance checks requiring review or action.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold tracking-[0.06em] text-red-700">
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="nab-pulse absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
          </span>
          {attentionItems.length} ITEMS REQUIRE REVIEW
        </span>
      </div>

      {/* Main card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        {/* Card top bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 sm:px-5 py-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-emerald-700"
            title="These flagged items are placeholder demo data, not live verification results."
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            LIVE DATA
          </span>
          <span className="text-xs text-slate-400">Last updated: Just now</span>
        </div>

        {/* Desktop column headings */}
        <div className="hidden lg:grid lg:grid-cols-[100px_1.5fr_1.05fr_0.95fr_1.7fr_1.15fr] lg:items-center lg:gap-4 border-b border-slate-100 bg-slate-50/60 px-4 sm:px-5 py-2.5">
          <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">RISK</span>
          <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">BIDDER</span>
          <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">TENDER</span>
          <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">CHECK</span>
          <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">ISSUE</span>
          <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">STATUS</span>
          
        </div>

        {/* Rows */}
        <div role="list" aria-label="Flagged compliance items">
          {attentionItems.map((item, index) => (
            <div role="listitem" key={item.id}>
              <AttentionRow item={item} isVisible={isVisible} index={index} />
            </div>
          ))}
        </div>

        {/* Footer link */}
        
      </div>

      <style>{`
        .nab-pulse {
          animation: nabPulse 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes nabPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0; transform: scale(2); }
        }
        @media (prefers-reduced-motion: reduce) {
          .nab-pulse {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
};

export default NeedsAttention;