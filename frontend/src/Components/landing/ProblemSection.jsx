import { useEffect, useRef, useState } from "react";
import {
  Network,
  FileSearch,
  ScanText,
  ClipboardCheck,
  Gauge,
  History,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock3,
  ArrowRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Scroll-reveal hook — single IntersectionObserver, staggered by index */
/* ------------------------------------------------------------------ */
function useRevealed(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

/* ------------------------------------------------------------------ */
/* Shared card shell                                                   */
/* ------------------------------------------------------------------ */
function FeatureCard({ index, className = "", children }) {
  const [ref, visible] = useRevealed();

  return (
    <div
      ref={ref}
      className={`group relative rounded-3xl border border-slate-200 bg-white p-7 sm:p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.12)] transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(15,23,42,0.06),0_24px_48px_-20px_rgba(15,23,42,0.18)] ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: visible ? `${index * 90}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

function IconBadge({ icon: Icon, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-900 text-white",
    accent: "bg-blue-600 text-white",
  };
  return (
    <div
      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]} transition-transform duration-500 ease-out group-hover:-rotate-3 group-hover:scale-105`}
    >
      <Icon size={20} strokeWidth={1.75} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card 1 — Multi-Portal Verification                                  */
/* ------------------------------------------------------------------ */
function MultiPortalCard({ index }) {
  const sources = [
    "GST",
    "PAN",
    "Udyam / MSME",
    "EPFO",
    "ESIC",
    "Startup India",
    "NSIC",
    "OEM Authorization",
  ];

  return (
    <FeatureCard index={index} className="lg:col-span-7">
      <IconBadge icon={Network} tone="accent" />
      <h3 className="mt-5 text-xl font-semibold text-slate-900">
        Multi-portal verification
      </h3>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-slate-600">
        Every registration a bidder claims is checked against its source —
        pulled together in one place instead of eight open tabs.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {sources.map((s) => (
          <span
            key={s}
            className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-600 transition-colors duration-300 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-700"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900">
          <CheckCircle2 size={16} className="text-white" strokeWidth={2} />
        </div>
        <p className="text-sm text-slate-700">
          Converges into a single{" "}
          <span className="font-semibold text-slate-900">
            Bid Compliance
          </span>{" "}
          verification layer
        </p>
      </div>
    </FeatureCard>
  );
}

/* ------------------------------------------------------------------ */
/* Card 2 — AI Document Intelligence                                   */
/* ------------------------------------------------------------------ */
function DocumentIntelligenceCard({ index }) {
  const stages = ["Document", "Extracting", "Matching"];
  const outcomes = [
    { label: "Verified", icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { label: "Warning", icon: AlertTriangle, tone: "text-amber-600 bg-amber-50 border-amber-200" },
    { label: "Missing", icon: XCircle, tone: "text-rose-600 bg-rose-50 border-rose-200" },
  ];

  return (
    <FeatureCard index={index} className="lg:col-span-5">
      <IconBadge icon={FileSearch} />
      <h3 className="mt-5 text-xl font-semibold text-slate-900">
        AI document intelligence
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
        Reads every uploaded document, extracts what matters, and flags
        what doesn't line up — missing fields, expired dates, mismatched
        details.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
        {stages.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
              {s}
            </span>
            {i < stages.length - 1 && (
              <ArrowRight size={13} className="text-slate-300" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {outcomes.map(({ label, icon: Icon, tone }) => (
          <div
            key={label}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 ${tone}`}
          >
            <Icon size={16} strokeWidth={2} />
            <span className="text-[11px] font-semibold">{label}</span>
          </div>
        ))}
      </div>
    </FeatureCard>
  );
}

