import React from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  AlertTriangle,
  FileText,
  ShieldCheck,
  CheckCircle2,
  BadgeCheck,
  Circle,
  Info,
  Gauge,
  ScanSearch,
  ClipboardCheck,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* MOCK / DEMO DATA — SIMULATED DATA (no backend, no live API calls)  */
/* ------------------------------------------------------------------ */

const CONTEXT = {
  bidderName: "Apex Industrial Solutions",
  bidderId: "BID-18421-001",
  tenderId: "GEM/2026/B/18421",
  tenderTitle: "Industrial Pumping Equipment",
};

/*
 * Generic discrepancy record. The UI below is driven entirely by this
 * shape so future checks (GST name mismatch, PAN entity type mismatch,
 * Udyam date issues, etc.) can reuse this component without rewriting it.
 */
const DISCREPANCY = {
  checkType: "oem_authorization",
  checkName: "OEM Authorization",
  status: "MISMATCH",
  risk: "HIGH",
  confidence: 91,
  verificationMethod: "Document comparison",
  declared: {
    label: "Declared Information",
    value: "Valid until 31 Dec 2026",
    source: "Bidder declaration",
  },
  verified: {
    label: "Verified / Extracted Information",
    value: "Document states 30 Sep 2026",
    source: "Uploaded OEM Authorization",
  },
  explanation: "Declared information does not match the submitted document.",
  recommendation:
    "Review the OEM authorization validity before making a qualification decision.",
};

/* ------------------------------------------------------------------ */
/* STYLE HELPERS                                                       */
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

function EvidenceItem({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                      */
/* ------------------------------------------------------------------ */

export default function DeclaredVerified({ discrepancy = DISCREPANCY, context = CONTEXT }) {
  const isMismatch = discrepancy.status === "MISMATCH";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto w-full max-w-[1600px] px-6 lg:px-10 py-6">
        {/* ---------------------------------------------------------- */}
        {/* PAGE HEADER                                                 */}
        {/* ---------------------------------------------------------- */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => console.log("Navigate back to bidder details")}
            aria-label="Back to Bidder Details"
            className="group inline-flex items-center gap-2 rounded-md text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            Back to Bidder Details
          </button>

          <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Declared vs Verified</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Review the evidence behind this compliance discrepancy.
              </p>
            </div>
            <StatusBadge status={discrepancy.status} size="lg" />
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3.5 text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{context.bidderName}</span>{" "}
            <span className="text-slate-400">({context.bidderId})</span>
            <span className="mx-2 text-slate-300">&middot;</span>
            {context.tenderId} — {context.tenderTitle}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* -------------------------------------------------------- */}
          {/* MAIN COMPARISON                                             */}
          {/* -------------------------------------------------------- */}
          <SectionCard
            id="comparison"
            title={discrepancy.checkName}
            description="Compliance check flagged during document verification."
            icon={ArrowLeftRight}
          >
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-red-800">{discrepancy.status}</p>
                <p className="text-sm text-red-700">{discrepancy.explanation}</p>
              </div>
              <div className="ml-auto">
                <RiskPill risk={discrepancy.risk} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {discrepancy.declared.label}
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {discrepancy.declared.value}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  Source: {discrepancy.declared.source}
                </p>
              </div>

              <div
                className={`rounded-lg border p-4 ${
                  isMismatch ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"
                }`}
              >
                <p
                  className={`text-[11px] font-semibold uppercase tracking-wide ${
                    isMismatch ? "text-red-600" : "text-slate-500"
                  }`}
                >
                  {discrepancy.verified.label}
                </p>
                <p
                  className={`mt-2 text-base font-semibold ${
                    isMismatch ? "text-red-800" : "text-slate-900"
                  }`}
                >
                  {discrepancy.verified.value}
                </p>
                <p
                  className={`mt-2 flex items-center gap-1.5 text-xs ${
                    isMismatch ? "text-red-600" : "text-slate-500"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  Source: {discrepancy.verified.source}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* -------------------------------------------------------- */}
          {/* EVIDENCE                                                    */}
          {/* -------------------------------------------------------- */}
          <SectionCard
            id="evidence"
            title="Evidence"
            description="Supporting details for this verification result."
            icon={ScanSearch}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <EvidenceItem label="Check" value={discrepancy.checkName} />
              <EvidenceItem
                label="Status"
                value={<StatusBadge status={discrepancy.status} />}
              />
              <EvidenceItem label="Risk" value={<RiskPill risk={discrepancy.risk} />} />
              <EvidenceItem label="Declared Source" value={discrepancy.declared.source} />
              <EvidenceItem label="Verified Source" value={discrepancy.verified.source} />
              <EvidenceItem label="Confidence" value={`${discrepancy.confidence}%`} />
              <EvidenceItem
                label="Verification Method"
                value={discrepancy.verificationMethod}
              />
            </div>
          </SectionCard>

          {/* -------------------------------------------------------- */}
          {/* SYSTEM RECOMMENDATION                                       */}
          {/* -------------------------------------------------------- */}
          <SectionCard
            id="recommendation"
            title="System Recommendation"
            description="AI / System Recommendation — advisory only."
            icon={ShieldCheck}
          >
            <p className="text-sm leading-relaxed text-slate-700">{discrepancy.recommendation}</p>
            <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-amber-800">
                Final qualification/disqualification remains with the Procurement Officer.
              </p>
            </div>
          </SectionCard>

          {/* -------------------------------------------------------- */}
          {/* HONESTY FRAMEWORK                                           */}
          {/* -------------------------------------------------------- */}
          <SectionCard
            id="honesty"
            title="What This Status Means"
            icon={Info}
          >
            <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-3.5">
              <StatusBadge status="MISMATCH" />
              <p className="text-sm text-slate-600">
                MISMATCH means the declared bidder information and the verification/source
                information disagree.
              </p>
            </div>
          </SectionCard>

          {/* -------------------------------------------------------- */}
          {/* OFFICER ACTION PREVIEW                                      */}
          {/* -------------------------------------------------------- */}
          <SectionCard
            id="officer-action"
            title="Officer Action Required"
            icon={ClipboardCheck}
          >
            <p className="text-sm text-slate-600">
              This discrepancy requires human review before the bidder can be cleared.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => console.log("Open officer review")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:w-auto"
              >
                Open Officer Review
              </button>
              <button
                type="button"
                onClick={() => console.log("Navigate back to bidder details")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to Bidder Details
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
