import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Circle,
  XCircle,
  FileText,
  FileCheck2,
  FileWarning,
  Clock,
  Hash,
  Gauge,
  Info,
  BadgeCheck,
  ClipboardList,
  ScanEye,
  ChevronRight,
  Landmark,
  Boxes,
  CalendarClock,
  Sparkles,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* MOCK / DEMO DATA — SIMULATED DATA (no backend, no live API calls)  */
/* ------------------------------------------------------------------ */

const BIDDER = {
  company: "Apex Industrial Solutions",
  bidderId: "BID-18421-001",
  gstin: "07AABCA1234F1Z5",
  tenderId: "GEM/2026/B/18421",
  tenderTitle: "Industrial Pumping Equipment",
  category: "Process Equipment",
  status: "FLAGGED",
  risk: "HIGH",
  complianceScore: 82,
  flagCount: 2,
};

const OVERVIEW = [
  { label: "Bidder ID", value: BIDDER.bidderId, icon: Hash },
  { label: "GSTIN", value: BIDDER.gstin, icon: Landmark },
  { label: "Tender ID", value: BIDDER.tenderId, icon: Boxes },
  { label: "Documents Submitted", value: "8", icon: FileText },
  { label: "Documents Verified", value: "6", icon: FileCheck2 },
  { label: "Compliance Flags", value: "2", icon: AlertTriangle },
  { label: "Last Verification", value: "05 Sep 2026, 11:42 AM", icon: CalendarClock },
  { label: "Verification State", value: "Needs Officer Review", icon: ScanEye },
];

const COMPLIANCE_CHECKS = [
  {
    id: "gst",
    name: "GST Registration",
    status: "VERIFIED",
    risk: "LOW",
    declaredLabel: "Declared",
    declared: "07AABCA1234F1Z5",
    verifiedLabel: "Verified",
    verified: "07AABCA1234F1Z5",
    source: "GST",
    description: "GST registration details matched with the available authoritative record.",
  },
  {
    id: "pan",
    name: "PAN",
    status: "VALIDATED",
    risk: "LOW",
    declaredLabel: "Declared",
    declared: "AABCA1234F",
    verifiedLabel: "Validated",
    verified: "AABCA1234F",
    source: "Local validation",
    description: "PAN format and checksum validation passed.",
  },
  {
    id: "udyam",
    name: "UDYAM / MSME",
    status: "SIMULATED",
    risk: "MEDIUM",
    declaredLabel: "Declared",
    declared: "UDYAM-DL-12-0012345",
    verifiedLabel: "Verified",
    verified: "Source unavailable in demo environment",
    source: "Udyam",
    description: "External Udyam verification is simulated for this demonstration.",
  },
  {
    id: "blacklist",
    name: "Blacklist / Debarment",
    status: "SIMULATED",
    risk: "HIGH",
    declaredLabel: "Declared",
    declared: "No active debarment declared",
    verifiedLabel: "Verified",
    verified: "Sandbox check required",
    source: "Blacklist / Debarment",
    description: "Live blacklist/debarment source is not connected in this demo.",
  },
  {
    id: "oem",
    name: "OEM Authorization",
    status: "MISMATCH",
    risk: "HIGH",
    declaredLabel: "Declared",
    declared: "Authorization valid until 31 Dec 2026",
    verifiedLabel: "Verified",
    verified: "Document states 30 Sep 2026",
    source: "Uploaded authorization document",
    description: "Declared validity date differs from the extracted document value.",
  },
  {
    id: "epfo",
    name: "EPFO / ESIC",
    status: "SIMULATED",
    risk: "MEDIUM",
    declaredLabel: "Declared",
    declared: "Compliant",
    verifiedLabel: "Verified",
    verified: "Source unavailable in demo environment",
    source: "EPFO / ESIC",
    description: "External verification is simulated for this demonstration.",
  },
];

const DOCUMENTS = [
  { name: "GST Certificate", status: "VERIFIED", confidence: 98 },
  { name: "PAN Card", status: "VALIDATED", confidence: 96 },
  { name: "Udyam Certificate", status: "SIMULATED", confidence: 94 },
  { name: "OEM Authorization", status: "MISMATCH", confidence: 91 },
  { name: "EPFO Certificate", status: "SIMULATED", confidence: 89 },
  { name: "ESIC Certificate", status: "SIMULATED", confidence: 90 },
  { name: "Income Tax / ITR Document", status: "VERIFIED", confidence: 95 },
  { name: "Declaration / Undertaking", status: "VERIFIED", confidence: 97 },
];