/* ------------------------------------------------------------------ */
/* Card 3 — Tender-Specific Compliance Engine                          */
/* ------------------------------------------------------------------ */
function ComplianceEngineCard({ index }) {
  const requirements = [
    { label: "Turnover certificate", status: "Mandatory", tone: "bg-slate-900" },
    { label: "OEM authorization", status: "Optional", tone: "bg-slate-400" },
    { label: "Past performance", status: "Failed", tone: "bg-rose-500" },
    { label: "MSE certificate", status: "Pending", tone: "bg-amber-500" },
  ];

  return (
    <FeatureCard index={index} className="lg:col-span-4">
      <IconBadge icon={ClipboardCheck} />
      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        Tender-specific compliance
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
        Maps each tender's actual requirements against a bidder's
        documents and verified data.
      </p>

      <div className="mt-6 space-y-2.5">
        {requirements.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5"
          >
            <span className="truncate text-sm text-slate-700">
              {r.label}
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className={`h-1.5 w-1.5 rounded-full ${r.tone}`} />
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </FeatureCard>
  );
}

/* ------------------------------------------------------------------ */
/* Card 4 — Risk & Compliance Scoring                                  */
/* ------------------------------------------------------------------ */
function RiskScoringCard({ index }) {
  const score = 82;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <FeatureCard index={index} className="lg:col-span-4">
      <IconBadge icon={Gauge} />
      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        Risk &amp; compliance scoring
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
        A single score and risk level, with a plain-language reason
        behind it.
      </p>

      <div className="mt-6 flex items-center gap-5">
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#2563eb"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold text-slate-900">
              {score}
            </span>
            <span className="text-[10px] text-slate-400">/ 100</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Low risk
          </span>
          <p className="text-xs leading-relaxed text-slate-500">
            All mandatory documents verified; one optional item pending.
          </p>
        </div>
      </div>
    </FeatureCard>
  );
}

/* ------------------------------------------------------------------ */
/* Card 5 — Audit Trail                                                 */
/* ------------------------------------------------------------------ */
function AuditTrailCard({ index }) {
  const entries = [
    { doc: "GST Certificate", source: "GSTN", result: "Verified", time: "09:14" },
    { doc: "PAN Card", source: "Income Tax", result: "Verified", time: "09:15" },
    { doc: "Udyam Registration", source: "Udyam Portal", result: "Mismatch", time: "09:17" },
  ];

  return (
    <FeatureCard index={index} className="lg:col-span-4">
      <IconBadge icon={History} />
      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        Audit trail
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
        Every check, timestamped and traceable — a transparent record of
        how a verdict was reached.
      </p>

      <div className="mt-6 space-y-0">
        {entries.map((e, i) => (
          <div key={e.doc} className="relative flex gap-3 pb-5 last:pb-0">
            <div className="flex flex-col items-center">
              <span
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                  e.result === "Verified" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {i < entries.length - 1 && (
                <span className="mt-1 w-px flex-1 bg-slate-200" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-slate-800">
                  {e.doc}
                </p>
                <span className="flex shrink-0 items-center gap-1 text-[11px] text-slate-400">
                  <Clock3 size={11} />
                  {e.time}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {e.source} · {e.result}
              </p>
            </div>
          </div>
        ))}
      </div>
    </FeatureCard>
  );
}

/* ------------------------------------------------------------------ */
/* Card 6 — Officer Decision Support (full-width banner)               */
/* ------------------------------------------------------------------ */
function DecisionSupportCard({ index }) {
  return (
    <FeatureCard index={index} className="lg:col-span-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <IconBadge icon={UserCheck} tone="accent" />
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Officer decision support
            </h3>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-slate-600">
              The platform explains its findings and recommends a course of
              action in plain language — the procurement officer decides.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 lg:min-w-[320px]">
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
              AI recommendation
            </span>
            <p className="mt-2 text-sm font-medium text-slate-800">
              Final decision remains with the procurement officer.
            </p>
          </div>
        </div>
      </div>
    </FeatureCard>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                              */
/* ------------------------------------------------------------------ */
export default function Features() {
  const [headerRef, headerVisible] = useRevealed(0.3);

  return (
    <section
      id="features"
      className="relative bg-white px-6 py-24 sm:py-28 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div
          ref={headerRef}
          className={`max-w-2xl transition-all duration-700 ease-out ${
            headerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
            Intelligent bid verification
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Everything needed to verify a bidder.
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-slate-600">
            Fragmented verification checks, document analysis, tender
            requirements and risk assessment — brought into one intelligent
            workspace.
          </p>
        </div>

        {/* Bento grid */}
        <div className="mt-14 grid grid-cols-1 gap-5 sm:mt-16 lg:grid-cols-12">
          <MultiPortalCard index={0} />
          <DocumentIntelligenceCard index={1} />
          <ComplianceEngineCard index={2} />
          <RiskScoringCard index={3} />
          <AuditTrailCard index={4} />
          <DecisionSupportCard index={5} />
        </div>
      </div>
    </section>
  );
}
