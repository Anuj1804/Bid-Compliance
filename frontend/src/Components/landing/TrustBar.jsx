import React from "react";
import { CheckCircle2 } from "lucide-react";

const VERIFICATION_ITEMS = [
  "GST Verification",
  "PAN Verification",
  "Udyam / MSME",
  "EPFO / ESIC",
  "OEM Authorization",
  "Blacklisting / Debarment",
];

export default function TrustBar() {
  return (
    <section
      className="relative flex h-14 items-center overflow-hidden border-y border-slate-200 bg-slate-50/70"
      aria-label="Compliance verification coverage"
    >
      <style>{`
        @keyframes tb-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .tb-marquee-track {
          animation: tb-marquee 30s linear infinite;
        }
        .tb-marquee-group:hover .tb-marquee-track {
          animation-play-state: paused;
        }
      `}</style>

      {/* Edge fade masks */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-slate-50 to-transparent sm:w-28"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-slate-50 to-transparent sm:w-28"
      />

      <div className="tb-marquee-group w-full overflow-hidden">
        <div className="tb-marquee-track flex w-max items-center">
          <MarqueeItems items={VERIFICATION_ITEMS} />
          <MarqueeItems items={VERIFICATION_ITEMS} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

function MarqueeItems({ items, ...rest }) {
  return (
    <div className="flex items-center" {...rest}>
      {items.map((label, i) => (
        <React.Fragment key={`${label}-${i}`}>
          <div className="flex items-center gap-2 whitespace-nowrap px-4 sm:px-5">
            <CheckCircle2
              className="h-[15px] w-[15px] shrink-0 text-emerald-500"
              strokeWidth={2.25}
            />
            <span className="text-[13px] font-medium text-[#0B1D3A]">
              {label}
            </span>
            <span className="hidden text-[10.5px] font-medium text-emerald-600 sm:inline">
              Verified
            </span>
          </div>
          <span
            aria-hidden="true"
            className="h-1 w-1 shrink-0 rounded-full bg-slate-300"
          />
        </React.Fragment>
      ))}
    </div>
  );
}