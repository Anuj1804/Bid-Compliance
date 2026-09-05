import { useMemo, useState } from "react";
import {
  FlaskConical,
  ShieldAlert,
  ShieldQuestion,
  Search,
  Play,
  Plus,
  Trash2,
  RotateCcw,
  X,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Database,
  Info,
  ClipboardList,
  Gauge,
  Building2,
  Hash,
  Clock,
  History,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_RECORDS = [
  {
    id: "REC-001",
    bidder: "Apex Industrial Solutions",
    bidderId: "BID-18421-001",
    status: "NO MATCH",
    risk: "LOW",
    reason: "No simulated match",
    lastUpdated: "05 Sep 2026",
  },
  {
    id: "REC-002",
    bidder: "Zenith Infrastructure Pvt. Ltd.",
    bidderId: "BID-SIM-00421",
    status: "MATCH FOUND",
    risk: "HIGH",
    reason: "Mock blacklist entry created for demonstration",
    lastUpdated: "05 Sep 2026",
  },
  {
    id: "REC-003",
    bidder: "National Industrial Traders",
    bidderId: "BID-SIM-00782",
    status: "MATCH FOUND",
    risk: "MEDIUM",
    reason: "Mock compliance restriction",
    lastUpdated: "05 Sep 2026",
  },
];

const EMPTY_FORM = {
  bidder: "",
  bidderId: "",
  status: "NO MATCH",
  risk: "LOW",
  reason: "",
};

/* ------------------------------------------------------------------ */
/* Tone tokens (kept consistent with the rest of the platform)         */
/* ------------------------------------------------------------------ */

const TONE_CLASSES = {
  green: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: "text-emerald-600 bg-emerald-50",
    solidBtn: "bg-emerald-600 hover:bg-emerald-700",
  },
  blue: {
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "text-blue-600 bg-blue-50",
    solidBtn: "bg-blue-600 hover:bg-blue-700",
  },
  amber: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "text-amber-600 bg-amber-50",
    solidBtn: "bg-amber-600 hover:bg-amber-700",
  },
  red: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-200",
    icon: "text-red-600 bg-red-50",
    solidBtn: "bg-red-600 hover:bg-red-700",
  },
  slate: {
    dot: "bg-slate-500",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    icon: "text-slate-600 bg-slate-100",
    solidBtn: "bg-slate-800 hover:bg-slate-900",
  },
};

const RISK_TONE = { LOW: "slate", MEDIUM: "amber", HIGH: "red" };
const RESULT_TONE = { "NO MATCH": "green", "MATCH FOUND": "red" };

/* ------------------------------------------------------------------ */
/* Small presentational components                                    */
/* ------------------------------------------------------------------ */