const ATTENTION_ITEMS = [
  {
    name: "OEM Authorization",
    status: "MISMATCH",
    detail: "Declared and document validity dates do not match.",
    icon: FileWarning,
  },
  {
    name: "Blacklist / Debarment",
    status: "SIMULATED",
    detail: "Live source verification is unavailable in this demo.",
    icon: ShieldAlert,
  },
  {
    name: "Udyam / MSME",
    status: "SIMULATED",
    detail: "External verification required before final decision.",
    icon: Info,
  },
];

const AUDIT = {
  runId: "VER-2026-18421-001",
  started: "05 Sep 2026, 11:38 AM",
  completed: "05 Sep 2026, 11:42 AM",
  checksEvaluated: 6,
  documentsProcessed: 8,
  environment: "DEMO / SIMULATED",
};

/* ------------------------------------------------------------------ */
/* SHARED STYLE HELPERS                                                */
/* ------------------------------------------------------------------ */

const STATUS_STYLES = {
  VERIFIED: {
    icon: CheckCircle2,
    label: "VERIFIED",
    classes: "bg-emerald-950/60 text-emerald-300 border-emerald-800/70",
    dot: "bg-emerald-400",
  },
  VALIDATED: {
    icon: BadgeCheck,
    label: "VALIDATED",
    classes: "bg-blue-950/60 text-blue-300 border-blue-800/70",
    dot: "bg-blue-400",
  },
  SIMULATED: {
    icon: Circle,
    label: "SIMULATED",
    classes: "bg-amber-950/60 text-amber-300 border-amber-800/70",
    dot: "bg-amber-400",
  },
  MISMATCH: {
    icon: AlertTriangle,
    label: "MISMATCH",
    classes: "bg-red-950/60 text-red-300 border-red-800/70",
    dot: "bg-red-400",
  },
};

const RISK_STYLES = {
  LOW: "bg-slate-800 text-slate-300 border-slate-700",
  MEDIUM: "bg-amber-950/50 text-amber-300 border-amber-800/60",
  HIGH: "bg-red-950/50 text-red-300 border-red-800/60",
};

function StatusBadge({ status, size = "sm" }) {
  const s = STATUS_STYLES[status];
  if (!s) return null;
  const Icon = s.icon;
  const padding = size === "lg" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-semibold tracking-wide ${padding} ${s.classes}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {s.label}
    </span>
  );
}

