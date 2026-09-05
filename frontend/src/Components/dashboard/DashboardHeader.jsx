import React, { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, CalendarDays, ShieldCheck } from "lucide-react";

const DashboardHeader = ({
  officerName = "Procurement Officer",
  officerInitials = "OP",
  hasUnreadNotifications = true,
  onNotificationsClick,
  onProfileClick,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileToggle = () => {
    setIsProfileOpen((prev) => !prev);
    onProfileClick?.();
  };

  return (
    <header className="dh-animate-in w-full bg-white border-b border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="w-full h-16 sm:h-20 md:h-[92px] lg:h-[100px] px-4 sm:px-6 lg:px-8 flex items-center gap-4 sm:gap-6">
        {/* Branding */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
            <ShieldCheck
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-400"
              size={18}
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900 tracking-tight">
              Bid Compliance
            </span>
            <span className="text-xs text-slate-500">GeM Procurement</span>
            <span className="hidden lg:block text-[10px] font-semibold tracking-[0.18em] text-slate-400 mt-0.5">
              GOVERNMENT OF INDIA
            </span>
          </div>
        </div>

        {/* Divider between branding and greeting */}
        <span
          className="hidden md:block w-px h-10 bg-slate-200 flex-shrink-0"
          aria-hidden="true"
        />

        {/* Greeting / context — fills remaining space */}
        <div className="flex-1 min-w-0">
          <p className="hidden lg:block text-[11px] font-semibold tracking-[0.2em] text-blue-600 mb-1">
            COMPLIANCE OVERVIEW
          </p>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 tracking-tight truncate">
            Good morning, Officer
          </h1>
          <div className="hidden sm:flex items-center gap-2 mt-0.5">
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              Here&apos;s your compliance overview for today.
            </p>
            <span
              className="hidden lg:inline-flex items-center gap-1.5 text-xs text-slate-400 border-l border-slate-200 pl-2 flex-shrink-0"
              aria-hidden="true"
            >
              <CalendarDays className="w-3.5 h-3.5" size={14} />
              {today}
            </span>
          </div>
        </div>

        {/* Right — Controls */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
          {/* Notification button */}
          <button
            type="button"
            onClick={onNotificationsClick}
            aria-label={
              hasUnreadNotifications
                ? "Notifications, unread notifications available"
                : "Notifications"
            }
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2"
          >
            <Bell className="w-[17px] h-[17px] sm:w-[18px] sm:h-[18px]" size={18} strokeWidth={2} />
            {hasUnreadNotifications && (
              <span
                className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-blue-600 ring-2 ring-white"
                aria-hidden="true"
              />
            )}
          </button>

          {/* Divider */}
          <span className="hidden sm:block w-px h-8 bg-slate-200" aria-hidden="true" />

          {/* Officer profile control */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={handleProfileToggle}
              aria-haspopup="true"
              aria-expanded={isProfileOpen}
              aria-label="Officer account menu"
              className="flex items-center gap-2.5 rounded-xl border border-transparent pl-1.5 pr-2 sm:pr-2.5 py-1.5 transition-colors hover:bg-slate-50 hover:border-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2"
            >
              <span
                className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold tracking-wide flex-shrink-0"
                aria-hidden="true"
              >
                {officerInitials}
              </span>
              <span className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-sm font-medium text-slate-800">
                  {officerName}
                </span>
                <span className="text-xs text-slate-400">Officer</span>
              </span>
              <ChevronDown
                className={`hidden md:block w-4 h-4 text-slate-400 transition-transform ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
                size={16}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .dh-animate-in {
          animation: dhFadeInUp 0.5s ease-out both;
        }
        @keyframes dhFadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .dh-animate-in {
            animation: none;
          }
        }
      `}</style>
    </header>
  );
};

export default DashboardHeader;
