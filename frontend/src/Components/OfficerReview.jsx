import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardSidebar from "./dashboard/DashboardSidebar";
import {
  AlertTriangle,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Info,
  Sparkles,
  ClipboardCheck,
  XCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* STYLE HELPERS                                                      */
/* ------------------------------------------------------------------ */

const RISK_STYLES = {
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HIGH: "bg-red-50 text-red-700 border-red-200",
};

function RiskPill({ risk }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide ${
        RISK_STYLES[risk] || RISK_STYLES.LOW
      }`}
    >
      {risk || "UNKNOWN"} RISK
    </span>
  );
}

function SectionCard({ title, description, icon: Icon, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}>
      <div className="mb-4 flex items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600">
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
        ) : null}
        <div>
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h2>
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
  const safeScore = score || 0;
  const offset = circumference - (safeScore / 100) * circumference;
  const color = safeScore >= 80 ? "#10b981" : safeScore >= 50 ? "#f59e0b" : "#dc2626";

  return (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
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
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-semibold text-slate-900">{safeScore}</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">/ 100</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export default function OfficerReview() {
  const { bidderId } = useParams();
  const navigate = useNavigate();
  
  const [bidderData, setBidderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [officerNote, setOfficerNote] = useState("");
  const [noteWarning, setNoteWarning] = useState(false);
  const [decisionSubmitted, setDecisionSubmitted] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolvingFlagId, setResolvingFlagId] = useState(null);
  const [flagNote, setFlagNote] = useState("");

  // Fetch real data from backend WITH TOKEN
  useEffect(() => {
    if (!bidderId) return;
    setIsLoading(true);
    const token = localStorage.getItem("token");
    
    fetch(`http://localhost:8000/api/bidders/${bidderId}`, {
      headers: {
        "Authorization": token ? `Bearer ${token}` : ""
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch bidder data");
        return res.json();
      })
      .then((data) => {
        setBidderData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [bidderId]);

  const handleDecision = (decision) => {
    if (officerNote.trim().length === 0) {
      setNoteWarning(true);
      return;
    }
    setNoteWarning(false);
    setIsSubmitting(true);

    const token = localStorage.getItem("token");

    // Call the new backend decision API WITH TOKEN
    fetch(`http://localhost:8000/api/bidders/${bidderId}/decision`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify({ decision, note: officerNote }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to submit decision");
        return res.json();
      })
      .then(() => {
        setDecisionSubmitted(decision);
        setIsSubmitting(false);
      })
      .catch((err) => {
        console.error(err);
        setIsSubmitting(false);
      });
  };

  const handleOverrideFlag = (flagId) => {
    if (!flagNote.trim()) return;
    setIsSubmitting(true);

    const token = localStorage.getItem("token");

    fetch(`http://localhost:8000/api/flags/${flagId}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify({ status: "resolved", officer_note: flagNote }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to resolve flag");
        return res.json();
      })
      .then((updatedFlag) => {
        // Update local state so it disappears from open flags
        setBidderData(prev => ({
          ...prev,
          flags: prev.flags.map(f => f.id === flagId ? updatedFlag : f)
        }));
        setResolvingFlagId(null);
        setFlagNote("");
        setIsSubmitting(false);
      })
      .catch((err) => {
        console.error(err);
        setIsSubmitting(false);
      });
  };

  // ------------------------------------------------------------------
  // LAYOUT RENDER (WITH SIDEBAR)
  // ------------------------------------------------------------------
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      
      {/* 1. Dashboard Sidebar Added Here */}
      <DashboardSidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-slate-500 font-medium">Loading bidder data...</p>
          </div>
        ) : !bidderData || !bidderData.id ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-red-500 font-medium">Failed to load bidder data. Ensure you are logged in.</p>
          </div>
        ) : (
          <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            
            {/* HEADER */}
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Dashboard / Bidders / {bidderData.company_name} / Final Review
                </p>
                <h1 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">Officer Final Decision</h1>
                <p className="mt-1 text-sm text-slate-500">Review system findings and make a qualification decision.</p>
              </div>
              <button 
                onClick={() => navigate(-1)} 
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Back to Details
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {/* BIDDER IDENTITY CARD */}
              <SectionCard title="Bidder Profile" icon={FileText}>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{bidderData.company_name}</h3>
                    <p className="text-sm font-medium text-slate-500">Internal ID: {bidderData.id}</p>
                    <div className="mt-3 space-y-1 text-sm text-slate-700">
                      <p><span className="font-medium text-slate-500">Declared GSTIN:</span> {bidderData.declared_gstin || "N/A"}</p>
                      <p><span className="font-medium text-slate-500">Declared PAN:</span> {bidderData.declared_pan || "N/A"}</p>
                      <p><span className="font-medium text-slate-500">Tender Ref:</span> ID #{bidderData.tender_id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <ScoreRing score={bidderData.latest_verification?.compliance_score} />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Overall System Score</p>
                      <div className="mt-1"><RiskPill risk={bidderData.latest_verification?.risk_level} /></div>
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600">
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> Requires Officer Verdict
                      </p>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* SYSTEM DECISION SUPPORT - ACTIVE FLAGS */}
              <SectionCard 
                title="System Decision Support (Active Issues)" 
                description="The following issues were flagged by the compliance engine and require your attention."
                icon={Sparkles}
                className={(bidderData.flags || []).filter((f) => f.status === "open").length > 0 ? "border-amber-200" : "border-emerald-200"}
              >
                {(bidderData.flags || []).filter((f) => f.status === "open").length === 0 ? (
                  <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-4 py-3 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="text-sm font-medium">No open issues found. Bidder documents match declared values.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(bidderData.flags || []).filter((f) => f.status === "open").map((flag) => (
                      <div key={flag.id} className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-semibold text-amber-900">{flag.check_type}</h4>
                            <p className="mt-1 text-sm text-amber-800">{flag.reason}</p>
                            <div className="mt-2 flex gap-2">
                              <span className="inline-flex rounded-md border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                                {flag.severity} RISK
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2 sm:mt-0 flex flex-col items-end shrink-0">
                          {resolvingFlagId === flag.id ? (
                            <div className="flex flex-col gap-2 w-full sm:w-64">
                              <input
                                type="text"
                                value={flagNote}
                                onChange={(e) => setFlagNote(e.target.value)}
                                placeholder="Reason to override..."
                                className="w-full rounded-md border border-amber-300 px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                              />
                              <div className="flex gap-2 justify-end">
                                <button 
                                  onClick={() => setResolvingFlagId(null)}
                                  className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => handleOverrideFlag(flag.id)}
                                  disabled={!flagNote.trim() || isSubmitting}
                                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                                >
                                  Confirm
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setResolvingFlagId(flag.id);
                                setFlagNote("");
                              }}
                              className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 shadow-sm hover:bg-amber-100"
                            >
                              Override System (Accept)
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <p className="text-xs leading-relaxed text-slate-600">
                    System findings are advisory only. The Procurement Officer retains full authority for the final qualification decision.
                  </p>
                </div>
              </SectionCard>

              {/* FINAL DECISION PANEL */}
              <SectionCard title="Final Officer Action" icon={ClipboardCheck}>
                
                {decisionSubmitted ? (
                   <div className={`flex flex-col items-center justify-center p-6 text-center rounded-lg border ${decisionSubmitted === 'APPROVED' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                     {decisionSubmitted === 'APPROVED' ? (
                       <CheckCircle2 className="h-10 w-10 text-emerald-600 mb-2" />
                     ) : (
                       <XCircle className="h-10 w-10 text-red-600 mb-2" />
                     )}
                     <h3 className={`text-lg font-bold ${decisionSubmitted === 'APPROVED' ? 'text-emerald-800' : 'text-red-800'}`}>
                       Bidder {decisionSubmitted}
                     </h3>
                     <p className={`mt-1 text-sm ${decisionSubmitted === 'APPROVED' ? 'text-emerald-700' : 'text-red-700'}`}>
                       Your decision has been permanently logged in the audit trail.
                     </p>
                   </div>
                ) : (
                  <>
                    <label htmlFor="officer-note" className="block text-sm font-medium text-slate-700">
                      Officer Justification Note (Required)
                    </label>
                    <textarea
                      id="officer-note"
                      rows={4}
                      value={officerNote}
                      onChange={(e) => {
                        setOfficerNote(e.target.value);
                        if (e.target.value.trim().length > 0) setNoteWarning(false);
                      }}
                      placeholder="State the reason for approving or rejecting this bidder..."
                      className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />

                    {noteWarning ? (
                      <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-2.5">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <p className="text-xs leading-relaxed text-amber-800">
                          You must provide a justification note before submitting a final decision.
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-6 flex flex-col gap-3 pt-4 border-t border-slate-100">
                      
                      {!bidderData.latest_verification && (
                        <div className="mb-2 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                          <p className="text-xs font-semibold leading-relaxed text-red-800">
                            System Lock: You cannot approve or reject this bidder because the system verification has not been run yet. Please run the verification from the Bidder Details page first.
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          disabled={isSubmitting || !bidderData.latest_verification}
                          onClick={() => handleDecision("APPROVED")}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-500 disabled:opacity-50 sm:w-auto disabled:cursor-not-allowed"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                          Approve & Qualify
                        </button>
                      <button
                        type="button"
                        disabled={isSubmitting || !bidderData.latest_verification}
                        onClick={() => handleDecision("REJECTED")}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-red-500 disabled:opacity-50 sm:w-auto disabled:cursor-not-allowed"
                      >
                        <XCircle className="h-5 w-5" />
                        Disqualify Bidder
                      </button>
                      </div>
                    </div>
                  </>
                )}
              </SectionCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}