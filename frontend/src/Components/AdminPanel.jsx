import React, { useEffect, useMemo, useRef, useState } from "react";
import DashboardSidebar from "./dashboard/DashboardSidebar";
import {
  ShieldAlert,
  Info,
  Search,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Circle,
  Database,
  ListChecks,
  Clock,
  Activity,
  Settings,
  UserCircle2,
  Eye,
  AlertTriangle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* NOTE ON DashboardSidebar PROPS                                      */
/* ------------------------------------------------------------------ */
/*
 * This component assumes DashboardSidebar accepts the same collapse /
 * mobile-drawer props used on the existing Dashboard page:
 *   collapsed, setCollapsed, mobileOpen, setMobileOpen
 * If your DashboardSidebar uses different prop names, update the
 * <DashboardSidebar ... /> usage below to match.
 */

/* ------------------------------------------------------------------ */
/* MOCK / DEMO DATA — SIMULATED DATA (no backend, no live API calls)  */
/* ------------------------------------------------------------------ */

const INITIAL_ENTRIES = [
  {
    id: 1,
    company: "Shree Infrastructure Pvt. Ltd.",
    reason: "Contractual non-compliance",
    dateAdded: "2026-09-02",
    status: "ACTIVE",
    source: "Sandbox",
    honesty: "SIMULATED",
  },
  {
    id: 2,
    company: "Apex Industrial Solutions",
    reason: "Document discrepancy under investigation",
    dateAdded: "2026-08-28",
    status: "ACTIVE",
    source: "Sandbox",
    honesty: "SIMULATED",
  },
  {
    id: 3,
    company: "Eastern Mechanical Works",
    reason: "Repeated tender compliance failure",
    dateAdded: "2026-08-21",
    status: "ACTIVE",
    source: "Sandbox",
    honesty: "SIMULATED",
  },
  {
    id: 4,
    company: "National Process Systems",
    reason: "Incomplete statutory documentation",
    dateAdded: "2026-08-16",
    status: "REMOVED",
    source: "Sandbox",
    honesty: "SIMULATED",
  },
  {
    id: 5,
    company: "Vantage Fabrication Pvt. Ltd.",
    reason: "GST registration mismatch flagged in prior tender",
    dateAdded: "2026-08-10",
    status: "ACTIVE",
    source: "Sandbox",
    honesty: "SIMULATED",
  },
  {
    id: 6,
    company: "Coastal Engineering Corp.",
    reason: "Failure to submit EPFO compliance evidence",
    dateAdded: "2026-08-04",
    status: "ACTIVE",
    source: "Sandbox",
    honesty: "SIMULATED",
  },
  {
    id: 7,
    company: "Bharat Heavy Fittings Ltd.",
    reason: "Blacklist simulation for testing appeal workflow",
    dateAdded: "2026-07-29",
    status: "REMOVED",
    source: "Sandbox",
    honesty: "SIMULATED",
  },
  {
    id: 8,
    company: "Sundar Valves & Systems",
    reason: "OEM authorization validity dispute",
    dateAdded: "2026-07-22",
    status: "ACTIVE",
    source: "Sandbox",
    honesty: "SIMULATED",
  },
];

/* ------------------------------------------------------------------ */
/* STYLE HELPERS                                                       */
/* ------------------------------------------------------------------ */

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REMOVED: "bg-slate-100 text-slate-600 border-slate-200",
};

const HONESTY_STYLES = {
  VERIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  VALIDATED: "bg-blue-50 text-blue-700 border-blue-200",
  SIMULATED: "bg-amber-50 text-amber-700 border-amber-200",
  MISMATCH: "bg-red-50 text-red-700 border-red-200",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide ${
        STATUS_STYLES[status] || STATUS_STYLES.REMOVED
      }`}
    >
      {status === "ACTIVE" ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <Circle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      )}
      {status}
    </span>
  );
}

function HonestyBadge({ honesty }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide ${
        HONESTY_STYLES[honesty] || HONESTY_STYLES.SIMULATED
      }`}
    >
      <Circle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {honesty}
    </span>
  );
}

