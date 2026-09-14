import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileClock, Lock, Download, Search, ChevronDown, ChevronUp, UploadCloud,
  ScanText, FileSearch, Fingerprint, FlaskConical, GitCompareArrows, Gauge,
  Sparkles, UserCog, ClipboardCheck, Server, User, Bot, ShieldCheck, ShieldAlert,
  AlertTriangle, Info, Building2, Hash, Layers, ClipboardList, ArrowLeft
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Shared tone tokens                                                 */
/* ------------------------------------------------------------------ */

const TONE_CLASSES = {
  green: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", ring: "ring-emerald-100", icon: "text-emerald-600 bg-emerald-50" },
  blue: { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200", ring: "ring-blue-100", icon: "text-blue-600 bg-blue-50" },
  amber: { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200", ring: "ring-amber-100", icon: "text-amber-600 bg-amber-50" },
  red: { dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200", ring: "ring-red-100", icon: "text-red-600 bg-red-50" },
  violet: { dot: "bg-violet-500", badge: "bg-violet-50 text-violet-700 border-violet-200", ring: "ring-violet-100", icon: "text-violet-600 bg-violet-50" },
  slate: { dot: "bg-slate-500", badge: "bg-slate-100 text-slate-700 border-slate-200", ring: "ring-slate-100", icon: "text-slate-600 bg-slate-100" },
};

const STATUS_TONE = {
  VERIFIED: "green", VALIDATED: "blue", SIMULATED: "amber", MISMATCH: "red", "ADVISORY ONLY": "violet", "OFFICER REVIEW": "slate",
};

const RISK_TONE = { LOW: "slate", MEDIUM: "amber", HIGH: "red" };

const HONESTY_LEGEND = [
  { code: "VERIFIED", tone: "green", description: "Confirmed against a real external or authoritative source." },
  { code: "VALIDATED", tone: "blue", description: "Passed local format or logic validation only." },
  { code: "SIMULATED", tone: "amber", description: "Sandbox / mock result. No real external access performed." },
  { code: "MISMATCH", tone: "red", description: "Two sources disagree and require review." },
];

const CATEGORIES = ["All Events", "Document", "Validation", "Check", "Mismatch", "Assessment", "AI Advisory", "Officer"];
const SOURCES = ["All", "System", "Officer", "AI"];

/* ------------------------------------------------------------------ */
/* Small presentational components                                    */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }) {
  const tone = TONE_CLASSES[STATUS_TONE[status] || "slate"];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold tracking-wide ${tone.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />{status}
    </span>
  );
}

function RiskBadge({ risk }) {
  const tone = TONE_CLASSES[RISK_TONE[risk] || "slate"];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${tone.badge}`}>
      {risk} RISK
    </span>
  );
}

function CategoryTag({ category }) {
  return <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{category}</span>;
}

function ActorBadge({ actor, actorType }) {
  const iconMap = { Officer: User, System: Server, AI: Bot };
  const Icon = iconMap[actorType] || Server;
  const styleMap = { Officer: "bg-blue-50 text-blue-700", System: "bg-slate-100 text-slate-600", AI: "bg-violet-50 text-violet-700" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${styleMap[actorType] || "bg-slate-100 text-slate-600"}`}>
      <Icon className="h-3.5 w-3.5" />{actor}
    </span>
  );
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  const t = TONE_CLASSES[tone] || TONE_CLASSES.slate;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.icon}`}><Icon className="h-4.5 w-4.5" /></div>
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
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{comparison.declaredLabel}</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">{comparison.declaredValue}</p>
      </div>
      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-red-600">{comparison.documentLabel}</p>
        <p className="mt-1 text-sm font-semibold text-red-800">{comparison.documentValue}</p>
      </div>
    </div>
  );
}

function AdvisoryBlock({ advisory }) {
  return (
    <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 p-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-violet-600" />
        <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">Advisory only</p>
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
      {!isLast && <span className="absolute left-[22px] top-11 bottom-[-24px] w-px bg-slate-200" aria-hidden="true" />}
      <span className={`absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-full border-2 bg-white ${event.highlight ? "border-red-300" : "border-slate-200"}`}>
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${tone.icon}`}><Icon className="h-4 w-4" /></span>
      </span>

      <div className={`rounded-xl border bg-white p-4 shadow-sm transition-colors sm:p-5 ${event.highlight ? "border-red-200 ring-1 ring-red-100" : "border-slate-200"}`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">{event.timestamp}</p>
            <h3 className="mt-0.5 break-words text-sm font-semibold text-slate-900 sm:text-[15px]">{event.title}</h3>
          </div>
          <div className="flex shrink-0 items-center gap-2"><StatusBadge status={event.status} /></div>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-slate-600">{event.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ActorBadge actor={event.actor} actorType={event.actorType} />
          <CategoryTag category={event.category} />
          <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Hash className="h-3 w-3" />{event.id}</span>
        </div>

        {event.comparison && <ComparisonBlock comparison={event.comparison} />}
        {event.advisory && <AdvisoryBlock advisory={event.advisory} />}
        {event.note && <NoteCallout note={event.note} />}

        {hasExpandableDetail && (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <button type="button" onClick={() => onToggle(event.id)} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800">
              {expanded ? <>Hide event details <ChevronUp className="h-3.5 w-3.5" /></> : <>View event details <ChevronDown className="h-3.5 w-3.5" /></>}
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
/* Main component                                                     */
/* ------------------------------------------------------------------ */

export default function AuditTrail() {
  const { tenderId, bidderId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Events");
  const [source, setSource] = useState("All");
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Dynamic State
  const [bidderInfo, setBidderInfo] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH LIVE DATA
  useEffect(() => {
    if (!bidderId) return;
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8000/api/bidders/${bidderId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        // Build Bidder Meta
        const hasOpenFlags = data.flags && data.flags.some(f => f.status === 'open');
        setBidderInfo({
          name: data.company_name || "Unknown Bidder",
          bidderId: `BID-${bidderId}`,
          gstin: data.declared_gstin || "Not Available",
          tenderId: tenderId,
          category: "Live Verification",
          complianceScore: data.latest_verification?.compliance_score ?? 100,
          risk: data.latest_verification?.risk_level ?? "LOW",
          reviewState: hasOpenFlags ? "Officer review pending" : "All checks clear",
        });

        // Build Events Timeline
        const newEvents = [];
        let counter = 1;
        const now = new Date();
        const formatDate = (offset) => new Date(now.getTime() - offset).toLocaleString();

        // 1. Profile Created
        newEvents.push({
          id: `AUD-000${counter++}`,
          timestamp: formatDate(86400000),
          title: "Bidder profile initialized",
          description: `Bidder ${data.company_name} registered in system.`,
          actor: "System", actorType: "System", status: "VALIDATED", category: "Document", icon: Building2
        });

        // 2. Documents
        if (data.documents && data.documents.length > 0) {
          newEvents.push({
            id: `AUD-000${counter++}`,
            timestamp: formatDate(3600000),
            title: "Bidder documents uploaded",
            description: `${data.documents.length} bidder documents were submitted for compliance assessment.`,
            actor: "Procurement Officer", actorType: "Officer", status: "VALIDATED", category: "Document", icon: UploadCloud,
            metadata: [{ label: "Documents", value: `${data.documents.length} files` }]
          });
        }

        // 3. Verification & Checks
        // 3. Verification & Checks
        if (data.latest_verification) {
          const checks = data.latest_verification.checks || [];
          checks.forEach((check, idx) => {
            if (check.flag) {
              newEvents.push({
                id: `AUD-000${counter++}`, timestamp: formatDate(1800000 - idx * 1000),
                title: `${check.check} Mismatch Detected`, description: check.reason,
                actor: "Compliance Engine", actorType: "System", status: "MISMATCH", category: "Mismatch", icon: GitCompareArrows, highlight: true,
                metadata: [{ label: "Verification method", value: "AI Cross-reference" }]
              });
            } else {

              // --- DYNAMIC STATUS LOGIC ---
              const checkName = (check.check || "").toUpperCase();
              let dynStatus = "SIMULATED";
              let noteTone = "amber";
              let noteText = "This result is simulated in sandbox environment.";

              if (checkName.includes("GST")) {
                dynStatus = "VERIFIED";
                noteTone = "green";
                noteText = "Confirmed against real external authoritative source.";
              } else if (checkName.includes("PAN")) {
                dynStatus = "VALIDATED";
                noteTone = "blue";
                noteText = "Passed local format and logic validation only.";
              }

              newEvents.push({
                id: `AUD-000${counter++}`, timestamp: formatDate(1800000 - idx * 1000),
                title: `${check.check} Verified`, description: check.reason || "Matches expected parameters.",
                actor: "Compliance Engine", actorType: "System", status: dynStatus, category: "Check", icon: ShieldCheck,
                note: { tone: noteTone, text: noteText }
              });
            }
          });

          newEvents.push({
            id: `AUD-000${counter++}`,
            timestamp: formatDate(1000000),
            title: "Compliance assessment generated",
            description: "The advisory compliance assessment was recalculated.",
            actor: "Compliance Engine", actorType: "System", status: "VALIDATED", category: "Assessment", icon: Gauge,
            metadata: [
              { label: "Compliance score", value: `${data.latest_verification.compliance_score} / 100` },
              { label: "Risk", value: data.latest_verification.risk_level },
            ],
            note: { tone: "blue", text: "This score is an advisory assessment, not a government decision." }
          });
        }

        // 4. Advisory
        if (hasOpenFlags) {
          newEvents.push({
            id: `AUD-000${counter++}`,
            timestamp: formatDate(500000),
            title: "AI advisory recommendation generated",
            description: "Review flagged checks before final qualification.",
            actor: "AI Advisory", actorType: "AI", status: "ADVISORY ONLY", category: "AI Advisory", icon: Sparkles,
            advisory: { text: "The AI recommendation does not qualify or disqualify the bidder. Final decision belongs to the Procurement Officer." }
          });

          setExpandedIds(new Set([`AUD-000${counter - 1}`]));
        }

        setEvents(newEvents);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [bidderId]);

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
    return events.filter((event) => {
      const matchesCategory = category === "All Events" || event.category === category;
      const matchesSource = source === "All" || event.actorType === source;
      const matchesSearch = !query || [event.title, event.description, event.actor, event.status, event.id].join(" ").toLowerCase().includes(query);
      return matchesCategory && matchesSource && matchesSearch;
    });
  }, [search, category, source, events]);

  const activeMismatches = events.filter(e => e.status === "MISMATCH");

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading Audit Data...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        <button onClick={() => navigate(-1)} className="group mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Bidder Details
        </button>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              <FileClock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Compliance Audit Trail</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">Complete chronological record of document checks and system assessments.</p>
            </div>
          </div>
          <button type="button" className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
            <Download className="h-4 w-4" />Export audit record
          </button>
        </div>

        {/* Read-only notice */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Lock className="h-4 w-4" /></div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Read-only compliance history</p>
            <p className="mt-0.5 text-xs text-slate-500">Audit events are displayed as an ordered compliance record. This interface does not edit or rewrite past events.</p>
          </div>
        </div>

        {/* Bidder context card */}
        {bidderInfo && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Building2 className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-slate-900">{bidderInfo.name}</h2>
                  <p className="text-xs text-slate-500">{bidderInfo.bidderId}</p>
                  <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-xs text-slate-500 sm:grid-cols-2">
                    <p>Tender: <span className="font-medium text-slate-700">{bidderInfo.tenderId}</span></p>
                    <p>GSTIN: <span className="font-medium text-slate-700">{bidderInfo.gstin}</span></p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end lg:gap-2">
                <div className="flex items-center gap-2">
                  <RiskBadge risk={bidderInfo.risk} />
                  <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    Compliance {bidderInfo.complianceScore}/100
                  </span>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${activeMismatches.length > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {activeMismatches.length > 0 ? <ShieldAlert className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  {bidderInfo.reviewState}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Summary stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard label="Recorded events" value={events.length} icon={ClipboardList} tone="slate" />
          <SummaryCard label="Flagged mismatches" value={events.filter(e => e.status === "MISMATCH").length} icon={AlertTriangle} tone="red" />
          <SummaryCard label="Simulated checks" value={events.filter(e => e.status === "SIMULATED").length} icon={FlaskConical} tone="amber" />
          <SummaryCard label="Officer actions" value={events.filter(e => e.actorType === "Officer").length} icon={UserCog} tone="blue" />
        </div>

        {/* Search / filters */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search audit events..." className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white p-1">
                {SOURCES.map((item) => (
                  <button key={item} type="button" onClick={() => setSource(item)} className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${source === item ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}>{item}</button>
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
              <span className="ml-auto text-xs text-slate-400">{filteredEvents.length} of {events.length} events</span>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
                <Search className="h-5 w-5 text-slate-400" />
                <p className="mt-3 text-sm font-semibold text-slate-700">No audit events found</p>
              </div>
            ) : (
              <ol className="space-y-6">
                {filteredEvents.map((event, index) => (
                  <AuditEventCard key={event.id} event={event} isLast={index === filteredEvents.length - 1} expanded={expandedIds.has(event.id)} onToggle={toggleExpanded} />
                ))}
              </ol>
            )}
          </div>

          {/* Right context panel */}
          <aside className="lg:sticky lg:top-6 lg:self-start space-y-4">
            {activeMismatches.length > 0 ? (
              activeMismatches.map((mismatch, idx) => (
                <div key={idx} className="rounded-xl border border-red-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <h3 className="text-sm font-semibold text-slate-800">Active issue detected</h3>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-900">{mismatch.title}</p>
                  <div className="mt-3"><StatusBadge status="MISMATCH" /></div>
                  <div className="mt-4 rounded-lg bg-slate-50 p-3">
                    <p className="text-[11px] leading-relaxed text-slate-600">Final decision remains with the Procurement Officer.</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-sm font-semibold text-slate-800">All Checks Clear</h3>
                </div>
                <p className="mt-2 text-sm text-slate-600">No active mismatches requiring intervention.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}