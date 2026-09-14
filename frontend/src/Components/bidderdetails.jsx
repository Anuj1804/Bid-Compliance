import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Circle,
  FileCheck2,
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
  FileWarning,
  Activity,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* SHARED STYLE HELPERS                                                */
/* ------------------------------------------------------------------ */

const STATUS_STYLES = {
  VERIFIED: {
    icon: CheckCircle2,
    label: "VERIFIED",
    classes: "bg-emerald-950/60 text-emerald-300 border-emerald-800/70", // Green
  },
  VALIDATED: {
    icon: BadgeCheck,
    label: "VALIDATED",
    classes: "bg-yellow-950/60 text-yellow-300 border-yellow-800/70", // Yellow
  },
  SIMULATED: {
    icon: Circle,
    label: "SIMULATED",
    classes: "bg-orange-950/60 text-orange-300 border-orange-800/70", // Orange
  },
  MISMATCH: {
    icon: AlertTriangle,
    label: "MISMATCH",
    classes: "bg-red-950/60 text-red-300 border-red-800/70", // Red
  },
  RESOLVED: {
    icon: CheckCircle2,
    label: "RESOLVED BY OFFICER",
    classes: "bg-emerald-950/60 text-emerald-300 border-emerald-800/70", // Green
  },
};

const RISK_STYLES = {
  LOW: "bg-slate-800 text-slate-300 border-slate-700",
  MEDIUM: "bg-amber-950/50 text-amber-300 border-amber-800/60",
  HIGH: "bg-red-950/50 text-red-300 border-red-800/60",
};