function formatDate(isoDate) {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* ------------------------------------------------------------------ */
/* GENERIC MODAL                                                       */
/* ------------------------------------------------------------------ */

function Modal({ title, onClose, children, labelledBy }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id={labelledBy} className="text-base font-semibold text-slate-900 sm:text-lg">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                      */
/* ------------------------------------------------------------------ */

export default function AdminPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [entries, setEntries] = useState(INITIAL_ENTRIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);

  const [formValues, setFormValues] = useState({ company: "", reason: "", dateAdded: "" });
  const [formErrors, setFormErrors] = useState({});

  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const showToast = (message) => {
    setToast(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3200);
  };

  const stats = useMemo(() => {
    const total = entries.length;
    const active = entries.filter((e) => e.status === "ACTIVE").length;
    const recentlyAdded = entries.filter((e) => {
      const added = new Date(`${e.dateAdded}T00:00:00`);
      const cutoff = new Date("2026-09-06T00:00:00");
      const diffDays = (cutoff - added) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 14;
    }).length;
    return { total, active, recentlyAdded };
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesStatus = statusFilter === "ALL" || entry.status === statusFilter;
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        entry.company.toLowerCase().includes(term) ||
        entry.reason.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [entries, searchTerm, statusFilter]);

  const openAddModal = () => {
    setFormValues({ company: "", reason: "", dateAdded: "" });
    setFormErrors({});
    setAddModalOpen(true);
  };

  const handleAddEntry = () => {
    const errors = {};
    if (!formValues.company.trim()) errors.company = "Company name is required.";
    if (!formValues.reason.trim()) errors.reason = "Reason is required.";
    if (!formValues.dateAdded) errors.dateAdded = "Date added is required.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newEntry = {
      id: entries.length > 0 ? Math.max(...entries.map((e) => e.id)) + 1 : 1,
      company: formValues.company.trim(),
      reason: formValues.reason.trim(),
      dateAdded: formValues.dateAdded,
      status: "ACTIVE",
      source: "Sandbox",
      honesty: "SIMULATED",
    };

    setEntries((prev) => [newEntry, ...prev]);
    setAddModalOpen(false);
    showToast("Sandbox blacklist entry added.");
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    setEntries((prev) =>
      prev.map((e) => (e.id === removeTarget.id ? { ...e, status: "REMOVED" } : e))
    );
    setRemoveTarget(null);
    showToast("Sandbox entry removed from the active dataset.");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* ------------------------------------------------------ */}
          {/* HEADER                                                    */}
          {/* ------------------------------------------------------ */}
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Admin Panel</h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage sandbox compliance data and administrative controls.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-700">
                <Activity className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                SYSTEM OPERATIONAL
              </span>
              <button
                type="button"
                aria-label="Settings"
                className="rounded-md border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                <UserCircle2 className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
          </div>

          {/* ------------------------------------------------------ */}
          {/* TOP STATISTICS                                            */}
          {/* ------------------------------------------------------ */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Total Sandbox Entries
                </p>
                <Database className="h-4 w-4 text-blue-500" aria-hidden="true" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Active Blacklist Entries
                </p>
                <ListChecks className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.active}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Recently Added
                </p>
                <Clock className="h-4 w-4 text-amber-500" aria-hidden="true" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.recentlyAdded}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Sandbox Status
                </p>
                <Activity className="h-4 w-4 text-blue-500" aria-hidden="true" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">Operational</p>
            </div>
          </div>

          {/* ------------------------------------------------------ */}
          {/* BLACKLIST SANDBOX SECTION                                 */}
          {/* ------------------------------------------------------ */}
          <section
            aria-labelledby="blacklist-heading"
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <h2 id="blacklist-heading" className="text-lg font-semibold text-slate-900">
                  Blacklist Sandbox
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Manage simulated blacklist/debarment records used for compliance testing and
                  demonstration.
                </p>
              </div>
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex w-fit items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Blacklist Entry
              </button>
            </div>

            {/* Honesty warning */}
            <div className="mt-4 flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-amber-800">SIMULATED DATA</p>
                <p className="mt-0.5 text-xs leading-relaxed text-amber-700">
                  These blacklist entries are sandbox records used for testing and demonstration.
                  They are not connected to or verified against a live government blacklist
                  database.
                </p>
              </div>
            </div>

            {/* Search + filters */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search company or reason..."
                  aria-label="Search blacklist entries"
                  className="w-full rounded-md border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex items-center gap-2" role="group" aria-label="Filter by status">
                {["ALL", "ACTIVE", "REMOVED"].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setStatusFilter(filter)}
                    aria-pressed={statusFilter === filter}
                    className={`rounded-md border px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                      statusFilter === filter
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {filter === "ALL" ? "All" : filter === "ACTIVE" ? "Active" : "Removed"}
                  </button>
                ))}
              </div>
            </div>

            {/* Table (desktop) */}
            {filteredEntries.length === 0 ? (
              <div className="mt-5 rounded-lg border border-dashed border-slate-200 px-4 py-10 text-center">
                <p className="text-sm font-semibold text-slate-700">No sandbox entries found</p>
                <p className="mt-1 text-xs text-slate-500">
                  Try changing your search or filter criteria.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-5 hidden overflow-x-auto rounded-lg border border-slate-200 md:block">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        <th scope="col" className="px-4 py-2.5">Company Name</th>
                        <th scope="col" className="px-4 py-2.5">Reason</th>
                        <th scope="col" className="px-4 py-2.5">Date Added</th>
                        <th scope="col" className="px-4 py-2.5">Status</th>
                        <th scope="col" className="px-4 py-2.5">Source</th>
                        <th scope="col" className="px-4 py-2.5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredEntries.map((entry) => (
                        <tr key={entry.id} className="bg-white hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{entry.company}</td>
                          <td className="px-4 py-3 text-slate-600">{entry.reason}</td>
                          <td className="px-4 py-3 text-slate-500">{formatDate(entry.dateAdded)}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col items-start gap-1.5">
                              <StatusBadge status={entry.status} />
                              <HonestyBadge honesty={entry.honesty} />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{entry.source}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setDetailsTarget(entry)}
                                aria-label={`View details for ${entry.company}`}
                                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                              >
                                <Eye className="h-4 w-4" aria-hidden="true" />
                              </button>
                              {entry.status === "ACTIVE" ? (
                                <button
                                  type="button"
                                  onClick={() => setRemoveTarget(entry)}
                                  aria-label={`Remove ${entry.company} from sandbox`}
                                  className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                                >
                                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cards (mobile) */}
                <ul className="mt-5 space-y-3 md:hidden">
                  {filteredEntries.map((entry) => (
                    <li key={entry.id} className="rounded-lg border border-slate-200 p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800">{entry.company}</p>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailsTarget(entry)}
                            aria-label={`View details for ${entry.company}`}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          </button>
                          {entry.status === "ACTIVE" ? (
                            <button
                              type="button"
                              onClick={() => setRemoveTarget(entry)}
                              aria-label={`Remove ${entry.company} from sandbox`}
                              className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{entry.reason}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={entry.status} />
                        <HonestyBadge honesty={entry.honesty} />
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        Added {formatDate(entry.dateAdded)} &middot; Source: {entry.source}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      </main>

      {/* -------------------------------------------------------- */}
      {/* ADD ENTRY MODAL                                             */}
      {/* -------------------------------------------------------- */}
      {addModalOpen ? (
        <Modal
          title="Add Blacklist Entry"
          labelledBy="add-entry-heading"
          onClose={() => setAddModalOpen(false)}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="entry-company" className="block text-sm font-medium text-slate-700">
                Company Name
              </label>
              <input
                id="entry-company"
                type="text"
                value={formValues.company}
                onChange={(e) => setFormValues((v) => ({ ...v, company: e.target.value }))}
                placeholder="Enter company name"
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {formErrors.company ? (
                <p className="mt-1 text-xs text-red-600">{formErrors.company}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="entry-reason" className="block text-sm font-medium text-slate-700">
                Reason
              </label>
              <textarea
                id="entry-reason"
                rows={3}
                value={formValues.reason}
                onChange={(e) => setFormValues((v) => ({ ...v, reason: e.target.value }))}
                placeholder="Enter reason for blacklist simulation"
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {formErrors.reason ? (
                <p className="mt-1 text-xs text-red-600">{formErrors.reason}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="entry-date" className="block text-sm font-medium text-slate-700">
                Date Added
              </label>
              <input
                id="entry-date"
                type="date"
                value={formValues.dateAdded}
                onChange={(e) => setFormValues((v) => ({ ...v, dateAdded: e.target.value }))}
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {formErrors.dateAdded ? (
                <p className="mt-1 text-xs text-red-600">{formErrors.dateAdded}</p>
              ) : null}
            </div>

            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-amber-700">
                This entry will be saved as a SIMULATED sandbox record only.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddEntry}
              className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:w-auto"
            >
              Add Entry
            </button>
          </div>
        </Modal>
      ) : null}

      {/* -------------------------------------------------------- */}
      {/* REMOVE CONFIRMATION MODAL                                   */}
      {/* -------------------------------------------------------- */}
      {removeTarget ? (
        <Modal
          title="Remove Sandbox Entry?"
          labelledBy="remove-entry-heading"
          onClose={() => setRemoveTarget(null)}
        >
          <div className="flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 px-3.5 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
            <p className="text-sm text-red-700">
              This will remove the simulated blacklist record for{" "}
              <span className="font-semibold">{removeTarget.company}</span> from the active
              sandbox dataset.
            </p>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setRemoveTarget(null)}
              className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmRemove}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 sm:w-auto"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Remove Entry
            </button>
          </div>
        </Modal>
      ) : null}

      {/* -------------------------------------------------------- */}
      {/* DETAILS MODAL                                               */}
      {/* -------------------------------------------------------- */}
      {detailsTarget ? (
        <Modal
          title="Sandbox Entry Details"
          labelledBy="details-entry-heading"
          onClose={() => setDetailsTarget(null)}
        >
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Company</dt>
              <dd className="font-medium text-slate-800">{detailsTarget.company}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Reason</dt>
              <dd className="text-right font-medium text-slate-800">{detailsTarget.reason}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Date Added</dt>
              <dd className="font-medium text-slate-800">{formatDate(detailsTarget.dateAdded)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Status</dt>
              <dd><StatusBadge status={detailsTarget.status} /></dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Source</dt>
              <dd className="font-medium text-slate-800">{detailsTarget.source}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Honesty Status</dt>
              <dd><HonestyBadge honesty={detailsTarget.honesty} /></dd>
            </div>
          </dl>
          <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-2.5">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-amber-700">
              Sandbox record — not externally verified.
            </p>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => setDetailsTarget(null)}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              Close
            </button>
          </div>
        </Modal>
      ) : null}

      {/* -------------------------------------------------------- */}
      {/* TOAST                                                       */}
      {/* -------------------------------------------------------- */}
      {toast ? (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-lg"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
          {toast}
        </div>
      ) : null}
    </div>
  );
}
