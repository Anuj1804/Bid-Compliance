import { useMemo, useState } from "react";
import {
  FileClock,
  Lock,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  UploadCloud,
  ScanText,
  FileSearch,
  Fingerprint,
  FlaskConical,
  GitCompareArrows,
  Gauge,
  Sparkles,
  UserCog,
  ClipboardCheck,
  Server,
  User,
  Bot,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  Building2,
  Hash,
  Layers,
  ClipboardList,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Mock data                                                          */
/* ------------------------------------------------------------------ */

const BIDDER = {
  name: "Apex Industrial Solutions",
  bidderId: "BID-18421-001",
  gstin: "07AABCA1234F1Z5",
  tenderId: "GEM/2026/B/18421",
  tenderName: "Industrial Pumping Equipment",
  category: "Process Equipment",
  complianceScore: 82,
  risk: "HIGH",
  reviewState: "Officer review pending",
};

const SUMMARY_STATS = [
  { label: "Recorded events", value: 10, icon: ClipboardList, tone: "slate" },
  { label: "Flagged mismatches", value: 1, icon: AlertTriangle, tone: "red" },
  { label: "Simulated checks", value: 1, icon: FlaskConical, tone: "amber" },
  { label: "Officer actions", value: 2, icon: UserCog, tone: "blue" },
];

const HONESTY_LEGEND = [
  {
    code: "VERIFIED",
    tone: "green",
    description: "Confirmed against a real external or authoritative source.",
  },
  {
    code: "VALIDATED",
    tone: "blue",
    description: "Passed local format or logic validation only.",
  },
  {
    code: "SIMULATED",
    tone: "amber",
    description: "Sandbox / mock result. No real external access performed.",
  },
  {
    code: "MISMATCH",
    tone: "red",
    description: "Two sources disagree and require review.",
  },
];

const CATEGORIES = [
  "All Events",
  "Document",
  "Validation",
  "Check",
  "Mismatch",
  "Assessment",
  "AI Advisory",
  "Officer",
];

const SOURCES = ["All", "System", "Officer"];

const EVENTS = [
  {
    id: "AUD-0001",
    timestamp: "05 Sep 2026 • 10:14:22 AM",
    title: "Bidder documents uploaded",
    description:
      "6 bidder documents were submitted for compliance assessment against tender GEM/2026/B/18421.",
    actor: "Procurement Officer",
    actorType: "Officer",
    status: "VALIDATED",
    category: "Document",
    icon: UploadCloud,
    metadata: [
      { label: "Documents", value: "6 files" },
      { label: "Bidder", value: "Apex Industrial Solutions" },
      { label: "Tender", value: "GEM/2026/B/18421" },
    ],
  },
  {
    id: "AUD-0002",
    timestamp: "05 Sep 2026 • 10:14:31 AM",
    title: "Document structure validated",
    description:
      "Uploaded files passed local format and required-file structure checks before document analysis.",
    actor: "Compliance Engine",
    actorType: "System",
    status: "VALIDATED",
    category: "Validation",
    icon: ScanText,
    metadata: [
      { label: "Files checked", value: "6" },
      { label: "Unreadable files", value: "0" },
      { label: "Validation type", value: "Local format / logic" },
    ],
    note: {
      tone: "blue",
      text: "Local structural check only — this is not a government verification.",
    },
  },
  {
    id: "AUD-0003",
    timestamp: "05 Sep 2026 • 10:14:48 AM",
    title: "Document extraction completed",
    description:
      "Relevant fields were extracted from the uploaded OEM Authorization and supporting bidder documents.",
    actor: "Document Analysis",
    actorType: "System",
    status: "VALIDATED",
    category: "Document",
    icon: FileSearch,
    metadata: [
      { label: "Average confidence", value: "94%" },
      { label: "OEM Authorization", value: "96%" },
      { label: "GST Certificate", value: "98%" },
    ],
  },
  {
    id: "AUD-0004",
    timestamp: "05 Sep 2026 • 10:15:03 AM",
    title: "GST identifier format validated",
    description:
      "GSTIN 07AABCA1234F1Z5 passed local structural and format validation.",
    actor: "Compliance Engine",
    actorType: "System",
    status: "VALIDATED",
    category: "Check",
    icon: Fingerprint,
    metadata: [
      { label: "GSTIN", value: "07AABCA1234F1Z5" },
      { label: "Check type", value: "Format validation" },
      { label: "External verification", value: "Not performed" },
    ],
    note: {
      tone: "blue",
      text: "Format check only — no GST portal lookup was performed.",
    },
  },
  {
    id: "AUD-0005",
    timestamp: "05 Sep 2026 • 10:15:16 AM",
    title: "Blacklist sandbox check completed",
    description: "Bidder was checked against the demo blacklist dataset.",
    actor: "Sandbox Connector",
    actorType: "System",
    status: "SIMULATED",
    category: "Check",
    icon: FlaskConical,
    metadata: [
      { label: "Result", value: "No sandbox match" },
      { label: "Dataset", value: "Demo blacklist" },
      { label: "Authority", value: "SIMULATED" },
    ],
    note: {
      tone: "amber",
      text: "This result does not represent a real government blacklist verification.",
    },
  },
  {
    id: "AUD-0006",
    timestamp: "05 Sep 2026 • 10:15:39 AM",
    title: "OEM Authorization mismatch detected",
    description:
      "The declared authorization validity does not match the date found in the uploaded OEM Authorization document.",
    actor: "Compliance Engine",
    actorType: "System",
    status: "MISMATCH",
    category: "Mismatch",
    icon: GitCompareArrows,
    highlight: true,
    comparison: {
      declaredLabel: "Declared",
      declaredValue: "Valid until 31 Dec 2026",
      declaredSource: "Bidder Declaration",
      documentLabel: "Uploaded document",
      documentValue: "Valid until 30 Sep 2026",
      documentSource: "Uploaded OEM Authorization",
    },
    metadata: [
      { label: "Confidence", value: "91%" },
      { label: "Verification method", value: "Document comparison" },
    ],
  },
  {
    id: "AUD-0007",
    timestamp: "05 Sep 2026 • 10:15:47 AM",
    title: "Compliance assessment generated",
    description:
      "The advisory compliance assessment was recalculated after document comparison checks were completed.",
    actor: "Compliance Engine",
    actorType: "System",
    status: "VALIDATED",
    category: "Assessment",
    icon: Gauge,
    metadata: [
      { label: "Compliance score", value: "82 / 100" },
      { label: "Risk", value: "HIGH" },
      { label: "Flagged issues", value: "1 critical mismatch" },
    ],
    note: {
      tone: "blue",
      text: "This score is an advisory assessment, not a government decision.",
    },
  },
  {
    id: "AUD-0008",
    timestamp: "05 Sep 2026 • 10:15:52 AM",
    title: "AI advisory recommendation generated",
    description: "Review OEM authorization validity before qualification.",
    actor: "AI Advisory",
    actorType: "AI",
    status: "ADVISORY ONLY",
    category: "AI Advisory",
    icon: Sparkles,
    advisory: {
      text: "The AI recommendation does not qualify or disqualify the bidder. Final decision belongs to the Procurement Officer.",
    },
  },
  {
    id: "AUD-0009",
    timestamp: "05 Sep 2026 • 11:02:19 AM",
    title: "Flag opened for officer review",
    description:
      "Procurement Officer opened the OEM Authorization mismatch for detailed review.",
    actor: "Procurement Officer",
    actorType: "Officer",
    status: "OFFICER REVIEW",
    category: "Officer",
    icon: UserCog,
    metadata: [
      { label: "Issue", value: "OEM Authorization Mismatch" },
      { label: "State", value: "Under officer review" },
      { label: "AI recommendation", value: "Advisory only" },
    ],
  },
  {
    id: "AUD-0010",
    timestamp: "05 Sep 2026 • 11:07:44 AM",
    title: "Officer review note added",
    description:
      "Authorization document validity is shorter than the validity declared by the bidder. Qualification decision requires manual consideration.",
    actor: "Procurement Officer",
    actorType: "Officer",
    status: "OFFICER REVIEW",
    category: "Officer",
    icon: ClipboardCheck,
    metadata: [
      { label: "Review state", value: "Pending final decision" },
      { label: "Decision maker", value: "Procurement Officer" },
      { label: "System verdict", value: "None" },
    ],
    note: {
      tone: "slate",
      text: "The system has not made a final qualification decision.",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Shared tone tokens                                                  */
/* ------------------------------------------------------------------ */

const TONE_CLASSES = {
  green: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ring: "ring-emerald-100",
    icon: "text-emerald-600 bg-emerald-50",
  },
  blue: {
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    ring: "ring-blue-100",
    icon: "text-blue-600 bg-blue-50",
  },
  amber: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    ring: "ring-amber-100",
    icon: "text-amber-600 bg-amber-50",
  },
  red: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-200",
    ring: "ring-red-100",
    icon: "text-red-600 bg-red-50",
  },
  violet: {
    dot: "bg-violet-500",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    ring: "ring-violet-100",
    icon: "text-violet-600 bg-violet-50",
  },
  slate: {
    dot: "bg-slate-500",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    ring: "ring-slate-100",
    icon: "text-slate-600 bg-slate-100",
  },
};

const STATUS_TONE = {
  VERIFIED: "green",
  VALIDATED: "blue",
  SIMULATED: "amber",
  MISMATCH: "red",
  "ADVISORY ONLY": "violet",
  "OFFICER REVIEW": "slate",
};

const RISK_TONE = {
  LOW: "slate",
  MEDIUM: "amber",
  HIGH: "red",
};

/* ------------------------------------------------------------------ */
/* Small presentational components                                    */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }) {
  const tone = TONE_CLASSES[STATUS_TONE[status] || "slate"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold tracking-wide ${tone.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {status}
    </span>
  );
}

function RiskBadge({ risk }) {
  const tone = TONE_CLASSES[RISK_TONE[risk] || "slate"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${tone.badge}`}
    >
      {risk} RISK
    </span>
  );
}

function CategoryTag({ category }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
      {category}
    </span>
  );
}

function ActorBadge({ actor, actorType }) {
  const iconMap = {
    Officer: User,
    System: Server,
    AI: Bot,
  };
  const Icon = iconMap[actorType] || Server;
  const styleMap = {
    Officer: "bg-blue-50 text-blue-700",
    System: "bg-slate-100 text-slate-600",
    AI: "bg-violet-50 text-violet-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${
        styleMap[actorType] || "bg-slate-100 text-slate-600"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {actor}
    </span>
  );
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  const t = TONE_CLASSES[tone] || TONE_CLASSES.slate;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.icon}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-xl font-semibold text-slate-900 leading-none">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function NoteCallout({ note }) {
  const tone = TONE_CLASSES[note.tone] || TONE_CLASSES.slate;
  return (
    <div className={`mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${tone.badge}`}>
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <p>{note.text}</p>
    </div>
  );
}

function ComparisonBlock({ comparison }) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {comparison.declaredLabel}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {comparison.declaredValue}
        </p>
        <p className="mt-1 text-xs text-slate-500">{comparison.declaredSource}</p>
      </div>
      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-red-600">
          {comparison.documentLabel}
        </p>
        <p className="mt-1 text-sm font-semibold text-red-800">
          {comparison.documentValue}
        </p>
        <p className="mt-1 text-xs text-red-500">{comparison.documentSource}</p>
      </div>
    </div>
  );
}

function AdvisoryBlock({ advisory }) {
  return (
    <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 p-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-violet-600" />
        <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">
          Advisory only
        </p>
      </div>
      <p className="mt-1.5 text-sm text-violet-900">{advisory.text}</p>
    </div>
  );
}

function AuditEventCard({ event, isLast, expanded, onToggle }) {
  const tone = TONE_CLASSES[STATUS_TONE[event.status] || "slate"];
  const Icon = event.icon;
  const hasExpandableDetail = Boolean(event.metadata && event.metadata.length);

  return (
    <li className="relative pl-14">
      {!isLast && (
        <span
          className="absolute left-[22px] top-11 bottom-[-24px] w-px bg-slate-200"
          aria-hidden="true"
        />
      )}
      <span
        className={`absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-full border-2 bg-white ${
          event.highlight ? "border-red-300" : "border-slate-200"
        }`}
      >
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${tone.icon}`}>
          <Icon className="h-4 w-4" />
        </span>
      </span>

      <div
        className={`rounded-xl border bg-white p-4 shadow-sm transition-colors sm:p-5 ${
          event.highlight ? "border-red-200 ring-1 ring-red-100" : "border-slate-200"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">{event.timestamp}</p>
            <h3 className="mt-0.5 break-words text-sm font-semibold text-slate-900 sm:text-[15px]">
              {event.title}
            </h3>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge status={event.status} />
          </div>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-slate-600">{event.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ActorBadge actor={event.actor} actorType={event.actorType} />
          <CategoryTag category={event.category} />
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Hash className="h-3 w-3" />
            {event.id}
          </span>
        </div>

        {event.comparison && <ComparisonBlock comparison={event.comparison} />}
        {event.advisory && <AdvisoryBlock advisory={event.advisory} />}
        {event.note && <NoteCallout note={event.note} />}

        {hasExpandableDetail && (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => onToggle(event.id)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 rounded"
            >
              {expanded ? (
                <>
                  Hide event details <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  View event details <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </button>

            {expanded && (
              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {event.metadata.map((item) => (
                  <div key={item.label} className="flex items-baseline justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
                    <dt className="text-xs text-slate-500">{item.label}</dt>
                    <dd className="truncate text-xs font-medium text-slate-800">{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function AuditTrail() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Events");
  const [source, setSource] = useState("All");
  const [expandedIds, setExpandedIds] = useState(() => new Set(["AUD-0006", "AUD-0008"]));

  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return EVENTS.filter((event) => {
      const matchesCategory = category === "All Events" || event.category === category;
      const matchesSource = source === "All" || event.actorType === source;
      const matchesSearch =
        !query ||
        [event.title, event.description, event.actor, event.status, event.id]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesSource && matchesSearch;
    });
  }, [search, category, source]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              <FileClock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                Compliance Audit Trail
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Complete chronological record of document checks, system assessments and
                officer actions.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
          >
            <Download className="h-4 w-4" />
            Export audit record
          </button>
        </div>

        {/* Read-only notice */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Read-only compliance history</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Audit events are displayed as an ordered compliance record. This interface does
              not edit or rewrite past events.
            </p>
          </div>
        </div>

        {/* Bidder context card */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-slate-900">{BIDDER.name}</h2>
                <p className="text-xs text-slate-500">{BIDDER.bidderId}</p>
                <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-xs text-slate-500 sm:grid-cols-2">
                  <p>
                    Tender: <span className="font-medium text-slate-700">{BIDDER.tenderId}</span>
                  </p>
                  <p>
                    GSTIN: <span className="font-medium text-slate-700">{BIDDER.gstin}</span>
                  </p>
                  <p>
                    Tender name:{" "}
                    <span className="font-medium text-slate-700">{BIDDER.tenderName}</span>
                  </p>
                  <p>
                    Category: <span className="font-medium text-slate-700">{BIDDER.category}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end lg:gap-2">
              <div className="flex items-center gap-2">
                <RiskBadge risk={BIDDER.risk} />
                <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  Compliance {BIDDER.complianceScore}/100
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                <ShieldAlert className="h-3.5 w-3.5" />
                {BIDDER.reviewState}
              </span>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SUMMARY_STATS.map((stat) => (
            <SummaryCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Honesty legend */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-800">Honesty framework</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Every event below is labelled with what kind of check actually took place.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HONESTY_LEGEND.map((item) => {
              const tone = TONE_CLASSES[item.tone];
              return (
                <div key={item.code} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${tone.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                    {item.code}
                  </span>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search / filters */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search audit events..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Category</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                >
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white p-1">
                {SOURCES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSource(item)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 ${
                      source === item
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline + context panel */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <Layers className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-800">Audit event timeline</h2>
              <span className="ml-auto text-xs text-slate-400">
                {filteredEvents.length} of {EVENTS.length} events
              </span>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                  <Search className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No audit events found
                </p>
                <p className="mt-1 max-w-xs text-xs text-slate-500">
                  Try changing your search query or selected audit filters.
                </p>
              </div>
            ) : (
              <ol className="space-y-6">
                {filteredEvents.map((event, index) => (
                  <AuditEventCard
                    key={event.id}
                    event={event}
                    isLast={index === filteredEvents.length - 1}
                    expanded={expandedIds.has(event.id)}
                    onToggle={toggleExpanded}
                  />
                ))}
              </ol>
            )}
          </div>

          {/* Right context panel */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-xl border border-red-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <h3 className="text-sm font-semibold text-slate-800">Active issue</h3>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-900">
                OEM Authorization Mismatch
              </p>
              <div className="mt-3">
                <StatusBadge status="MISMATCH" />
              </div>

              <dl className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Confidence</dt>
                  <dd className="font-semibold text-slate-800">91%</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Declared</dt>
                  <dd className="font-medium text-slate-800">31 Dec 2026</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Document</dt>
                  <dd className="font-medium text-red-700">30 Sep 2026</dd>
                </div>
              </dl>

              <div className="mt-4 rounded-lg bg-slate-50 p-3">
                <p className="text-xs leading-relaxed text-slate-600">
                  Final decision remains with the Procurement Officer.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