function StatusBadge({ status, size = "sm" }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.SIMULATED;
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
  const safeRisk = risk || "LOW";
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide ${RISK_STYLES[safeRisk]}`}
    >
      {safeRisk} RISK
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
      className={`transition-all duration-500 ease-out motion-reduce:transition-none motion-reduce:transform-none ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
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
  const { tenderId, bidderId } = useParams();
  const [bidderData, setBidderData] = useState(null);
  const [loadingBidder, setLoadingBidder] = useState(true);
  const [scoreWidth, setScoreWidth] = useState(0);

  useEffect(() => {
    if (!bidderId) return;
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8000/api/bidders/${bidderId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        setBidderData(data);
        setLoadingBidder(false);
        const score = data?.latest_verification?.compliance_score ?? 0;
        setTimeout(() => setScoreWidth(score), 150);
      })
      .catch(() => setLoadingBidder(false));
  }, [bidderId]);

  // Derived state calculations
    // Derived state calculations
    // Derived state calculations
  const rawChecks = bidderData?.latest_verification?.checks;
  const realChecks = Array.isArray(rawChecks) ? rawChecks.filter(c => typeof c === 'object' && c !== null) : [];
  const realFlags = Array.isArray(bidderData?.flags) ? bidderData.flags : [];
  const score = bidderData?.latest_verification?.compliance_score || 0;
  
  let risk = bidderData?.latest_verification?.risk_level || "LOW";
  if (risk === "MANUAL_REVIEW_NEEDED") risk = "HIGH";
  
  const docsSubmitted = bidderData?.documents?.length || 0;
  // Logic to cross-reference checks with resolved flags
  const getDisplayStatus = (check) => {
    // Agar issue/flag tha, toh check karo officer ne resolve kiya ya nahi
    if (check.flag) {
      const relatedFlag = realFlags.find((f) => f.check_type === check.check);
      if (relatedFlag && relatedFlag.status === "resolved") {
        return "RESOLVED";
      }
      return "MISMATCH"; // Agar resolve nahi hua toh RED (Mismatch)
    }

    // YAHAN FIX HAI: Agar koi error/flag nahi hai, toh sabko "VERIFIED" banne ke 
    // bajaye backend ka asli status dikhao (jo VALIDATED ya SIMULATED ho sakta hai)
    return check.status || "VERIFIED";
  };

  const activeMismatches = realChecks.filter((c) => getDisplayStatus(c) === "MISMATCH");
  const hasActiveFlags = activeMismatches.length > 0;
  const verifiedCount = realChecks.filter((c) => getDisplayStatus(c) !== "MISMATCH").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {loadingBidder && (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-slate-400 text-sm animate-pulse">Loading bidder data...</p>
        </div>
      )}

      {!loadingBidder && bidderData && (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* HEADER */}
          <div className="mb-6">
            <button
              onClick={() => navigate(`/tenders/${tenderId}/bidders`)}
              className="group inline-flex items-center gap-2 rounded-md text-sm font-medium text-slate-400 transition-colors hover:text-slate-100"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Back to Bidders
            </button>

            <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <h1 className="text-xl font-semibold text-white sm:text-2xl">Bidder Details</h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-400">
                  Review bidder identity, statutory compliance, verification evidence, and risk indicators.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-emerald-800/60 bg-emerald-950/50 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-300">
                <Circle className="h-3 w-3 shrink-0" aria-hidden="true" />
                LIVE DATA
              </span>
            </div>
          </div>

          <Reveal>
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm sm:p-6 mb-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-indigo-400">
                    <Building2 className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-white sm:text-xl">
                      {bidderData.company_name}
                    </h2>
                    <p className="mt-0.5 text-sm text-slate-400">
                      {"BID-" + bidderId} &middot; GSTIN {bidderData.declared_gstin || "Not provided"}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      <span className="text-slate-500">Tender:</span> {tenderId}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:flex lg:gap-8">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Docs Submitted</span>
                    <span className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-white">
                      <FileCheck2 className="h-4 w-4 text-emerald-400" />
                      {docsSubmitted}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Checks Passed
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-white">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      {verifiedCount} / {realChecks.length}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Active Flags</span>
                    <span className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-white">
                      <AlertTriangle className={`h-4 w-4 ${hasActiveFlags ? 'text-red-400' : 'text-slate-400'}`} />
                      {activeMismatches.length}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          {/* AI RISK ASSESSMENT */}
          {realChecks.length > 0 && (
            <Reveal className="mb-8">
              <SectionHeading title="AI Risk Assessment" icon={ScanEye} description="Decision-support summary generated from available verification results." />
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                <div className="flex flex-col border-b border-slate-800 sm:flex-row">
                  <div className="flex flex-1 flex-col justify-center border-b border-slate-800 p-6 sm:border-b-0 sm:border-r">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Risk Level</p>
                    <div className="mt-2"><RiskPill risk={risk} /></div>
                  </div>
                  <div className="flex flex-1 flex-col justify-center border-b border-slate-800 p-6 sm:border-b-0 sm:border-r">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Compliance Score</p>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold text-white">{score}</span>
                      <span className="text-sm font-medium text-slate-500">/ 100</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm leading-relaxed text-slate-300">
                    {bidderData.latest_verification?.recommendation || "System analyzed documents. Refer to individual flags for details."}
                  </p>
                </div>
              </div>
            </Reveal>
          )}

          {/* WHAT NEEDS ATTENTION */}
          <Reveal className="mb-8">
            <SectionHeading title="What Needs Attention" icon={ShieldAlert} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeMismatches.length === 0 ? (
                <div className="col-span-full rounded-xl border border-emerald-800/30 bg-emerald-950/20 p-6 flex items-center justify-center">
                  <p className="text-emerald-400 font-medium">No active compliance flags. All issues resolved or verified.</p>
                </div>
              ) : (
                activeMismatches.map((check, idx) => (
                  <div key={idx} className="flex flex-col justify-between rounded-xl border border-red-800/40 bg-red-950/20 p-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <StatusBadge status="MISMATCH" />
                      </div>
                      <h3 className="mt-3 text-sm font-semibold text-slate-200">{check.check}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{check.reason}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {hasActiveFlags && (
              <div className="mt-4 flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-semibold text-white">Officer Review Required</h3>
                  <p className="mt-1 text-sm text-slate-400">Review the flagged checks before making a procurement decision.</p>
                </div>
                <button
                  onClick={() => navigate(`/officer-review/${bidderId}`)}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
                >
                  Open Review
                </button>
              </div>
            )}
          </Reveal>

          {/* COMPLIANCE VERIFICATION TABLE */}
          <Reveal className="mb-8">
            <SectionHeading title="Compliance Verification" icon={ClipboardList} description="Verification results across statutory requirements." />
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3 whitespace-nowrap">Check</th>
                    <th className="px-5 py-3 whitespace-nowrap">Status</th>
                    <th className="px-5 py-3 w-1/2">Reason / Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {realChecks.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-5 py-8 text-center text-slate-400">
                        No verification has been run yet. Please upload documents.
                      </td>
                    </tr>
                  ) : (
                    realChecks.map((check, idx) => {
                      const displayStatus = getDisplayStatus(check);
                      return (
                        <tr key={idx} className="transition-colors hover:bg-slate-800/30">
                          <td className="px-5 py-4 font-medium text-slate-200">{check.check}</td>
                          <td className="px-5 py-4"><StatusBadge status={displayStatus} /></td>
                          <td className="px-5 py-4 text-slate-400">{check.reason || "Matches expected values"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Reveal>

          {/* DETECTED INCONSISTENCY BOX (Only shows if open flags exist) */}
          {activeMismatches.map((mismatch, idx) => (
            <Reveal key={`mismatch-${idx}`} className="mb-8">
              <div className="rounded-xl border border-red-900/50 bg-red-950/10 p-5 sm:p-6">
                <div className="mb-5 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h3 className="text-base font-semibold text-red-400">Detected Inconsistency: {mismatch.check}</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">AI Reasoning</p>
                    <p className="mt-2 text-sm font-medium text-slate-200">{mismatch.reason}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}

          {/* DOCUMENT UPLOAD LAUNCHER */}
          <Reveal>
            <div className="mt-8 flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 sm:flex-row sm:items-center sm:justify-between">
              
              {/* Audit & Verification Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate(`/tenders/${tenderId}/bidders/${bidderId}/verify`)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-all"
                >
                  <Activity className="h-4 w-4" />
                  Re-Run AI Verification
                </button>
                
                {/* Audit Trail Button */}
                <button
                  onClick={() => navigate(`/tenders/${tenderId}/audit-trail/${bidderId}`)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-all"
                >
                  <ClipboardList className="h-4 w-4" />
                  View Audit Trail
                </button>
              </div>
              {/* Dedicated Officer Review Page Button */}
              <button
                onClick={() => navigate(`/officer-review/${bidderId}`)} 
                className="group inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/20 active:scale-[0.98]"
              >
                Proceed to Officer Review
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </Reveal>

        </div>
      )}
    </div>
  );
}