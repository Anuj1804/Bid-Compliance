import React, { useState } from "react";
import {
  AlertTriangle,
  FileText,
  ShieldCheck,
  ArrowRightLeft,
  CheckCircle2,
  BadgeCheck,
  Circle,
  Info,
  Sparkles,
  ClipboardCheck,
  Clock,
  Gauge,
  Flag,
  XCircle,
  ScanSearch,
  UploadCloud,
  FileCheck2,
  GitCompareArrows,
  ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* MOCK / DEMO DATA — SIMULATED DATA (no backend, no live API calls)  */
/* ------------------------------------------------------------------ */

const BIDDER = {
  name: "Apex Industrial Solutions",
  bidderId: "BID-18421-001",
  gstin: "07AABCA1234F1Z5",
  tenderId: "GEM/2026/B/18421",
  tenderName: "Industrial Pumping Equipment",
  category: "Process Equipment",
  complianceScore: 82,
  risk: "HIGH",
};

const ISSUE = {
  title: "OEM Authorization Mismatch",
  check: "OEM AUTHORIZATION",
  status: "MISMATCH",
  confidence: 91,
  method: "Document comparison",
  declaredValue: "Valid until 31 Dec 2026",
  declaredSource: "Bidder Declaration",
  verifiedValue: "Document states 30 Sep 2026",
  verifiedSource: "Uploaded OEM Authorization",
};

const AI_RECOMMENDATION = "Review OEM authorization validity before qualification.";

const EVIDENCE = [
  {
    name: "Bidder Declaration",
    source: "Submitted by bidder at bid time",
    status: "VALIDATED",
    confidence: 96,
    icon: FileText,
  },
  {
    name: "Uploaded OEM Authorization",
    source: "Document evidence provided by bidder",
    status: "VERIFIED",
    confidence: 91,
    icon: UploadCloud,
  },
  {
    name: "OCR Extraction",
    source: "Text extracted from uploaded document",
    status: "VALIDATED",
    confidence: 94,
    icon: ScanSearch,
  },
  {
    name: "Final Comparison",
    source: "Declared value vs. extracted document value",
    status: "MISMATCH",
    confidence: 91,
    icon: GitCompareArrows,
  },
];

const TIMELINE = [
  { time: "11:38 AM", label: "Document uploaded", icon: UploadCloud },
  { time: "11:39 AM", label: "OCR extraction completed", icon: ScanSearch },
  { time: "11:41 AM", label: "Verification completed", icon: FileCheck2 },
  { time: "11:42 AM", label: "Mismatch detected", icon: AlertTriangle },
  { time: "11:42 AM", label: "AI recommendation generated", icon: Sparkles },
  { time: "—", label: "Officer review pending", icon: Clock },
];

const HONESTY_FRAMEWORK = [
  {
    status: "VERIFIED",
    text: "Real external / authoritative source.",
  },
  {
    status: "VALIDATED",
    text: "Local format / logic validation.",
  },
  {
    status: "SIMULATED",
    text: "No real external access; sandbox/mock result.",
  },
  {
    status: "MISMATCH",
    text: "Sources disagree.",
  },
];

const REVIEW_ID = "REV-2026-18421-001";
const REVIEW_DATE = "05 Sep 2026";

/* ------------------------------------------------------------------ */
/* STYLE HELPERS (consistent with DeclaredVerified.jsx)                */
/* ------------------------------------------------------------------ */

const STATUS_STYLES = {
  VERIFIED: {
    icon: CheckCircle2,
    label: "VERIFIED",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  VALIDATED: {
    icon: BadgeCheck,
    label: "VALIDATED",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
  },
  SIMULATED: {
    icon: Circle,
    label: "SIMULATED",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
  },
  MISMATCH: {
    icon: AlertTriangle,
    label: "MISMATCH",
    classes: "bg-red-50 text-red-700 border-red-200",
  },
};

const RISK_STYLES = {
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HIGH: "bg-red-50 text-red-700 border-red-200",
};

const REVIEW_STATUS_STYLES = {
  UNRESOLVED: "bg-slate-100 text-slate-600 border-slate-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ESCALATED: "bg-amber-50 text-amber-700 border-amber-200",
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
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide ${
        RISK_STYLES[risk] || RISK_STYLES.LOW
      }`}
    >
      {risk} RISK
    </span>
  );
}

function ReviewStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-semibold tracking-wide ${
        REVIEW_STATUS_STYLES[status] || REVIEW_STATUS_STYLES.UNRESOLVED
      }`}
    >
      {status === "RESOLVED" ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : status === "ESCALATED" ? (
        <Flag className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      {status}
    </span>
  );
}

function SectionCard({ title, description, icon: Icon, children, id, className = "" }) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section
      aria-labelledby={headingId}
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}
    >
      <div className="mb-4 flex items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600">
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
        ) : null}
        <div>
          <h2 id={headingId} className="text-base font-semibold text-slate-900 sm:text-lg">
            {title}
          </h2>
          {description ? <p className="mt-0.5 text-sm text-slate-500">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function ScoreRing({ score }) {
  const size = 96;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#f59e0b" : score >= 50 ? "#f59e0b" : "#dc2626";

  return (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Compliance score ${score} out of 100`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-semibold text-slate-900">{score}</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">/ 100</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                      */
/* ------------------------------------------------------------------ */

export default function OfficerReview() {
  const [reviewStatus, setReviewStatus] = useState("UNRESOLVED");
  const [officerNote, setOfficerNote] = useState("");
  const [noteWarning, setNoteWarning] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const handleAction = (action) => {
    const requiresNote = action === "RESOLVED" || action === "ESCALATED";

    if (requiresNote && officerNote.trim().length === 0) {
      setNoteWarning(true);
      setConfirmation(null);
      return;
    }

    setNoteWarning(false);
    setReviewStatus(action);

    const messages = {
      RESOLVED: "Issue marked as resolved. This decision has been recorded for this review session.",
      ESCALATED: "Issue escalated for further review. This decision has been recorded for this review session.",
      UNRESOLVED: "Review status reset to unresolved.",
    };
    setConfirmation(messages[action]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* ---------------------------------------------------------- */}
        {/* TOP HEADER / BREADCRUMB                                     */}
        {/* ---------------------------------------------------------- */}
        <div className="mb-6">
          <p className="text-xs font-medium text-slate-400">
            Dashboard / Bidders / {BIDDER.name} / Officer Review
          </p>

          <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Officer Review</h1>
              <p className="mt-1 text-sm text-slate-500">Bidder Compliance Review</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden="true" />
                DEMO / SIMULATED
              </span>
              <RiskPill risk={BIDDER.risk} />
              <StatusBadge status={ISSUE.status} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* -------------------------------------------------------- */}
          {/* BIDDER CONTEXT CARD                                         */}
          {/* -------------------------------------------------------- */}
          <SectionCard id="bidder-context" title="Bidder Context" icon={FileText}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{BIDDER.name}</h3>
                <p className="text-sm text-slate-500">{BIDDER.bidderId}</p>
                <p className="mt-2 text-sm text-slate-700">
                  {BIDDER.tenderId} — {BIDDER.tenderName}
                </p>
                <p className="text-sm text-slate-500">Category: {BIDDER.category}</p>
                <p className="mt-1 text-sm text-slate-500">GSTIN: {BIDDER.gstin}</p>
              </div>

              <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <ScoreRing score={BIDDER.complianceScore} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Compliance Score
                  </p>
                  <div className="mt-1">
                    <RiskPill risk={BIDDER.risk} />
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Requires officer review
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* -------------------------------------------------------- */}
          {/* ISSUE ALERT SECTION                                         */}
          {/* -------------------------------------------------------- */}
          <SectionCard
            id="issue"
            title={ISSUE.title}
            description={`Check: ${ISSUE.check}`}
            icon={AlertTriangle}
            className="border-red-200"
          >
            <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Declared
                </p>
                <p className="mt-1.5 text-base font-semibold text-slate-900">{ISSUE.declaredValue}</p>
                <p className="mt-1 text-xs text-slate-500">Source: {ISSUE.declaredSource}</p>
              </div>

              <div className="flex items-center justify-center py-1 sm:py-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600">
                  <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-red-600">
                  Verified
                </p>
                <p className="mt-1.5 text-base font-semibold text-red-800">{ISSUE.verifiedValue}</p>
                <p className="mt-1 text-xs text-red-600">Source: {ISSUE.verifiedSource}</p>
              </div>
            </div>

            <p className="mt-4 text-sm font-medium text-red-700">
              Mismatch detected between bidder declaration and uploaded OEM authorization document.
            </p>

            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1">
                <Gauge className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Confidence: {ISSUE.confidence}%
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1">
                <ScanSearch className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Verification method: {ISSUE.method}
              </span>
            </div>
          </SectionCard>

          {/* -------------------------------------------------------- */}
          {/* EVIDENCE SUMMARY                                            */}
          {/* -------------------------------------------------------- */}
          <SectionCard
            id="evidence"
            title="Evidence Reviewed"
            description="Sources and results considered while evaluating this issue."
            icon={ScanSearch}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {EVIDENCE.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.name} className="rounded-lg border border-slate-200 p-3.5">
                    <div className="flex items-center justify-between">
                      <Icon className="h-4.5 w-4.5 text-slate-400" aria-hidden="true" />
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-800">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.source}</p>
                    <p className="mt-2 text-xs font-medium text-slate-400">
                      Confidence: {item.confidence}%
                    </p>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* -------------------------------------------------------- */}
          {/* AI RECOMMENDATION CARD                                      */}
          {/* -------------------------------------------------------- */}
          <SectionCard
            id="ai-recommendation"
            title="AI Recommendation"
            icon={Sparkles}
            className="border-indigo-200 bg-gradient-to-b from-indigo-50/40 to-white"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold tracking-wide text-indigo-700">
                ADVISORY ONLY
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">{AI_RECOMMENDATION}</p>
            <div className="mt-4 flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3.5 py-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-slate-600">
                AI findings are decision-support only. The Procurement Officer retains full
                authority for the final qualification decision.
              </p>
            </div>
          </SectionCard>

          {/* -------------------------------------------------------- */}
          {/* OFFICER DECISION SECTION                                    */}
          {/* -------------------------------------------------------- */}
          <SectionCard
            id="officer-decision"
            title="Officer Action Required"
            icon={ClipboardCheck}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Current status:
              </span>
              <ReviewStatusBadge status={reviewStatus} />
            </div>

            <label htmlFor="officer-note" className="block text-sm font-medium text-slate-700">
              Officer Notes
            </label>
            <textarea
              id="officer-note"
              rows={4}
              value={officerNote}
              onChange={(e) => {
                setOfficerNote(e.target.value);
                if (e.target.value.trim().length > 0) setNoteWarning(false);
              }}
              placeholder="Enter your observation, verification decision, or reason for escalation..."
              className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />

            {noteWarning ? (
              <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                <p className="text-xs leading-relaxed text-amber-800">
                  Please enter an officer note before resolving or escalating this issue.
                </p>
              </div>
            ) : null}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => handleAction("RESOLVED")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 sm:w-auto"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Resolve Issue
              </button>
              <button
                type="button"
                onClick={() => handleAction("ESCALATED")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 sm:w-auto"
              >
                <Flag className="h-4 w-4" aria-hidden="true" />
                Escalate for Further Review
              </button>
              <button
                type="button"
                onClick={() => handleAction("UNRESOLVED")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:w-auto"
              >
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Keep Unresolved
              </button>
            </div>

            {confirmation ? (
              <div
                role="status"
                className="mt-4 flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3.5 py-2.5"
              >
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                <p className="text-xs leading-relaxed text-blue-800">{confirmation}</p>
              </div>
            ) : null}
          </SectionCard>

          {/* -------------------------------------------------------- */}
          {/* OFFICER DECISION EXPLANATION                                */}
          {/* -------------------------------------------------------- */}
          <SectionCard id="decision-explanation" title="Officer Decision" icon={ShieldCheck}>
            <p className="text-sm leading-relaxed text-slate-600">
              The system has identified and explained the discrepancy. The final procurement
              decision must be made by the authorized Procurement Officer after reviewing the
              available evidence.
            </p>
          </SectionCard>

          {/* -------------------------------------------------------- */}
          {/* REVIEW TIMELINE                                             */}
          {/* -------------------------------------------------------- */}
          <SectionCard id="timeline" title="Review Timeline" icon={Clock} description={REVIEW_DATE}>
            <ol className="space-y-0">
              {TIMELINE.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === TIMELINE.length - 1;
                return (
                  <li key={step.label} className="relative flex gap-3 pb-6 last:pb-0">
                    {!isLast ? (
                      <span
                        className="absolute left-[15px] top-8 h-full w-px bg-slate-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-600">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="pt-1">
                      <p className="text-sm font-medium text-slate-800">{step.label}</p>
                      <p className="text-xs text-slate-400">{step.time}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </SectionCard>

          {/* -------------------------------------------------------- */}
          {/* HONESTY FRAMEWORK                                           */}
          {/* -------------------------------------------------------- */}
          <SectionCard id="honesty" title="Verification Honesty Framework" icon={Info}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {HONESTY_FRAMEWORK.map((item) => (
                <div
                  key={item.status}
                  className={`rounded-lg border p-3.5 ${
                    item.status === ISSUE.status
                      ? "border-red-300 bg-red-50 ring-1 ring-red-200"
                      : "border-slate-200"
                  }`}
                >
                  <StatusBadge status={item.status} />
                  <p className="mt-2 text-xs text-slate-500">{item.text}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* -------------------------------------------------------- */}
          {/* FOOTER ACTION BAR                                           */}
          {/* -------------------------------------------------------- */}
          <section
            aria-label="Review footer actions"
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500">
                <span>
                  Review ID: <span className="font-medium text-slate-700">{REVIEW_ID}</span>
                </span>
                <span>
                  Environment: <span className="font-medium text-slate-700">DEMO / SIMULATED</span>
                </span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => handleAction("RESOLVED")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:w-auto"
                >
                  Resolve Issue
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("ESCALATED")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:w-auto"
                >
                  Escalate
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
