import { useEffect, useRef, useState } from "react";
import { Gauge, Clock3, ShieldCheck, History } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Scroll-reveal hook — fires once                                     */
/* ------------------------------------------------------------------ */
function useRevealed(threshold = 0.25) {
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
/* Count-up hook — animates a numeric value once triggered             */
/* ------------------------------------------------------------------ */
function useCountUp(target, active, duration = 1200) {
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
/* Reveal wrapper                                                       */
/* ------------------------------------------------------------------ */
function Reveal({ visible, delay = 0, className = "", children }) {
  return (
    <div
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Supporting impact items                                             */
/* ------------------------------------------------------------------ */
const supportingItems = [
  {
    icon: Clock3,
    label: "Faster",
    title: "Bid evaluation",
    description:
      "Bring multiple verification checks into one workspace to reduce evaluation time.",
  },
  {
    icon: Gauge,
    label: "Fewer",
    title: "Manual errors",
    description:
      "Automated cross-checking helps identify missing, inconsistent and conflicting information.",
  },
  {
    icon: ShieldCheck,
    label: "Standardized",
    title: "Compliance checks",
    description:
      "Every bidder is verified against the same tender-specific requirements, consistently.",
  },
  {
    icon: History,
    label: "Fully traceable",
    title: "Verification history",
    description:
      "Every verification result can be associated with its source, status and audit activity.",
  },
];

/* ------------------------------------------------------------------ */
/* Section                                                              */
/* ------------------------------------------------------------------ */
export default function Impact() {
  const [headerRef, headerVisible] = useRevealed(0.3);
  const [statRef, statVisible] = useRevealed(0.4);
  const [itemsRef, itemsVisible] = useRevealed(0.15);

  const low = useCountUp(60, statVisible, 1100);
  const high = useCountUp(80, statVisible, 1300);

  return (
    <section id="impact" className="relative bg-white px-6 py-24 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Top: heading + dominant metric */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left — editorial heading */}
          <div
            ref={headerRef}
            className={`lg:col-span-6 transition-all duration-700 ease-out ${
              headerVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
              The impact
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.6rem] lg:leading-[1.1]">
              Faster verification. Clearer decisions.
            </h2>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-slate-600">
              By bringing document analysis, portal verification and
              tender-specific compliance checks into one workspace, Bid
              Compliance reduces repetitive manual work while improving
              transparency and consistency.
            </p>
          </div>

          {/* Right — dominant stat */}
          <div
            ref={statRef}
            className={`flex flex-col justify-center lg:col-span-6 transition-all duration-700 ease-out ${
              statVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: statVisible ? "120ms" : "0ms" }}
          >
            <div className="rounded-3xl border border-slate-200 bg-slate-50/60 px-8 py-10 sm:px-10 sm:py-12">
              <p className="text-[3.5rem] font-semibold leading-none tracking-tight text-slate-900 sm:text-[4.5rem]">
                {low}–{high}
                <span className="text-blue-600">%</span>
              </p>
              <p className="mt-4 text-sm font-medium uppercase tracking-wide text-slate-500">
                Reduction in verification effort
              </p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
                Automating repetitive document and portal cross-checks
                reduces manual verification workload.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-14 h-px w-full bg-slate-200 sm:my-16" />

        {/* Supporting impact items */}
        <div
          ref={itemsRef}
          className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {supportingItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal
                key={item.title}
                visible={itemsVisible}
                delay={i * 110}
                className="flex flex-col gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white">
                  <Icon size={18} className="text-blue-600" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.label}{" "}
                    <span className="font-normal text-slate-600">
                      {item.title}
                    </span>
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