function RiskPill({ risk }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide ${RISK_STYLES[risk] || RISK_STYLES.LOW}`}
    >
      {risk} RISK
    </span>
  );
}

/* Reveal-on-scroll wrapper. Respects prefers-reduced-motion. */
function Reveal({ children, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeading({ title, description, icon: Icon }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      {Icon ? (
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-indigo-400">
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
      ) : null}
      <div>
        <h2 className="text-base font-semibold text-slate-100 sm:text-lg">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm text-slate-400">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                      */
/* ------------------------------------------------------------------ */

export default function BidderDetails() {
  const navigate = useNavigate();
  const [scoreWidth, setScoreWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setScoreWidth(BIDDER.complianceScore), 150);
    return () => clearTimeout(t);
  }, []);

  const verifiedDocs = DOCUMENTS.filter((d) => d.status === "VERIFIED").length;
  const validatedDocs = DOCUMENTS.filter((d) => d.status === "VALIDATED").length;
  const simulatedDocs = DOCUMENTS.filter((d) => d.status === "SIMULATED").length;
  const mismatchDocs = DOCUMENTS.filter((d) => d.status === "MISMATCH").length;
  const needsReviewDocs = simulatedDocs; // simulated checks require officer review

  const mismatchCheck = COMPLIANCE_CHECKS.find((c) => c.status === "MISMATCH");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* ---------------------------------------------------------- */}
        {/* PAGE HEADER                                                 */}
        {/* ---------------------------------------------------------- */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => console.log("Navigate back to bidders")}
            aria-label="Back to Bidders"
            className="group inline-flex items-center gap-2 rounded-md text-sm font-medium text-slate-400 transition-colors hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            Back to Bidders
          </button>

          <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h1 className="text-xl font-semibold text-white sm:text-2xl">Bidder Details</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-400">
                Review bidder identity, statutory compliance, verification evidence, and risk
                indicators.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-amber-800/60 bg-amber-950/50 px-3 py-1.5 text-xs font-semibold tracking-wide text-amber-300">
              <Circle className="h-3 w-3 shrink-0" aria-hidden="true" />
              SIMULATED DATA
            </span>
          </div>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* BIDDER IDENTITY HEADER                                      */}
        {/* ---------------------------------------------------------- */}
        <Reveal>
          <section
            aria-labelledby="bidder-identity-heading"
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm sm:p-6"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-indigo-400">
                  <Building2 className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h2 id="bidder-identity-heading" className="text-lg font-semibold text-white sm:text-xl">
                    {BIDDER.company}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-400">
                    {BIDDER.bidderId} &middot; GSTIN {BIDDER.gstin}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    <span className="text-slate-500">Tender:</span> {BIDDER.tenderId} — {BIDDER.tenderTitle}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-400">
                    <span className="text-slate-500">Category:</span> {BIDDER.category}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-md border border-red-800/60 bg-red-950/50 px-2.5 py-1 text-xs font-semibold tracking-wide text-red-300">
                      FLAGGED
                    </span>
                    <RiskPill risk={BIDDER.risk} />
                  </div>
                </div>
              </div>

              {/* Compliance score panel */}
              <div className="w-full shrink-0 rounded-lg border border-slate-800 bg-slate-950/60 p-4 lg:w-72">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-300">Compliance Score</p>
                  <Gauge className="h-4 w-4 text-indigo-400" aria-hidden="true" />
                </div>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {BIDDER.complianceScore}
                  <span className="text-base font-normal text-slate-500"> / 100</span>
                </p>
                <div
                  className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800"
                  role="progressbar"
                  aria-valuenow={BIDDER.complianceScore}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Compliance score"
                >
                  <div
                    className="h-full rounded-full bg-amber-500 transition-[width] duration-1000 ease-out motion-reduce:transition-none"
                    style={{ width: `${scoreWidth}%` }}
                  />
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {BIDDER.flagCount} compliance flags require officer review
                </p>
              </div>
            </div>
          </section>
        </Reveal>

        {/* ---------------------------------------------------------- */}
        {/* OVERVIEW / KEY INFORMATION                                  */}
        {/* ---------------------------------------------------------- */}
        <Reveal className="mt-6">
          <section aria-labelledby="overview-heading">
            <h2 id="overview-heading" className="sr-only">
              Key Information
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {OVERVIEW.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-lg border border-slate-800 bg-slate-900/50 p-3"
                  >
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <p className="text-[11px] font-medium uppercase tracking-wide">{item.label}</p>
                    </div>
                    <p className="mt-1.5 truncate text-sm font-semibold text-slate-100" title={item.value}>
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </Reveal>

        {/* ---------------------------------------------------------- */}
        {/* COMPLIANCE VERIFICATION                                     */}
        {/* ---------------------------------------------------------- */}
        <Reveal className="mt-8">
          <section aria-labelledby="compliance-heading">
            <SectionHeading
              title="Compliance Verification"
              description="Verification results across statutory, regulatory, and eligibility requirements."
              icon={ShieldCheck}
            />

            <div className="overflow-hidden rounded-xl border border-slate-800">
              {/* Desktop table header */}
              <div className="hidden grid-cols-12 gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:grid">
                <div className="col-span-3">Check</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Risk</div>
                <div className="col-span-3">Declared</div>
                <div className="col-span-3">Verified / Source</div>
              </div>

              <ul className="divide-y divide-slate-800">
                {COMPLIANCE_CHECKS.map((check) => (
                  <li
                    key={check.id}
                    className="grid grid-cols-1 gap-2 bg-slate-900/40 px-4 py-3.5 transition-colors hover:bg-slate-900/70 md:grid-cols-12 md:items-center md:gap-3"
                  >
                    <div className="md:col-span-3">
                      <p className="text-sm font-semibold text-slate-100">{check.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{check.description}</p>
                    </div>
                    <div className="md:col-span-2">
                      <StatusBadge status={check.status} />
                    </div>
                    <div className="md:col-span-1">
                      <RiskPill risk={check.risk} />
                    </div>
                    <div className="text-xs text-slate-400 md:col-span-3">
                      <span className="text-slate-500">{check.declaredLabel}: </span>
                      {check.declared}
                    </div>
                    <div className="text-xs text-slate-400 md:col-span-3">
                      <span className="text-slate-500">{check.verifiedLabel}: </span>
                      {check.verified}
                      <span className="mt-0.5 block text-slate-600">Source: {check.source}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </Reveal>

        {/* ---------------------------------------------------------- */}
        {/* DECLARED VS VERIFIED (MISMATCH DETAIL)                      */}
        {/* ---------------------------------------------------------- */}
        {mismatchCheck ? (
          <Reveal className="mt-8">
            <section
              aria-labelledby="inconsistency-heading"
              className="rounded-xl border border-red-900/50 bg-red-950/20 p-4 sm:p-6"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
                <h2 id="inconsistency-heading" className="text-base font-semibold text-red-200 sm:text-lg">
                  Detected Inconsistency
                </h2>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Declared by Bidder
                  </p>
                  <p className="mt-1.5 text-sm text-slate-400">Authorization valid until:</p>
                  <p className="text-base font-semibold text-slate-100">31 Dec 2026</p>
                </div>
                <div className="rounded-lg border border-red-900/60 bg-slate-950/60 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-red-400">
                    Verified from Document
                  </p>
                  <p className="mt-1.5 text-sm text-slate-400">Authorization valid until:</p>
                  <p className="text-base font-semibold text-red-300">30 Sep 2026</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-red-200">
                  Mismatch detected in OEM authorization validity date.
                </p>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-red-800/60 bg-red-950/60 px-2.5 py-1 text-xs font-semibold tracking-wide text-red-300">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  MISMATCH
                </span>
              </div>
            </section>
          </Reveal>
        ) : null}

        {/* ---------------------------------------------------------- */}
        {/* DOCUMENT VERIFICATION SUMMARY                               */}
        {/* ---------------------------------------------------------- */}
        <Reveal className="mt-8">
          <section aria-labelledby="documents-heading">
            <SectionHeading
              title="Document Verification"
              description="Demo records of documents processed for this bidder. No files are uploaded or downloaded here."
              icon={ClipboardList}
            />

            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-center">
                <p className="text-lg font-semibold text-slate-100">8</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Submitted</p>
              </div>
              <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-3 text-center">
                <p className="text-lg font-semibold text-emerald-300">{verifiedDocs + validatedDocs}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-500/80">Verified</p>
              </div>
              <div className="rounded-lg border border-amber-900/50 bg-amber-950/20 p-3 text-center">
                <p className="text-lg font-semibold text-amber-300">{needsReviewDocs}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-amber-500/80">Needs Review</p>
              </div>
              <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-3 text-center">
                <p className="text-lg font-semibold text-red-300">{mismatchDocs}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-red-500/80">Failed / Mismatch</p>
              </div>
            </div>

            <ul className="divide-y divide-slate-800 overflow-hidden rounded-xl border border-slate-800">
              {DOCUMENTS.map((doc) => (
                <li
                  key={doc.name}
                  className="flex flex-col gap-2 bg-slate-900/40 px-4 py-3 transition-colors hover:bg-slate-900/70 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                    <p className="text-sm font-medium text-slate-200">{doc.name}</p>
                  </div>
                  <div className="flex items-center gap-3 pl-6 sm:pl-0">
                    <span className="text-xs text-slate-500">OCR confidence {doc.confidence}%</span>
                    <StatusBadge status={doc.status} />
                  </div>
                </li>
              ))}
            </ul>
            <button
            type="button"
            onClick={() => {
              localStorage.setItem("selectedBidderId", BIDDER.bidderId);
              navigate("/documentverification");
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Open Document Verification
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
          </section>
        </Reveal>

        {/* ---------------------------------------------------------- */}
        {/* AI RISK ASSESSMENT                                          */}
        {/* ---------------------------------------------------------- */}
        <Reveal className="mt-8">
          <section
            aria-labelledby="ai-risk-heading"
            className="rounded-xl border border-indigo-900/40 bg-gradient-to-b from-indigo-950/30 to-slate-900/60 p-4 sm:p-6"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-800/60 bg-indigo-950/60 text-indigo-300">
                <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div>
                <h2 id="ai-risk-heading" className="text-base font-semibold text-slate-100 sm:text-lg">
                  AI Risk Assessment
                </h2>
                <p className="mt-0.5 text-sm text-slate-400">
                  Decision-support summary generated from available verification results.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 sm:max-w-md">
              <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-center">
                <p className="text-sm font-semibold text-red-300">{BIDDER.risk}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Risk Level</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-center">
                <p className="text-sm font-semibold text-slate-100">{BIDDER.complianceScore} / 100</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Score</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-center">
                <p className="text-sm font-semibold text-amber-300">{BIDDER.flagCount}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Flags</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Bidder requires officer review before qualification. GST registration matches the
              available record and PAN validation passed. However, OEM authorization contains a
              validity-date mismatch, while Udyam and blacklist checks remain simulated and
              require source verification before final decision.
            </p>

            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-800/50 bg-amber-950/30 px-3.5 py-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-amber-200">
                AI-generated assessment is advisory. Final qualification or disqualification
                remains with the Procurement Officer.
              </p>
            </div>
          </section>
        </Reveal>

        {/* ---------------------------------------------------------- */}
        {/* WHAT NEEDS ATTENTION                                        */}
        {/* ---------------------------------------------------------- */}
        <Reveal className="mt-8">
          <section aria-labelledby="attention-heading">
            <SectionHeading title="What Needs Attention" icon={AlertTriangle} />
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {ATTENTION_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.name}
                    className="rounded-lg border border-slate-800 bg-slate-900/50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="h-4.5 w-4.5 text-slate-400" aria-hidden="true" />
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-100">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
                  </li>
                );
              })}
            </ul>
          </section>
        </Reveal>

        {/* ---------------------------------------------------------- */}
        {/* OFFICER ACTION                                              */}
        {/* ---------------------------------------------------------- */}
        <Reveal className="mt-8">
          <section
            aria-labelledby="officer-review-heading"
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6"
          >
            <h2 id="officer-review-heading" className="text-base font-semibold text-white sm:text-lg">
              Officer Review Required
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Review the flagged checks and verification evidence before making a procurement
              decision.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => console.log("Open officer review")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 sm:w-auto"
              >
                Open Review
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => console.log("Navigate back to bidders")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to Bidders
              </button>
            </div>

            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
              Final decision authority: Procurement Officer
            </p>
          </section>
        </Reveal>

        {/* ---------------------------------------------------------- */}
        {/* AUDIT INFORMATION                                           */}
        {/* ---------------------------------------------------------- */}
        <Reveal className="mt-8 mb-4">
          <section
            aria-labelledby="audit-heading"
            className="rounded-lg border border-slate-800 bg-slate-950/60 p-4"
          >
            <h2
              id="audit-heading"
              className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
            >
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Verification Audit Trail
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs sm:grid-cols-3 lg:grid-cols-6">
              <div>
                <p className="text-slate-500">Verification run</p>
                <p className="mt-0.5 font-medium text-slate-300">{AUDIT.runId}</p>
              </div>
              <div>
                <p className="text-slate-500">Started</p>
                <p className="mt-0.5 font-medium text-slate-300">{AUDIT.started}</p>
              </div>
              <div>
                <p className="text-slate-500">Completed</p>
                <p className="mt-0.5 font-medium text-slate-300">{AUDIT.completed}</p>
              </div>
              <div>
                <p className="text-slate-500">Checks evaluated</p>
                <p className="mt-0.5 font-medium text-slate-300">{AUDIT.checksEvaluated}</p>
              </div>
              <div>
                <p className="text-slate-500">Documents processed</p>
                <p className="mt-0.5 font-medium text-slate-300">{AUDIT.documentsProcessed}</p>
              </div>
              <div>
                <p className="text-slate-500">Environment</p>
                <p className="mt-0.5 font-semibold text-amber-400">{AUDIT.environment}</p>
              </div>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
