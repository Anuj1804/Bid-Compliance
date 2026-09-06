import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "./dashboard/DashboardSidebar";
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
  Flag,
  XCircle,
  ArrowLeft,
  History,
  Save,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* NOTE ON DashboardSidebar PROPS                                      */
/* ------------------------------------------------------------------ */
/*
 * Assumes DashboardSidebar accepts the same collapse / mobile-drawer
 * props used elsewhere in the app: collapsed, setCollapsed, mobileOpen,
 * setMobileOpen. Update the <DashboardSidebar ... /> call below if your
 * component uses different prop names. The sidebar's own nav links
 * (Dashboard, Tenders, Bidders, Document Verification, Reviews, Audit
 * Trail, Blacklist Sandbox, Admin Panel) are assumed to already be
 * defined inside DashboardSidebar itself.
 */

/* ------------------------------------------------------------------ */
/* MOCK / DEMO DATA — SIMULATED DATA (no backend, no live API calls)  */
/* ------------------------------------------------------------------ */

const CONTEXT = {
  bidderName: "Apex Industrial Solutions",
  bidderId: "BID-18421-001",
  tenderId: "GEM/2026/B/18421",
  tenderName: "Industrial Pumping Equipment",
  overallRisk: "HIGH",
  complianceScore: 82,
  status: "NEEDS OFFICER REVIEW",
};

const SUMMARY = {
  submitted: 8,
  verified: 3,
  needsReview: 4,
  mismatches: 1,
  overallRisk: "HIGH",
};

const KEY_FINDING = {
  check: "OEM Authorization",
  declared: "Valid until 31 Dec 2026",
  verified: "Valid until 30 Sep 2026",
  status: "MISMATCH",
  confidence: 91,
  severity: "HIGH",
  explanation:
    "The submitted document validity period does not match the bidder's declared validity period.",
};

const FINDINGS = [
  { name: "GST", status: "VERIFIED", explanation: "GST registration matched the available record." },
  { name: "PAN", status: "VALIDATED", explanation: "PAN format and checksum validation passed." },
  { name: "Udyam", status: "SIMULATED", explanation: "External Udyam source unavailable in this demo." },
  { name: "Blacklist", status: "SIMULATED", explanation: "Live blacklist source not connected in this demo." },
  { name: "EPFO/ESIC", status: "SIMULATED", explanation: "External EPFO/ESIC source unavailable in this demo." },
  { name: "OEM Authorization", status: "MISMATCH", explanation: "Declared and document validity dates disagree." },
];

const AI_RECOMMENDATION =
  "Review the OEM Authorization mismatch and supporting evidence before making a final qualification decision.";

const REVIEW_DATE = "05 Sep 2026";

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

