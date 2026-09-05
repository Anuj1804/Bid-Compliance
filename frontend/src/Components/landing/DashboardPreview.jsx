import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Circle,
  Clock3,
  Sparkles,
  UserCheck,
  Building2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Scroll-reveal hook — fires once, used to sequence the whole preview */
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
      { threshold, rootMargin: "0px 0px -80px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

/* ------------------------------------------------------------------ */
/* Count-up hook for the compliance score                              */
/* ------------------------------------------------------------------ */
function useCountUp(target, active, duration = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return value;
}

/* ------------------------------------------------------------------ */
/* Small shared bits                                                   */
/* ------------------------------------------------------------------ */
function Reveal({ visible, delay = 0, className = "", children }) {
  return (
    <div
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

const statusStyles = {
  verified: {
    icon: CheckCircle2,
    label: "Verified",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  mismatch: {
    icon: AlertTriangle,
    label: "Mismatch",
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  pending: {
    icon: Circle,
    label: "Pending",
    text: "text-slate-500",
    bg: "bg-slate-50",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    text: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
};

function StatusBadge({ status }) {
  const s = statusStyles[status];
  const Icon = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${s.text} ${s.bg} ${s.border}`}
    >
      <Icon size={12} strokeWidth={2.5} />
      {s.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */
const verificationSources = [
  { name: "GST", status: "verified" },
  { name: "PAN", status: "verified" },
  { name: "Udyam / MSME", status: "mismatch" },
  { name: "EPFO", status: "verified" },
  { name: "ESIC", status: "verified" },
  { name: "OEM Authorization", status: "verified" },
];

const requirements = [
  { label: "GST Registration", status: "verified" },
  { label: "PAN", status: "verified" },
  { label: "Udyam Certificate", status: "mismatch" },
  { label: "OEM Authorization", status: "verified" },
  { label: "MSE Certificate", status: "pending" },
  { label: "Past Performance", status: "failed" },
];

const activity = [
  { time: "09:14", doc: "GST Certificate", status: "verified" },
  { time: "09:15", doc: "PAN", status: "verified" },
  { time: "09:17", doc: "Udyam Registration", status: "mismatch" },
  { time: "09:19", doc: "OEM Authorization", status: "verified" },
];

const findings = [
  {
    text: "Udyam registration details differ from submitted document.",
    tone: "mismatch",
  },
  {
    text: "MSE certificate verification is pending.",
    tone: "pending",
  },
];

/* ------------------------------------------------------------------ */
/* Section                                                              */
/* ------------------------------------------------------------------ */
export default function DashboardPreview() {
  const [headerRef, headerVisible] = useRevealed(0.3);
  const [dashRef, dashVisible] = useRevealed(0.1);
  const score = useCountUp(82, dashVisible);

  return (
    <section
      id="dashboard-preview"
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
            Compliance intelligence
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            See compliance intelligence in action.
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-slate-600">
            One workspace for bidder verification, compliance status, risk
            analysis and transparent decision support.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div
          ref={dashRef}
          className={`mt-14 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_32px_64px_-24px_rgba(15,23,42,0.18)] transition-all duration-700 ease-out sm:mt-16 ${
            dashVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          {/* Dashboard header bar */}
          <div className="flex flex-col gap-5 border-b border-slate-800/10 bg-slate-900 px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck size={15} strokeWidth={2} />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Compliance Dashboard
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1.5">
                <div className="flex items-center gap-1.5 text-sm text-slate-300">
                  <span className="text-slate-500">Tender</span>
                  <span className="font-medium text-white">
                    GEM/2026/PROC/1042
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-300">
                  <Building2 size={13} className="text-slate-500" />
                  <span className="font-medium text-white">
                    ABC Technologies Pvt. Ltd.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Overall compliance
                </p>
                <p className="mt-0.5 text-2xl font-semibold text-white">
                  {score}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    / 100
                  </span>
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Low risk
              </span>
            </div>
          </div>

          {/* Dashboard body */}
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Main column */}
            <div className="space-y-8 border-b border-slate-200 p-6 sm:p-8 lg:col-span-2 lg:border-b-0 lg:border-r">
              {/* Verification overview */}
              <Reveal visible={dashVisible} delay={150}>
                <h3 className="text-sm font-semibold text-slate-900">
                  Verification overview
                </h3>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {verificationSources.map((s, i) => {
                    const st = statusStyles[s.status];
                    const Icon = st.icon;
                    return (
                      <div
                        key={s.name}
                        className={`rounded-2xl border p-3.5 transition-all duration-500 ease-out ${
                          dashVisible
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-3"
                        } ${st.border} ${st.bg}`}
                        style={{
                          transitionDelay: dashVisible
                            ? `${250 + i * 60}ms`
                            : "0ms",
                        }}
                      >
                        <Icon size={16} className={st.text} strokeWidth={2.25} />
                        <p className="mt-2 text-xs font-medium text-slate-700">
                          {s.name}
                        </p>
                        <p className={`mt-0.5 text-[11px] font-semibold ${st.text}`}>
                          {st.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Reveal>

              {/* Compliance requirements */}
              <Reveal visible={dashVisible} delay={400}>
                <h3 className="text-sm font-semibold text-slate-900">
                  Mandatory requirements
                </h3>
                <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
                  {requirements.map((r) => (
                    <div
                      key={r.label}
                      className="flex items-center justify-between gap-3 bg-white px-4 py-3"
                    >
                      <span className="text-sm text-slate-700">
                        {r.label}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Verification activity */}
              <Reveal visible={dashVisible} delay={650}>
                <h3 className="text-sm font-semibold text-slate-900">
                  Verification activity
                </h3>
                <div className="mt-4 space-y-0 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  {activity.map((a, i) => {
                    const st = statusStyles[a.status];
                    return (
                      <div
                        key={a.doc}
                        className={`flex items-center gap-3 py-2 ${
                          i !== activity.length - 1
                            ? "border-b border-slate-200/70"
                            : ""
                        }`}
                      >
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                          <Clock3 size={11} />
                          {a.time}
                        </span>
                        <span className="flex-1 truncate text-sm text-slate-700">
                          {a.doc}
                        </span>
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                        <span className={`text-xs font-medium ${st.text}`}>
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Reveal>
            </div>

            {/* AI analysis panel */}
            <Reveal visible={dashVisible} delay={550} className="lg:col-span-1">
              <div className="h-full bg-slate-50/70 p-6 sm:p-8">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-blue-600" strokeWidth={2.25} />
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    AI compliance analysis
                  </span>
                </div>

                {/* Score gauge */}
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
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={
                          2 * Math.PI * 40 - (score / 100) * (2 * Math.PI * 40)
                        }
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-semibold text-slate-900">
                        {score}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Low risk
                    </span>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      3 findings require attention
                    </p>
                  </div>
                </div>

                {/* Findings */}
                <div className="mt-6 space-y-2.5">
                  {findings.map((f) => {
                    const st = statusStyles[f.tone];
                    const Icon = st.icon;
                    return (
                      <div
                        key={f.text}
                        className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 ${st.border} ${st.bg}`}
                      >
                        <Icon size={15} className={`mt-0.5 shrink-0 ${st.text}`} strokeWidth={2.25} />
                        <p className="text-xs leading-relaxed text-slate-700">
                          {f.text}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* AI recommendation */}
                <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <span className="inline-flex items-center rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                    AI recommendation
                  </span>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-800">
                    Review the Udyam mismatch before final evaluation.
                  </p>
                </div>

                {/* Decision authority note */}
                <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3.5">
                  <UserCheck size={16} className="mt-0.5 shrink-0 text-slate-500" strokeWidth={2} />
                  <p className="text-xs font-medium leading-relaxed text-slate-600">
                    Final decision remains with the Procurement Officer.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
