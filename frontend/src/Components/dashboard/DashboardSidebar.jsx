import React, { useState } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  FileText,
  UsersRound,
  FileCheck2,
  ClipboardCheck,
  History,
  ShieldAlert,
  Settings2,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";

const navSections = [
  {
    title: "WORKSPACE",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "tenders", label: "Tenders", icon: FileText },
      { id: "bidders", label: "Bidders", icon: UsersRound },
      { id: "document-verification", label: "Document Verification", icon: FileCheck2 },
      { id: "reviews", label: "Reviews", icon: ClipboardCheck },
    ],
  },
  {
    title: "COMPLIANCE",
    items: [
      { id: "audit-trail", label: "Audit Trail", icon: History },
      { id: "blacklist-sandbox", label: "Blacklist Sandbox", icon: ShieldAlert },
    ],
  },
  {
    title: "SYSTEM",
    items: [{ id: "admin-panel", label: "Admin Panel", icon: Settings2 }],
  },
];

const DashboardSidebar = ({
  isCollapsed: isCollapsedProp,
  setIsCollapsed: setIsCollapsedProp,
  isMobileOpen: isMobileOpenProp,
  setIsMobileOpen: setIsMobileOpenProp,
}) => {
  // Internal fallback state so the component works standalone if the
  // parent (Dashboard.jsx) does not yet control these props.
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");

  const isCollapsed =
    isCollapsedProp !== undefined ? isCollapsedProp : internalCollapsed;
  const setIsCollapsed = setIsCollapsedProp || setInternalCollapsed;
  const isMobileOpen =
    isMobileOpenProp !== undefined ? isMobileOpenProp : internalMobileOpen;
  const setIsMobileOpen = setIsMobileOpenProp || setInternalMobileOpen;

  // Hides labels only at the lg breakpoint and above (desktop collapse).
  // Below lg, the sidebar always renders as a full-width mobile drawer,
  // so this class has no effect there.
  const hideWhenCollapsed = isCollapsed ? "lg:hidden" : "";

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
        className={`ds-motion fixed inset-0 z-40 bg-slate-950/50 transition-opacity duration-300 ease-out lg:hidden ${
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        aria-label="Dashboard navigation"
        className={`ds-motion fixed inset-y-0 left-0 z-50 flex h-screen w-[248px] flex-shrink-0 flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:sticky lg:top-0 lg:translate-x-0 lg:z-30 ${
          isCollapsed ? "lg:w-[72px]" : "lg:w-[248px]"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900">
            <ShieldCheck className="h-4.5 w-4.5 text-blue-400" size={18} strokeWidth={2} aria-hidden="true" />
          </div>
          <div className={`min-w-0 ${hideWhenCollapsed}`}>
            <p className="truncate text-sm font-semibold text-white">Bid Compliance</p>
            <p className="truncate text-xs text-slate-400">GeM Procurement</p>
            <p className="mt-0.5 truncate text-[9px] font-semibold tracking-[0.16em] text-slate-500">
              GOVERNMENT OF INDIA
            </p>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation menu"
            className="ml-auto flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 lg:hidden"
          >
            <X className="h-4.5 w-4.5" size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation */}
        <nav aria-label="Primary" className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">
          {navSections.map((section) => (
            <div key={section.title}>
              <p
                className={`px-3 pt-4 pb-1.5 text-[10px] font-semibold tracking-[0.14em] text-slate-500 first:pt-0 ${hideWhenCollapsed}`}
              >
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setActiveItem(item.id)}
                        aria-current={isActive ? "page" : undefined}
                        title={item.label}
                        className={`group relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
                          isActive
                            ? "bg-blue-500/10 text-white"
                            : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                        }`}
                      >
                        {isActive && (
                          <span
                            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-blue-400 transition-all duration-200"
                            aria-hidden="true"
                          />
                        )}
                        <Icon
                          className={`h-[18px] w-[18px] flex-shrink-0 transition-colors duration-200 ${
                            isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                          }`}
                          size={18}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        <span className={`truncate ${hideWhenCollapsed}`}>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Collapse toggle — desktop only */}
        <div className="hidden border-t border-slate-800 px-3 py-2 lg:block">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-400 transition-colors duration-200 hover:bg-slate-800/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-[18px] w-[18px] flex-shrink-0" size={18} aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-[18px] w-[18px] flex-shrink-0" size={18} aria-hidden="true" />
            )}
            <span className={`truncate ${hideWhenCollapsed}`}>Collapse sidebar</span>
          </button>
        </div>

        {/* System status */}
        <div className="border-t border-slate-800 px-4 py-4">
          <p className={`mb-1.5 text-[10px] font-semibold tracking-[0.12em] text-slate-500 ${hideWhenCollapsed}`}>
            SYSTEM STATUS
          </p>
          <div
            className="flex items-center gap-2"
            title={isCollapsed ? "System Operational" : undefined}
          >
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="ds-status-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className={`text-xs font-medium text-slate-300 ${hideWhenCollapsed}`}>
              Operational
            </span>
          </div>
          <p className={`mt-1 text-[11px] leading-snug text-slate-500 ${hideWhenCollapsed}`}>
            All verification services available
          </p>
        </div>

        {/* Officer profile */}
        <div className="flex items-center gap-3 border-t border-slate-800 px-4 py-4">
          <span
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white"
            title={isCollapsed ? "Procurement Officer" : undefined}
            aria-hidden={!isCollapsed}
          >
            OP
          </span>
          <div className={`min-w-0 ${hideWhenCollapsed}`}>
            <p className="truncate text-sm font-medium text-slate-200">Procurement Officer</p>
            <p className="truncate text-xs text-slate-500">Officer</p>
          </div>
        </div>
      </aside>

      <style>{`
        .ds-status-pulse {
          animation: dsStatusPulse 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes dsStatusPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0; transform: scale(2); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ds-motion,
          .ds-motion * {
            transition-duration: 0.01ms !important;
          }
          .ds-status-pulse {
            animation: none;
          }
        }
      `}</style>
    </>
  );
};

export default DashboardSidebar;