const DECISION_STYLES = {
  PENDING: "bg-slate-100 text-slate-600 border-slate-200",
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

function DecisionBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-semibold tracking-wide ${
        DECISION_STYLES[status] || DECISION_STYLES.PENDING
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

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                      */
/* ------------------------------------------------------------------ */

export default function OfficerReview() {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [decisionStatus, setDecisionStatus] = useState("PENDING");
  const [decisionMessage, setDecisionMessage] = useState(null);

  const [officerComments, setOfficerComments] = useState("");
  const [saveMessage, setSaveMessage] = useState(null);

  const handleDecision = (status) => {
    setDecisionStatus(status);
    const messages = {
      RESOLVED: "The officer has resolved this finding.",
      ESCALATED: "This case has been escalated for further review.",
      PENDING: "Review remains pending.",
    };
    setDecisionMessage(messages[status]);
  };

  const handleSaveReview = () => {
    setSaveMessage("Officer review saved successfully.");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* ------------------------------------------------------ */}
          {/* PAGE HEADER                                               */}
          {/* ------------------------------------------------------ */}
          <div className="mb-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Officer Review</h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                  Final procurement officer review of bidder compliance findings.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <RiskPill risk={CONTEXT.overallRisk} />
                <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold tracking-wide text-amber-700">
                  {CONTEXT.status}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-white p-3.5">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Bidder</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{CONTEXT.bidderName}</p>
                <p className="text-xs text-slate-500">{CONTEXT.bidderId}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3.5">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Tender</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{CONTEXT.tenderId}</p>
                <p className="text-xs text-slate-500">{CONTEXT.tenderName}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3.5">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Compliance Score
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {CONTEXT.complianceScore} / 100
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3.5">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Overall Risk
                </p>
                <div className="mt-1">
                  <RiskPill risk={CONTEXT.overallRisk} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* -------------------------------------------------------- */}
            {/* REVIEW SUMMARY CARD                                         */}
            {/* -------------------------------------------------------- */}
            <SectionCard id="summary" title="Review Summary" icon={ClipboardCheck}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                  <p className="text-lg font-semibold text-slate-900">{SUMMARY.submitted}</p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Submitted
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
                  <p className="text-lg font-semibold text-emerald-700">{SUMMARY.verified}</p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600">
                    Verified
                  </p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
                  <p className="text-lg font-semibold text-amber-700">{SUMMARY.needsReview}</p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-amber-600">
                    Needs Review
                  </p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
                  <p className="text-lg font-semibold text-red-700">{SUMMARY.mismatches}</p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-red-600">
                    Mismatches
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                  <RiskPill risk={SUMMARY.overallRisk} />
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Overall Risk
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3.5 py-2.5">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                <p className="text-xs font-medium leading-relaxed text-blue-800">
                  Final qualification/disqualification remains with the Procurement Officer.
                </p>
              </div>
            </SectionCard>

            {/* -------------------------------------------------------- */}
            {/* KEY FINDING / CRITICAL EXCEPTION                            */}
            {/* -------------------------------------------------------- */}
            <SectionCard
              id="key-finding"
              title={`${KEY_FINDING.check} Mismatch`}
              icon={AlertTriangle}
              className="border-red-200"
            >
              <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Declared
                  </p>
                  <p className="mt-1.5 text-base font-semibold text-slate-900">
                    {KEY_FINDING.declared}
                  </p>
                </div>
                <div className="flex items-center justify-center py-1 sm:py-0">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600">
                    <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-red-600">
                    Verified / Extracted
                  </p>
                  <p className="mt-1.5 text-base font-semibold text-red-800">
                    {KEY_FINDING.verified}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StatusBadge status={KEY_FINDING.status} />
                <RiskPill risk={KEY_FINDING.severity} />
                <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
                  Confidence: {KEY_FINDING.confidence}%
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                {KEY_FINDING.explanation}
              </p>
            </SectionCard>

            {/* -------------------------------------------------------- */}
            {/* EVIDENCE / VERIFICATION FINDINGS                            */}
            {/* -------------------------------------------------------- */}
            <SectionCard
              id="findings"
              title="Evidence / Verification Findings"
              icon={FileText}
            >
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
                {FINDINGS.map((item) => (
                  <li
                    key={item.name}
                    className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.explanation}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </li>
                ))}
              </ul>
            </SectionCard>

            {/* -------------------------------------------------------- */}
            {/* AI RECOMMENDATION                                           */}
            {/* -------------------------------------------------------- */}
            <SectionCard
              id="ai-recommendation"
              title="AI Recommendation — Advisory Only"
              icon={Sparkles}
              className="border-indigo-200"
            >
              <p className="text-sm leading-relaxed text-slate-700">{AI_RECOMMENDATION}</p>
              <div className="mt-4 flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                <p className="text-xs leading-relaxed text-slate-600">
                  AI recommendations do not constitute the final procurement decision.
                </p>
              </div>
            </SectionCard>

            {/* -------------------------------------------------------- */}
            {/* OFFICER DECISION SECTION                                    */}
            {/* -------------------------------------------------------- */}
            <SectionCard id="officer-decision" title="Officer Decision" icon={ShieldCheck}>
              <div className="mb-4 flex items-center gap-3">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Current status:
                </span>
                <DecisionBadge status={decisionStatus} />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => handleDecision("RESOLVED")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:w-auto"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Resolve
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision("ESCALATED")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 sm:w-auto"
                >
                  <Flag className="h-4 w-4" aria-hidden="true" />
                  Escalate
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision("PENDING")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:w-auto"
                >
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                  Keep Pending
                </button>
              </div>

              {decisionMessage ? (
                <div
                  role="status"
                  className="mt-4 flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3.5 py-2.5"
                >
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <p className="text-xs leading-relaxed text-blue-800">{decisionMessage}</p>
                </div>
              ) : null}
            </SectionCard>

            {/* -------------------------------------------------------- */}
            {/* OFFICER COMMENTS                                            */}
            {/* -------------------------------------------------------- */}
            <SectionCard id="officer-comments" title="Officer Comments" icon={FileText}>
              <label htmlFor="officer-comments" className="sr-only">
                Officer Comments
              </label>
              <textarea
                id="officer-comments"
                rows={4}
                value={officerComments}
                onChange={(e) => setOfficerComments(e.target.value)}
                placeholder="Enter review comments, justification, or additional observations..."
                className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleSaveReview}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:w-auto"
                >
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Save Review
                </button>
                {saveMessage ? (
                  <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {saveMessage}
                  </p>
                ) : null}
              </div>
            </SectionCard>

            {/* -------------------------------------------------------- */}
            {/* AUDIT INFORMATION                                           */}
            {/* -------------------------------------------------------- */}
            <SectionCard id="audit" title="Audit Information" icon={History}>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-5">
                <div>
                  <p className="text-xs text-slate-500">Review Status</p>
                  <div className="mt-1">
                    <DecisionBadge status={decisionStatus} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Reviewed By</p>
                  <p className="mt-1 font-medium text-slate-800">Procurement Officer</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Review Date</p>
                  <p className="mt-1 font-medium text-slate-800">{REVIEW_DATE}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Decision Source</p>
                  <p className="mt-1 font-medium text-slate-800">Human Officer</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">AI Assistance</p>
                  <p className="mt-1 font-medium text-slate-800">Advisory only</p>
                </div>
              </div>
            </SectionCard>

            {/* -------------------------------------------------------- */}
            {/* NAVIGATION BUTTONS                                          */}
            {/* -------------------------------------------------------- */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/declared-verified")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to Declared vs Verified
              </button>
              <button
                type="button"
                onClick={() => navigate("/audit-trail")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:w-auto"
              >
                <History className="h-4 w-4" aria-hidden="true" />
                View Audit Trail
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
