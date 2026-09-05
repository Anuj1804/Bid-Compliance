import React, { useEffect, useRef, useState } from "react";
import {
  UsersRound,
  CalendarDays,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";

// Mock / demo data — structured so it can be swapped for API data later.
const recentTenders = [
  {
    id: 1,
    tenderId: "GEM/2026/B/18421",
    title: "Industrial Pumping Equipment",
    bidders: 18,
    compliance: 82,
    deadline: "12 Sep 2026",
    daysLeft: 7,
    risk: "LOW",
    status: "ACTIVE",
  },
  {
    id: 2,
    tenderId: "GEM/2026/B/18397",
    title: "Pipeline Safety Systems",
    bidders: 24,
    compliance: 68,
    deadline: "15 Sep 2026",
    daysLeft: 10,
    risk: "MEDIUM",
    status: "UNDER REVIEW",
  },
  {
    id: 3,
    tenderId: "GEM/2026/B/18355",
    title: "Process Control Equipment",
    bidders: 11,
    compliance: 91,
    deadline: "18 Sep 2026",
    daysLeft: 13,
    risk: "LOW",
    status: "COMPLIANCE CHECK",
  },
  {
    id: 4,
    tenderId: "GEM/2026/B/18288",
    title: "Electrical Distribution Components",
    bidders: 32,
    compliance: 61,
    deadline: "20 Sep 2026",
    daysLeft: 3,
    risk: "HIGH",
    status: "CLOSING SOON",
  },
  {
    id: 5,
    tenderId: "GEM/2026/B/18512",
    title: "Refinery Maintenance Supplies",
    bidders: 15,
    compliance: 74,
    deadline: "22 Sep 2026",
    daysLeft: 5,
    risk: "MEDIUM",
    status: "CLOSING SOON",
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
  "COMPLIANCE CHECK": "border-blue-200 bg-blue-50 text-blue-700",
  "CLOSING SOON": "border-red-200 bg-red-50 text-red-700",
};

const getComplianceTone = (value) => {
  if (value >= 75) return { bar: "bg-emerald-500", text: "text-emerald-700" };
  if (value >= 50) return { bar: "bg-amber-500", text: "text-amber-700" };
  return { bar: "bg-red-500", text: "text-red-700" };
};

/** Animates a number from 0 to target once `isActive` is true. */
const useCountUp = (target, isActive, duration = 800) => {
  const [value, setValue] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isActive || hasRun.current) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setValue(target);
      hasRun.current = true;
      return;
    }

    hasRun.current = true;
    let frame;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isActive, target, duration]);

  return value;
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
  const animatedValue = useCountUp(value, isVisible);

  return (
    <div className="w-full max-w-[140px]">
      <div className="flex items-baseline justify-between">
        <span className={`text-sm font-semibold tabular-nums ${tone.text}`}>{animatedValue}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${tone.bar} transition-[width] duration-700 ease-out`}
          style={{ width: isVisible ? `${value}%` : "0%", transitionDelay: isVisible ? delay : "0ms" }}
        />
      </div>
    </div>
  );
};

const TenderRow = ({ tender, isVisible, index }) => {
  const isApproaching = tender.daysLeft <= 7;
  const delay = `${index * 80}ms`;

  return (
    <div
      className={`group border-b border-slate-100 px-4 sm:px-5 py-4 transition-all duration-500 ease-out last:border-b-0 hover:bg-slate-50 md:hover:translate-x-[2px] ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
      style={{ transitionDelay: isVisible ? delay : "0ms" }}
    >
      {/* Desktop / tablet grid row */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(250px,1.6fr)_100px_150px_135px_100px_140px_100px] lg:items-center lg:gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">{tender.title}</p>
          <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">{tender.tenderId}</p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <UsersRound className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" size={14} aria-hidden="true" />
          {tender.bidders}
        </div>

        <ComplianceProgress value={tender.compliance} isVisible={isVisible} delay={delay} />

        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <CalendarDays className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" size={14} aria-hidden="true" />
            {tender.deadline}
          </div>
          <p className={`mt-0.5 text-[11px] font-medium ${isApproaching ? "text-amber-600" : "text-slate-400"}`}>
            {tender.daysLeft} days left
          </p>
        </div>

        <RiskBadge risk={tender.risk} />

        <StatusBadge status={tender.status} />

        <div className="flex justify-end">
          <button
            type="button"
            aria-label={`View tender ${tender.title}`}
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
            <p className="truncate text-sm font-medium text-slate-800">{tender.title}</p>
            <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">{tender.tenderId}</p>
          </div>
          <RiskBadge risk={tender.risk} />
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <UsersRound className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" size={14} aria-hidden="true" />
          {tender.bidders} bidders
        </div>

        <div className="mt-3">
          <ComplianceProgress value={tender.compliance} isVisible={isVisible} delay={delay} />
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
          <CalendarDays className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" size={14} aria-hidden="true" />
          {tender.deadline}
          <span className={`font-medium ${isApproaching ? "text-amber-600" : "text-slate-400"}`}>
            · {tender.daysLeft} days left
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <StatusBadge status={tender.status} />
        </div>

        <button
          type="button"
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

const RecentTenders = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

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
    <section ref={sectionRef} aria-labelledby="recent-tenders-heading" className="mb-10">
      {/* Section header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="recent-tenders-heading" className="text-base font-semibold tracking-tight text-slate-900">
            Recent Tenders
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Latest tenders currently being processed through compliance verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-amber-700"
            title="These tenders are placeholder demo data, not live procurement records."
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            SIMULATED DATA
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded-md"
          >
            View all tenders
            <ArrowRight className="h-3.5 w-3.5" size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        {/* Card top bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 sm:px-5 py-3">
          <span className="text-sm font-medium text-slate-700">Active Tender Pipeline</span>
          <span className="text-xs text-slate-400">{recentTenders.length} tenders</span>
        </div>

        {/* Desktop column headings */}
        <div className="hidden lg:grid lg:grid-cols-[minmax(250px,1.6fr)_100px_150px_135px_100px_140px_100px] lg:items-center lg:gap-4 border-b border-slate-100 bg-slate-50/60 px-4 sm:px-5 py-2.5">
          <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">TENDER</span>
          <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">BIDDERS</span>
          <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">COMPLIANCE</span>
          <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">DEADLINE</span>
          <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">RISK</span>
          <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-400">STATUS</span>
          <span className="text-right text-[10px] font-semibold tracking-[0.1em] text-slate-400">ACTION</span>
        </div>

        {/* Rows */}
        <div role="list" aria-label="Recent tenders">
          {recentTenders.map((tender, index) => (
            <div role="listitem" key={tender.id}>
              <TenderRow tender={tender} isVisible={isVisible} index={index} />
            </div>
          ))}
        </div>

        {/* Footer link */}
        <div className="flex justify-end border-t border-slate-100 px-4 sm:px-5 py-3">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded-md"
          >
            View all tenders
            <ArrowRight className="h-3.5 w-3.5" size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecentTenders;
