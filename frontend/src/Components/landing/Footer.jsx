import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Scroll-reveal hook — fires once                                     */
/* ------------------------------------------------------------------ */
function useRevealed(threshold = 0.15) {
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
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function Reveal({ visible, delay = 0, className = "", children }) {
  return (
    <div
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Nav data                                                             */
/* ------------------------------------------------------------------ */
const navGroups = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Dashboard", href: "#dashboard-preview" },
      { label: "Impact", href: "#impact" },
    ],
  },
  {
    heading: "Verification",
    links: [
      { label: "GST", href: "#" },
      { label: "PAN", href: "#" },
      { label: "Udyam / MSME", href: "#" },
      { label: "EPFO / ESIC", href: "#" },
      { label: "OEM Authorization", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "How it works", href: "#" },
      { label: "Documentation", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Footer                                                               */
/* ------------------------------------------------------------------ */
export default function Footer() {
  const [ref, visible] = useRevealed();

  return (
    <footer ref={ref} className="relative bg-slate-900 px-6 pt-20 sm:pt-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <Reveal
            visible={visible}
            delay={0}
            className="lg:col-span-5"
          >
            <div className="flex items-center gap-2 text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <ShieldCheck size={16} strokeWidth={2.25} />
              </span>
              <span className="text-lg font-semibold leading-none tracking-tight">
                BID
                <br />
                COMPLIANCE
              </span>
            </div>

            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-slate-300">
              AI-powered bid verification for smarter procurement.
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
              Bringing documents, government verification sources and tender
              compliance into one intelligent workspace.
            </p>
          </Reveal>

          {/* Nav columns */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
            {navGroups.map((group, i) => (
              <Reveal
                key={group.heading}
                visible={visible}
                delay={120 + i * 90}
              >
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {group.heading}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-slate-300 transition-colors duration-200 hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Trust / decision note */}
        <Reveal visible={visible} delay={420} className="mt-14">
          <div className="flex items-start gap-2.5 border-t border-slate-800 pt-8">
            <ShieldCheck
              size={14}
              className="mt-0.5 shrink-0 text-slate-500"
              strokeWidth={2}
            />
            <p className="text-xs leading-relaxed text-slate-500">
              AI-assisted verification. Final decision remains with the
              Procurement Officer.
            </p>
          </div>
        </Reveal>

        {/* Bottom bar */}
        <Reveal visible={visible} delay={480}>
          <div className="mt-8 flex flex-col gap-3 border-t border-slate-800 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Bid Compliance. All rights reserved.</p>
            <p>Built for smarter procurement.</p>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
