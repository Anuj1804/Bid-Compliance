import React, { useState, useEffect } from "react";
import { ShieldCheck, Menu, X, ArrowUpRight } from "lucide-react";

const NAV_LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Impact", href: "#impact" },
];

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-[0_1px_0_0_rgba(15,23,42,0.06),0_4px_20px_-4px_rgba(15,23,42,0.08)]"
          : "bg-white/60 backdrop-blur-sm"
      } border-b border-slate-900/[0.06]`}
    >
      <nav
        className="mx-auto flex h-[72px] w-full max-w-[1600px] items-center justify-between px-8 lg:px-12 xl:px-16"
        aria-label="Primary navigation"
      >
        {/* Logo */}
        <a 
          href="#top"
          className="group flex items-center gap-2.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#0B1D3A] to-[#14295C] shadow-sm ring-1 ring-slate-900/10 transition-transform duration-300 ease-out group-hover:scale-[1.06] group-hover:shadow-md">
            <ShieldCheck
              className="h-[18px] w-[18px] text-white transition-transform duration-300 ease-out group-hover:scale-105"
              strokeWidth={2.25}
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight text-[#0B1D3A]">
              Bid Compliance
            </span>
            <span className="mt-0.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-400">
              GeM Verification Platform
            </span>
          </span>
        </a>

        {/* Desktop nav links */}
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
            <a
                href={link.href}
                className="group relative rounded-md px-4 py-2 text-[14px] font-medium text-slate-600 transition-colors duration-200 hover:text-[#0B1D3A] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
                {link.label}
                <span className="pointer-events-none absolute inset-x-4 -bottom-[1px] h-[2px] scale-x-0 rounded-full bg-indigo-600 transition-transform duration-200 ease-out group-hover:scale-x-100" />
            </a>
            </li>
          ))}
        </ul>

        {/* Desktop right actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            className="rounded-md px-4 py-2 text-[14px] font-medium text-slate-600 transition-colors duration-200 hover:text-[#0B1D3A] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            Log In
          </button>
          <button
            type="button"
            className="group relative ml-1 flex items-center gap-1.5 overflow-hidden rounded-md bg-[#0B1D3A] px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_1px_2px_rgba(11,29,58,0.1),0_4px_12px_-2px_rgba(11,29,58,0.35)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-[#122a54] hover:shadow-[0_2px_4px_rgba(11,29,58,0.15),0_8px_20px_-4px_rgba(11,29,58,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 active:translate-y-0"
          >
            <span>Get Started</span>
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={2.25}
            />
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileOpen}
          className="relative flex h-10 w-10 items-center justify-center rounded-md text-[#0B1D3A] transition-colors duration-200 hover:bg-slate-900/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 lg:hidden"
        >
          <Menu
            className={`absolute h-5 w-5 transition-all duration-200 ${
              isMobileOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
            }`}
          />
          <X
            className={`absolute h-5 w-5 transition-all duration-200 ${
              isMobileOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-slate-900/[0.06] bg-white/95 backdrop-blur-md transition-[max-height,opacity] duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col px-6 py-3">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a 
                href={link.href}
                onClick={closeMobileMenu}
                className="block rounded-md px-2 py-3 text-[15px] font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-900/[0.03] hover:text-[#0B1D3A] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 border-t border-slate-900/[0.06] px-6 py-4">
          <button
            type="button"
            onClick={closeMobileMenu}
            className="w-full rounded-md px-4 py-2.5 text-center text-[14px] font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-900/[0.03] hover:text-[#0B1D3A] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            Log In
          </button>
          <button
            type="button"
            onClick={closeMobileMenu}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-[#0B1D3A] px-4 py-3 text-[14px] font-semibold text-white shadow-[0_4px_12px_-2px_rgba(11,29,58,0.35)] transition-all duration-200 hover:bg-[#122a54] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Get Started
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </header>
  );
}