function HonestyBadge({ label = "SIMULATED", tone = "amber" }) {
  const t = TONE_CLASSES[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide ${t.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}

function ResultBadge({ status }) {
  const tone = TONE_CLASSES[RESULT_TONE[status] || "slate"];
  const Icon = status === "MATCH FOUND" ? AlertTriangle : CheckCircle2;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${tone.badge}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {status}
    </span>
  );
}

function RiskBadge({ risk }) {
  const tone = TONE_CLASSES[RISK_TONE[risk] || "slate"];
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${tone.badge}`}>
      {risk}
    </span>
  );
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  const t = TONE_CLASSES[tone] || TONE_CLASSES.slate;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.icon}`}>
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xl font-semibold leading-none text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ open, title, message, confirmLabel, tone = "red", onConfirm, onCancel }) {
  if (!open) return null;
  const t = TONE_CLASSES[tone];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-lg">
        <h3 id="confirm-modal-title" className="text-sm font-semibold text-slate-900">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 ${t.solidBtn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddRecordModal({ open, form, onChange, onCancel, onSubmit }) {
  if (!open) return null;
  const canSubmit = form.bidder.trim() && form.bidderId.trim();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-record-title"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 id="add-record-title" className="text-sm font-semibold text-slate-900">
            Add Sandbox Record
          </h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit) onSubmit();
          }}
        >
          <div>
            <label htmlFor="bidder-name" className="text-xs font-medium text-slate-600">
              Bidder Name
            </label>
            <input
              id="bidder-name"
              type="text"
              value={form.bidder}
              onChange={(event) => onChange({ ...form, bidder: event.target.value })}
              placeholder="e.g. Meridian Traders Pvt. Ltd."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            />
          </div>

          <div>
            <label htmlFor="bidder-id" className="text-xs font-medium text-slate-600">
              Bidder ID
            </label>
            <input
              id="bidder-id"
              type="text"
              value={form.bidderId}
              onChange={(event) => onChange({ ...form, bidderId: event.target.value })}
              placeholder="e.g. BID-SIM-00999"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="sim-status" className="text-xs font-medium text-slate-600">
                Simulated Status
              </label>
              <select
                id="sim-status"
                value={form.status}
                onChange={(event) => onChange({ ...form, status: event.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              >
                <option value="NO MATCH">No Match</option>
                <option value="MATCH FOUND">Match Found</option>
              </select>
            </div>
            <div>
              <label htmlFor="risk-level" className="text-xs font-medium text-slate-600">
                Risk Level
              </label>
              <select
                id="risk-level"
                value={form.risk}
                onChange={(event) => onChange({ ...form, risk: event.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="text-xs font-medium text-slate-600">
              Reason
            </label>
            <input
              id="reason"
              type="text"
              value={form.reason}
              onChange={(event) => onChange({ ...form, reason: event.target.value })}
              placeholder="e.g. Mock record added for demonstration"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            />
          </div>

          <p className="flex items-start gap-1.5 rounded-md bg-amber-50 px-2.5 py-2 text-xs text-amber-700">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            This record only exists in the current sandbox session and is always labelled SIMULATED.
          </p>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              Add Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RecordDetailsPanel({ record, onClose }) {
  if (!record) return null;
  const isMatch = record.status === "MATCH FOUND";

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-slate-800">Sandbox record details</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-xs text-slate-500">Bidder</dt>
          <dd className="mt-0.5 text-sm font-medium text-slate-800">{record.bidder}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Bidder ID</dt>
          <dd className="mt-0.5 text-sm font-medium text-slate-800">{record.bidderId}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Check type</dt>
          <dd className="mt-0.5 text-sm font-medium text-slate-800">Blacklist screening</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Data source</dt>
          <dd className="mt-0.5 text-sm font-medium text-slate-800">Sandbox mock dataset</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Verification status</dt>
          <dd className="mt-1"><HonestyBadge /></dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Result</dt>
          <dd className="mt-1"><ResultBadge status={record.status} /></dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Risk</dt>
          <dd className="mt-1"><RiskBadge risk={record.risk} /></dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Timestamp</dt>
          <dd className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-slate-800">
            <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            {record.lastUpdated} • 11:20:05 AM
          </dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-xs text-slate-500">Notes</dt>
          <dd className="mt-0.5 text-sm text-slate-700">{record.reason}</dd>
        </div>
      </dl>

      {isMatch ? (
        <div className="mt-4 space-y-2">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
            <p className="font-semibold">Officer review recommended</p>
            <p className="mt-1">
              A simulated match may require officer review. Final qualification or
              disqualification remains the responsibility of the Procurement Officer.
            </p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
            This is a simulated match. It has no evidentiary value outside the sandbox.
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Simulation notice: </span>
          This record exists only within the sandbox environment and must not be interpreted
          as an official blacklist determination.
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function BlacklistSandbox() {
  const [records, setRecords] = useState(DEFAULT_RECORDS);

  const [checkQuery, setCheckQuery] = useState("");
  const [checkResult, setCheckResult] = useState(DEFAULT_RECORDS[0]);

  const [tableSearch, setTableSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newRecordForm, setNewRecordForm] = useState(EMPTY_FORM);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const stats = useMemo(() => {
    const total = records.length;
    const matches = records.filter((r) => r.status === "MATCH FOUND").length;
    const noMatch = records.filter((r) => r.status === "NO MATCH").length;
    const highRisk = records.filter((r) => r.risk === "HIGH").length;
    return { total, matches, noMatch, highRisk };
  }, [records]);

  const filteredRecords = useMemo(() => {
    const query = tableSearch.trim().toLowerCase();
    return records.filter((record) => {
      const matchesQuery =
        !query ||
        record.bidder.toLowerCase().includes(query) ||
        record.bidderId.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "No Match" && record.status === "NO MATCH") ||
        (statusFilter === "Match Found" && record.status === "MATCH FOUND");
      const matchesRisk =
        riskFilter === "All" || record.risk === riskFilter.toUpperCase();
      return matchesQuery && matchesStatus && matchesRisk;
    });
  }, [records, tableSearch, statusFilter, riskFilter]);

  const selectedRecord = filteredRecords.find((r) => r.id === selectedRecordId) ||
    records.find((r) => r.id === selectedRecordId) ||
    null;

  const runSimulatedCheck = () => {
    const query = checkQuery.trim().toLowerCase();
    if (!query) {
      setCheckResult(records.find((r) => r.bidderId === "BID-18421-001") || records[0]);
      return;
    }
    const found = records.find(
      (r) =>
        r.bidder.toLowerCase().includes(query) || r.bidderId.toLowerCase().includes(query)
    );
    if (found) {
      setCheckResult(found);
    } else {
      setCheckResult({
        id: "REC-ADHOC",
        bidder: checkQuery.trim(),
        bidderId: "Not found in sandbox",
        status: "NO MATCH",
        risk: "LOW",
        reason: "Bidder not present in the configured mock dataset",
        lastUpdated: "05 Sep 2026",
        adhoc: true,
      });
    }
  };

  const handleAddRecord = () => {
    const record = {
      id: `REC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      bidder: newRecordForm.bidder.trim(),
      bidderId: newRecordForm.bidderId.trim(),
      status: newRecordForm.status,
      risk: newRecordForm.risk,
      reason: newRecordForm.reason.trim() || "Mock record added for demonstration",
      lastUpdated: "05 Sep 2026",
    };
    setRecords((prev) => [record, ...prev]);
    setNewRecordForm(EMPTY_FORM);
    setAddModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    if (selectedRecordId === deleteTarget.id) setSelectedRecordId(null);
    setDeleteTarget(null);
  };

  const handleReset = () => {
    setRecords(DEFAULT_RECORDS);
    setSelectedRecordId(null);
    setCheckResult(DEFAULT_RECORDS[0]);
    setCheckQuery("");
    setResetConfirmOpen(false);
  };

  const isMatchResult = checkResult?.status === "MATCH FOUND";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              <FlaskConical className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                Blacklist Sandbox
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Simulate bidder blacklist checks using controlled mock records.
              </p>
            </div>
          </div>
          <div className="self-start">
            <HonestyBadge />
          </div>
        </div>

        {/* Simulated environment notice */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 shadow-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Simulated blacklist environment
            </p>
            <p className="mt-0.5 text-xs text-amber-700">
              This sandbox uses mock blacklist records for demonstration and testing. No live
              government blacklist database or external authority is being queried.
            </p>
          </div>
        </div>

        {/* Run blacklist check */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Run Blacklist Check</h2>
          <p className="mt-1 text-xs text-slate-500">
            Search a bidder from the sandbox dataset and run a simulated check.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="check-bidder" className="text-xs font-medium text-slate-600">
                Search Bidder
              </label>
              <div className="relative mt-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="check-bidder"
                  type="text"
                  value={checkQuery}
                  onChange={(event) => setCheckQuery(event.target.value)}
                  placeholder="Enter bidder name or Bidder ID"
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={runSimulatedCheck}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              Run Simulated Check
            </button>
          </div>

          {/* Result card */}
          {checkResult && (
            <div
              className={`mt-5 rounded-xl border p-4 ${
                isMatchResult ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isMatchResult ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {isMatchResult ? (
                      <AlertTriangle className="h-4.5 w-4.5" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 className="h-4.5 w-4.5" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {isMatchResult
                        ? "Simulated blacklist match found"
                        : "No simulated blacklist match found"}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                      {checkResult.bidder} • {checkResult.bidderId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <HonestyBadge />
                  <ResultBadge status={checkResult.status} />
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-700">
                {isMatchResult
                  ? checkResult.reason
                  : "No matching record was found in the configured mock blacklist dataset."}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>
                  Confidence: <span className="font-medium text-slate-700">Demo result</span>
                </span>
                {!checkResult.adhoc && (
                  <span className="flex items-center gap-1">
                    Risk: <RiskBadge risk={checkResult.risk} />
                  </span>
                )}
              </div>

              {isMatchResult ? (
                <div className="mt-3 space-y-2">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    <span className="font-semibold">Officer review recommended. </span>
                    A simulated match may require officer review. Final qualification or
                    disqualification remains the responsibility of the Procurement Officer.
                  </div>
                  <p className="text-xs text-red-600">
                    This is a simulated match. It has no evidentiary value outside the sandbox.
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-500">
                  This result is simulated and does not establish real-world blacklist
                  clearance.
                </p>
              )}

              <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                <History className="h-3.5 w-3.5" aria-hidden="true" />
                Simulated checks may appear in the bidder's compliance history.
              </p>
            </div>
          )}
        </div>

        {/* Summary cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard icon={ClipboardList} label="Sandbox records" value={stats.total} tone="slate" />
          <SummaryCard icon={AlertTriangle} label="Simulated matches" value={stats.matches} tone="red" />
          <SummaryCard icon={CheckCircle2} label="No match" value={stats.noMatch} tone="green" />
          <SummaryCard icon={Gauge} label="High risk" value={stats.highRisk} tone="amber" />
        </div>

        {/* Honesty legend */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldQuestion className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-slate-800">Honesty legend</h2>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <HonestyBadge />
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                No real external blacklist source was queried. All results on this screen come
                from a local mock dataset.
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <HonestyBadge label="VERIFIED" tone="green" />
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Reserved for future authoritative integrations. Not currently used by this
                sandbox.
              </p>
            </div>
          </div>
        </div>

        {/* Sandbox records */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Sandbox Records</h2>
              <p className="mt-1 text-xs text-slate-500">
                Mock records available for demonstration and testing.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset Sandbox
              </button>
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add Sandbox Record
              </button>
            </div>
          </div>

          {/* Search / filters */}
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={tableSearch}
                onChange={(event) => setTableSearch(event.target.value)}
                placeholder="Search by bidder name or ID"
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <label htmlFor="status-filter" className="text-xs font-medium text-slate-500">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                >
                  <option>All</option>
                  <option>No Match</option>
                  <option>Match Found</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="risk-filter" className="text-xs font-medium text-slate-500">
                  Risk
                </label>
                <select
                  id="risk-filter"
                  value={riskFilter}
                  onChange={(event) => setRiskFilter(event.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                >
                  <option>All</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                  <th scope="col" className="px-4 py-2.5">Bidder</th>
                  <th scope="col" className="px-4 py-2.5">Bidder ID</th>
                  <th scope="col" className="px-4 py-2.5">Simulated Status</th>
                  <th scope="col" className="px-4 py-2.5">Risk</th>
                  <th scope="col" className="px-4 py-2.5">Reason</th>
                  <th scope="col" className="px-4 py-2.5">Last Updated</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                      No sandbox records found. Try adjusting your search or filters.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 ${
                        selectedRecordId === record.id ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <td className="max-w-[220px] truncate px-4 py-3 font-medium text-slate-800">
                        {record.bidder}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <Hash className="h-3 w-3 text-slate-400" aria-hidden="true" />
                          {record.bidderId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ResultBadge status={record.status} />
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge risk={record.risk} />
                      </td>
                      <td className="max-w-[240px] truncate px-4 py-3 text-slate-500">
                        {record.reason}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{record.lastUpdated}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedRecordId((prev) => (prev === record.id ? null : record.id))
                            }
                            aria-label={`View details for ${record.bidder}`}
                            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(record)}
                            aria-label={`Remove ${record.bidder} from sandbox`}
                            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <RecordDetailsPanel record={selectedRecord} onClose={() => setSelectedRecordId(null)} />
        </div>
      </div>

      {/* Modals */}
      <AddRecordModal
        open={addModalOpen}
        form={newRecordForm}
        onChange={setNewRecordForm}
        onCancel={() => {
          setAddModalOpen(false);
          setNewRecordForm(EMPTY_FORM);
        }}
        onSubmit={handleAddRecord}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Remove sandbox record?"
        message={
          deleteTarget
            ? `This will remove "${deleteTarget.bidder}" from the current sandbox session only.`
            : ""
        }
        confirmLabel="Remove"
        tone="red"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        open={resetConfirmOpen}
        title="Reset sandbox?"
        message="Reset the sandbox to its default demonstration dataset? Any records you added or removed in this session will be lost."
        confirmLabel="Reset"
        tone="slate"
        onConfirm={handleReset}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
}
