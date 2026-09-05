import React, { useEffect, useRef, useState } from "react";
import { UsersRound, ShieldCheck, ShieldAlert, TriangleAlert } from "lucide-react";

// Demo / mock values — structured for easy replacement with API data later.
const stats = [
  {
    id: "total",
    label: "TOTAL BIDDERS",
    value: 128,
    supportingText: "Processed",
    icon: UsersRound,
    accent: "blue",
    emphasize: false,
  },
  {
    id: "low",
    label: "LOW RISK",
    value: 76,
    supportingText: "59.4% of total",
    icon: ShieldCheck,
    accent: "green",
    emphasize: false,
  },
  {
    id: "medium",
    label: "MEDIUM RISK",
    value: 38,
    supportingText: "29.7% of total",
    icon: ShieldAlert,
    accent: "amber",
    emphasize: false,
  },
  {
    id: "high",
    label: "HIGH RISK",
    value: 14,
    supportingText: "Needs attention",
    icon: TriangleAlert,
    accent: "red",
    emphasize: true,
  },
];

// Tailwind class tokens per accent — kept explicit (no dynamic string
// interpolation) so Tailwind's JIT compiler picks all of them up.
const accentStyles = {
  blue: {
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    dot: "bg-blue-500",
    text: "text-blue-600",
  },
  green: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    dot: "bg-emerald-500",
    text: "text-emerald-600",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    dot: "bg-amber-500",
    text: "text-amber-600",
  },
  red: {
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    dot: "bg-red-500",
    text: "text-red-600",
  },
};

/**
 * Animates a number from 0 to `target` once `isActive` becomes true.
 * Respects prefers-reduced-motion by snapping straight to the target value.
 */
const useCountUp = (target, isActive, duration = 850) => {
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
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic for a smooth, non-mechanical finish
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isActive, target, duration]);

  return value;
};

const StatCard = ({ stat, isVisible }) => {
  const { label, value, supportingText, icon: Icon, accent, emphasize } = stat;
  const styles = accentStyles[accent];
  const animatedValue = useCountUp(value, isVisible);

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-lg border bg-white p-5 sm:p-6 transition-all duration-200 ease-out hover:-translate-y-0.5 ${
        emphasize
          ? "border-red-200 shadow-[0_1px_3px_rgba(220,38,38,0.08)] hover:border-red-300 hover:shadow-[0_6px_16px_rgba(220,38,38,0.10)]"
          : "border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-slate-300 hover:shadow-[0_6px_16px_rgba(15,23,42,0.06)]"
      }`}
    >
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">
          {label}
        </p>
        <span
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md ${styles.iconBg}`}
          aria-hidden="true"
        >
          <Icon className={`h-4.5 w-4.5 ${styles.iconColor}`} size={18} strokeWidth={2} />
        </span>
      </div>

      <div className="mt-4">
        <p className="text-3xl sm:text-[2.25rem] font-semibold leading-none tracking-tight text-slate-900 tabular-nums">
          {animatedValue}
        </p>
        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
            aria-hidden="true"
          />
          <p className={`text-xs font-medium ${emphasize ? styles.text : "text-slate-500"}`}>
            {supportingText}
          </p>
        </div>
      </div>
    </div>
  );
};

const OverviewStats = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="overview-stats-heading" className="mb-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2
            id="overview-stats-heading"
            className="text-base font-semibold tracking-tight text-slate-900"
          >
            Overview
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Current compliance activity across your tenders and bidders.
          </p>
        </div>

        <span
          className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-amber-700"
          title="These figures are placeholder demo values, not live verified data."
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
          SIMULATED DATA
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} isVisible={isVisible} />
        ))}
      </div>
    </section>
  );
};

export default OverviewStats;
