import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  PlayCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  Loader2,
} from "lucide-react";

const COMPLIANCE_CHECKS = [
  { label: "GST Registration", status: "verified" },
  { label: "PAN Verification", status: "verified" },
  { label: "Udyam / MSME", status: "verified" },
  { label: "EPFO / ESIC", status: "warning" },
  { label: "OEM Authorization", status: "verified" },
  { label: "Blacklisting / Debarment", status: "warning" },
];

const TARGET_SCORE = 87;

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let frame;
    const start = performance.now();
    const duration = 1100;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setScore(Math.round(eased * TARGET_SCORE));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    const delay = setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, 650);
    return () => {
      clearTimeout(delay);
      cancelAnimationFrame(frame);
    };
  }, [mounted]);

  return (
    <section className="relative overflow-hidden bg-white pt-[72px]">
      <style>{`
        @keyframes bc-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bc-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .bc-float { animation: bc-float 6s ease-in-out infinite; }
        .bc-fade-up { animation: bc-fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(79,70,229,0.06),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,white_92%)]" />
        <div className="absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="absolute top-40 left-[-10%] h-[360px] w-[360px] rounded-full bg-[#0B1D3A]/[0.04] blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 py-16 sm:py-20 md:py-24 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:py-28">
        {/* Left column */}
        <div className="relative z-10 max-w-xl">
          <div
            className={`inline-flex items-center gap-2 rounded-full border border-indigo-600/15 bg-indigo-50/70 px-3.5 py-1.5 ${
              mounted ? "bc-fade-up" : "opacity-0"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" strokeWidth={2.25} />
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-indigo-700">
              AI-Powered Procurement Compliance
            </span>
          </div>

          <h1
            className={`mt-6 text-[2.5rem] font-semibold leading-[1.1] tracking-tight text-[#0B1D3A] sm:text-[3.25rem] ${
              mounted ? "bc-fade-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.08s" }}
          >
            Verify Every Bid.
            <br />
            With Confidence.
          </h1>

          <p
            className={`mt-6 text-[16.5px] leading-relaxed text-slate-600 sm:text-[17px] ${
              mounted ? "bc-fade-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.16s" }}
          >
            Bid Compliance intelligently verifies bidder documents, statutory
            filings, and tender-specific eligibility requirements from a
            single workspace — helping procurement officers catch missing or
            inconsistent information before it becomes a risk.
          </p>

          <div
            className={`mt-9 flex flex-col gap-3 sm:flex-row sm:items-center ${
              mounted ? "bc-fade-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.24s" }}
          >
            <Link
            to="/login"
            className="group inline-flex items-center justify-center gap-1.5 rounded-md bg-[#0B1D3A] px-6 py-3.5 text-[14.5px] font-semibold text-white shadow-[0_1px_2px_rgba(11,29,58,0.1),0_6px_16px_-4px_rgba(11,29,58,0.35)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-[#122a54] hover:shadow-[0_2px_6px_rgba(11,29,58,0.15),0_10px_24px_-4px_rgba(11,29,58,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 active:translate-y-0"
            >
            Get Started
            <ArrowUpRight
                className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={2.25}
            />
            </Link>
            <button
              type="button"
              className="group inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-6 py-3.5 text-[14.5px] font-semibold text-[#0B1D3A] transition-all duration-200 ease-out hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            >
              <PlayCircle
                className="h-4.5 w-4.5 text-slate-400 transition-colors duration-200 group-hover:text-indigo-600"
                strokeWidth={2}
              />
              See How It Works
            </button>
          </div>

          <div
            className={`mt-10 flex items-center gap-6 border-t border-slate-100 pt-6 ${
              mounted ? "bc-fade-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.3s" }}
          >
            <div>
              <p className="text-[20px] font-semibold text-[#0B1D3A]">12+</p>
              <p className="text-[12.5px] text-slate-500">Statutory checks automated</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <p className="text-[20px] font-semibold text-[#0B1D3A]">Minutes</p>
              <p className="text-[12.5px] text-slate-500">Not days, per bid review</p>
            </div>
          </div>
        </div>

        {/* Right column — product visual */}
        <div
          className={`relative z-10 ${mounted ? "bc-fade-up" : "opacity-0"}`}
          style={{ animationDelay: "0.2s" }}
        >
          <div className="bc-float relative mx-auto max-w-md">
            {/* Backdrop accent card */}
            <div
              aria-hidden="true"
              className="absolute -right-4 -top-4 h-full w-full rounded-2xl border border-indigo-100 bg-indigo-50/50"
            />

            {/* Main dashboard card */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_1px_rgba(15,23,42,0.03),0_20px_45px_-15px_rgba(15,23,42,0.18)]">
              {/* Card header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B1D3A]">
                    <ShieldCheck className="h-4 w-4 text-white" strokeWidth={2.25} />
                  </span>
                  <div className="leading-tight">
                    <p className="text-[13px] font-semibold text-[#0B1D3A]">
                      Compliance Verification
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Tender ID: GEM/2026/B/4471
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10.5px] font-semibold text-indigo-700">
                  <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2.5} />
                  AI Verifying
                </span>
              </div>

              {/* Bidder + score */}
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-400">
                    Bidder
                  </p>
                  <p className="mt-0.5 text-[14.5px] font-semibold text-[#0B1D3A]">
                    Meridian Infra Solutions
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10.5px] font-semibold text-amber-700">
                    <AlertTriangle className="h-3 w-3" strokeWidth={2.5} />
                    Medium Risk
                  </span>
                </div>
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <svg viewBox="0 0 64 64" className="absolute h-16 w-16 -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="27"
                      fill="none"
                      stroke="#EEF2FF"
                      strokeWidth="6"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="27"
                      fill="none"
                      stroke="#4F46E5"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 27}
                      strokeDashoffset={
                        2 * Math.PI * 27 * (1 - score / 100)
                      }
                      style={{ transition: "stroke-dashoffset 0.2s linear" }}
                    />
                  </svg>
                  <span className="text-[15px] font-bold text-[#0B1D3A]">
                    {score}
                  </span>
                </div>
              </div>

              {/* Checks list */}
              <div className="space-y-1 border-t border-slate-100 px-5 py-4">
                <p className="mb-2 text-[10.5px] font-medium uppercase tracking-wide text-slate-400">
                  Document &amp; Statutory Checks
                </p>
                {COMPLIANCE_CHECKS.map((check, i) => (
                  <div
                    key={check.label}
                    className={`flex items-center justify-between rounded-md px-2 py-1.5 transition-colors duration-200 ${
                      mounted ? "bc-fade-up" : "opacity-0"
                    }`}
                    style={{ animationDelay: `${0.35 + i * 0.06}s` }}
                  >
                    <span className="flex items-center gap-2 text-[13px] text-slate-700">
                      <FileCheck2 className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                      {check.label}
                    </span>
                    {check.status === "verified" ? (
                      <span className="flex items-center gap-1 text-[11.5px] font-semibold text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5 animate-pulse" strokeWidth={2.5} />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11.5px] font-semibold text-amber-600">
                        <AlertTriangle className="h-3.5 w-3.5 animate-pulse" strokeWidth={2.5} />
                        Review
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                <span className="text-[11px] text-slate-400">
                  Demo data · not connected to live records
                </span>
                <span className="text-[11px] font-semibold text-[#0B1D3A]">
                  4 / 6 passed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}