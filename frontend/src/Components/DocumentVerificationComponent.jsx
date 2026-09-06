import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  FileText,
  FileCheck2,
  FileWarning,
  FileClock,
  X,
  CheckCircle2,
  BadgeCheck,
  Circle,
  AlertTriangle,
  Info,
  ChevronDown,
  ScanLine,
  ClipboardList,
  ShieldCheck,
  Gauge,
  PlayCircle,
  Save,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* MOCK / DEMO DATA — SIMULATED DATA (no backend, no live API calls)  */
/* ------------------------------------------------------------------ */

const TENDERS = [
  {
    id: "t1",
    tenderId: "GEM/2026/B/18421",
    title: "Industrial Pumping Equipment",
    category: "Process Equipment",
    status: "ACTIVE",
  },
  {
    id: "t2",
    tenderId: "GEM/2026/B/19502",
    title: "Fire Safety Systems Supply",
    category: "Safety Equipment",
    status: "ACTIVE",
  },
];

const BIDDERS = [
  {
    id: "b1",
    name: "Apex Industrial Solutions",
    bidderId: "BID-18421-001",
    gstin: "07AABCA1234F1Z5",
  },
  {
    id: "b2",
    name: "Vantage Fabrication Pvt. Ltd.",
    bidderId: "BID-18421-002",
    gstin: "09AABCV5678K1Z2",
  },
];

const REQUIRED_DOCUMENTS = [
  { id: "gst", name: "GST Registration Certificate", requirementType: "Mandatory", status: "VERIFIED" },
  { id: "pan", name: "PAN Card", requirementType: "Mandatory", status: "VALIDATED" },
  { id: "udyam", name: "Udyam / MSME Certificate", requirementType: "Mandatory", status: "PENDING" },
  { id: "oem", name: "OEM Authorization", requirementType: "Mandatory", status: "PENDING" },
  { id: "epfo", name: "EPFO Registration", requirementType: "Mandatory", status: "PENDING" },
  { id: "esic", name: "ESIC Registration", requirementType: "Mandatory", status: "PENDING" },
  { id: "itr", name: "Income Tax Return", requirementType: "Mandatory", status: "VERIFIED" },
  { id: "declaration", name: "Bidder Declaration", requirementType: "Mandatory", status: "PENDING" },
];

const VERIFICATION_RESULTS = [
  {
    document: "GST Registration",
    declared: "07AABCA1234F1Z5",
    verified: "07AABCA1234F1Z5",
    source: "GST",
    status: "VERIFIED",
    confidence: 98,
  },
  {
    document: "PAN",
    declared: "AABCA1234F",
    verified: "AABCA1234F",
    source: "Local validation",
    status: "VALIDATED",
    confidence: 96,
  },
  {
    document: "Udyam / MSME",
    declared: "UDYAM-DL-00-1234567",
    verified: "Source unavailable in demo environment",
    source: "Sandbox",
    status: "SIMULATED",
    confidence: 94,
  },
  {
    document: "OEM Authorization",
    declared: "Valid until 31 Dec 2026",
    verified: "Document states 30 Sep 2026",
    source: "Uploaded document",
    status: "MISMATCH",
    confidence: 91,
  },
  {
    document: "EPFO Registration",
    declared: "Compliant",
    verified: "Source unavailable in demo environment",
    source: "EPFO",
    status: "SIMULATED",
    confidence: 89,
  },
  {
    document: "ESIC Registration",
    declared: "Compliant",
    verified: "Source unavailable in demo environment",
    source: "ESIC",
    status: "SIMULATED",
    confidence: 90,
  },
  {
    document: "Income Tax Return",
    declared: "FY 2024-25 filed",
    verified: "FY 2024-25 filed",
    source: "Uploaded document",
    status: "VERIFIED",
    confidence: 95,
  },
  {
    document: "Bidder Declaration",
    declared: "Signed and submitted",
    verified: "Signed and submitted",
    source: "Uploaded document",
    status: "VERIFIED",
    confidence: 97,
  },
];

const EXTRACTION_SUMMARY = {
  submitted: 8,
  extracted: 7,
  failed: 1,
  avgConfidence: 94.1,
};

const PIPELINE_STAGES = [
  { key: "uploading", label: "Uploading" },
  { key: "ocr", label: "OCR Extracting" },
  { key: "verifying", label: "Verifying" },
  { key: "completed", label: "Completed" },
];

/* ------------------------------------------------------------------ */
/* STYLE HELPERS                                                       */
/* ------------------------------------------------------------------ */

const STATUS_STYLES = {
  VERIFIED: {
    icon: CheckCircle2,
    label: "VERIFIED",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  VALIDATED: {
    icon: BadgeCheck,
    label: "VALIDATED",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
  },
  SIMULATED: {
    icon: Circle,
    label: "SIMULATED",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
  },
  MISMATCH: {
    icon: AlertTriangle,
    label: "MISMATCH",
    classes: "bg-red-50 text-red-700 border-red-200",
  },
  PENDING: {
    icon: FileClock,
    label: "PENDING",
    classes: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status];
  if (!s) return null;
  const Icon = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide ${s.classes}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {s.label}
    </span>
  );
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SectionCard({ title, description, icon: Icon, children, id, className = "" }) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section
      aria-labelledby={headingId}
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}
    >
      <div className="mb-4 flex items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600">
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
        ) : null}
        <div>
          {headingId ? (
            <h2 id={headingId} className="text-base font-semibold text-slate-900 sm:text-lg">
              {title}
            </h2>
          ) : (
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h2>
          )}
          {description ? <p className="mt-0.5 text-sm text-slate-500">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                      */
/* ------------------------------------------------------------------ */

export default function DocumentVerification() {
  const [selectedTenderId, setSelectedTenderId] = useState(TENDERS[0].id);
  const [selectedBidderId, setSelectedBidderId] = useState(BIDDERS[0].id);
  const [isDragOver, setIsDragOver] = useState(false);
  const [queue, setQueue] = useState([]);
  const [actionMessage, setActionMessage] = useState(null);

  const fileInputRef = useRef(null);
  const intervalsRef = useRef(new Map());
  const nextIdRef = useRef(1);

  const selectedTender = useMemo(
    () => TENDERS.find((t) => t.id === selectedTenderId) || TENDERS[0],
    [selectedTenderId]
  );
  const selectedBidder = useMemo(
    () => BIDDERS.find((b) => b.id === selectedBidderId) || BIDDERS[0],
    [selectedBidderId]
  );

  useEffect(() => {
    return () => {
      intervalsRef.current.forEach((interval) => clearInterval(interval));
      intervalsRef.current.clear();
    };
  }, []);

  const updateQueueItem = (id, patch) => {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const runPipeline = (id) => {
    let stageIndex = 0;
    let progress = 0;

    updateQueueItem(id, { stageIndex: 0, progress: 0 });

    const interval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        progress = 100;
        updateQueueItem(id, { progress });
        if (stageIndex < PIPELINE_STAGES.length - 1) {
          stageIndex += 1;
          progress = 0;
          updateQueueItem(id, { stageIndex, progress: 0 });
        } else {
          clearInterval(interval);
          intervalsRef.current.delete(id);
        }
      } else {
        updateQueueItem(id, { progress });
      }
    }, 180);

    intervalsRef.current.set(id, interval);
  };

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const newItems = files.map((file) => {
      const id = nextIdRef.current++;
      return {
        id,
        name: file.name,
        size: file.size,
        type: file.type || "Unknown",
        stageIndex: 0,
        progress: 0,
      };
    });

    setQueue((prev) => [...prev, ...newItems]);
    newItems.forEach((item) => runPipeline(item.id));
  };

  const handleBrowseChange = (event) => {
    addFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    addFiles(event.dataTransfer.files);
  };

  const handleRemove = (id) => {
    const interval = intervalsRef.current.get(id);
    if (interval) {
      clearInterval(interval);
      intervalsRef.current.delete(id);
    }
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleDropzoneKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  };

  const verifiedRequiredCount = REQUIRED_DOCUMENTS.filter(
    (d) => d.status === "VERIFIED" || d.status === "VALIDATED"
  ).length;

  const flagCount = VERIFICATION_RESULTS.filter(
    (r) => r.status === "SIMULATED" || r.status === "MISMATCH"
  ).length;

  const handleRunVerification = () => {
    setActionMessage({
      type: "info",
      text: "Verification run started for the selected tender and bidder. Results below reflect the latest simulated run.",
    });
  };

  const handleSaveRecord = () => {
    setActionMessage({
      type: "success",
      text: "Verification record saved to the case file. This is a demo action — no backend record was created.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* ---------------------------------------------------------- */}
        {/* PAGE HEADER                                                 */}
        {/* ---------------------------------------------------------- */}
        <div className="mb-6">
          <p className="text-xs font-medium text-slate-400">Workspace / Document Verification</p>

          <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Document Verification</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Upload and verify bidder documents against tender requirements.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden="true" />
                Demo Environment
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-amber-700">
                <Circle className="h-3 w-3 shrink-0" aria-hidden="true" />
                SIMULATED DATA
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* -------------------------------------------------------- */}
          {/* TENDER & BIDDER SELECTION                                  */}
          {/* -------------------------------------------------------- */}
          <SectionCard
            id="context"
            title="Verification Context"
            description="Select the tender and bidder whose documents you want to verify."
            icon={ClipboardList}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="tender-select" className="block text-xs font-medium text-slate-500">
                  Tender
                </label>
                <div className="relative mt-1">
                  <select
                    id="tender-select"
                    value={selectedTenderId}
                    onChange={(e) => setSelectedTenderId(e.target.value)}
                    className="w-full appearance-none rounded-md border border-slate-300 bg-white py-2.5 pl-3 pr-9 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    {TENDERS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tenderId} — {t.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-2 text-sm font-medium text-slate-800">{selectedTender.title}</p>
                <p className="text-xs text-slate-500">
                  Category: {selectedTender.category} &middot; Status: {selectedTender.status}
                </p>
              </div>

              <div>
                <label htmlFor="bidder-select" className="block text-xs font-medium text-slate-500">
                  Bidder
                </label>
                <div className="relative mt-1">
                  <select
                    id="bidder-select"
                    value={selectedBidderId}
                    onChange={(e) => setSelectedBidderId(e.target.value)}
                    className="w-full appearance-none rounded-md border border-slate-300 bg-white py-2.5 pl-3 pr-9 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    {BIDDERS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} — {b.bidderId}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-2 text-sm font-medium text-slate-800">{selectedBidder.name}</p>
                <p className="text-xs text-slate-500">GSTIN: {selectedBidder.gstin}</p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50 px-3.5 py-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-blue-800">
                Documents will be verified against the selected tender's applicable compliance
                requirements.
              </p>
            </div>
          </SectionCard>

          {/* -------------------------------------------------------- */}
          {/* REQUIRED DOCUMENTS                                          */}
          {/* -------------------------------------------------------- */}
          <SectionCard
            id="required-documents"
            title="Required Documents"
            description="Compliance documents required for this tender."
            icon={ShieldCheck}
          >
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
              {REQUIRED_DOCUMENTS.map((doc) => (
                <li
                  key={doc.id}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{doc.name}</p>
                      <p className="text-xs text-slate-400">{doc.requirementType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-6 sm:pl-0">
                    <StatusBadge status={doc.status} />
                    {doc.status === "PENDING" ? (
                      <button
                        type="button"
                        onClick={openFilePicker}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                      >
                        Upload
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* -------------------------------------------------------- */}
          {/* DOCUMENT UPLOAD AREA                                        */}
          {/* -------------------------------------------------------- */}
          <SectionCard id="upload" title="Upload Documents" icon={Upload}>
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload documents: drop files here or press enter to browse"
              onClick={openFilePicker}
              onKeyDown={handleDropzoneKeyDown}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                isDragOver ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <Upload className="h-8 w-8 text-blue-500" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-slate-800">Drop documents here</p>
              <p className="mt-1 text-sm text-slate-500">
                or{" "}
                <span className="font-medium text-blue-600 underline underline-offset-2">
                  browse files
                </span>
              </p>
              <p className="mt-3 text-xs text-slate-400">
                PDF, JPG, JPEG, PNG &middot; Maximum 10 MB per file
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleBrowseChange}
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>
          </SectionCard>

          {/* -------------------------------------------------------- */}
          {/* UPLOAD QUEUE / PROCESSING STATUS                            */}
          {/* -------------------------------------------------------- */}
          <SectionCard
            id="queue"
            title="Verification Queue"
            description="Simulated processing pipeline for uploaded documents."
            icon={ScanLine}
          >
            {queue.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
                No documents uploaded yet. Uploaded files will appear here with live processing
                status.
              </p>
            ) : (
              <ul className="space-y-3">
                {queue.map((item) => {
                  const stage = PIPELINE_STAGES[item.stageIndex];
                  const isCompleted = item.stageIndex === PIPELINE_STAGES.length - 1 && item.progress === 100;
                  return (
                    <li key={item.id} className="rounded-lg border border-slate-200 p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <FileText className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">{item.name}</p>
                            <p className="text-xs text-slate-400">
                              {formatFileSize(item.size)} &middot; {item.type}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1.5">
                          {isCompleted ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                          ) : (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500 motion-reduce:animate-none" aria-hidden="true" />
                          )}
                          {stage.label}
                        </span>
                        <span>{item.progress}%</span>
                      </div>
                      <div
                        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-valuenow={item.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${item.name} ${stage.label} progress`}
                      >
                        <div
                          className={`h-full rounded-full transition-[width] duration-150 ${
                            isCompleted ? "bg-emerald-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          {/* -------------------------------------------------------- */}
          {/* OCR / EXTRACTION SUMMARY                                    */}
          {/* -------------------------------------------------------- */}
          <SectionCard id="extraction-summary" title="Extraction Summary" icon={FileCheck2}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                <p className="text-lg font-semibold text-slate-800">{EXTRACTION_SUMMARY.submitted}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Submitted</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
                <p className="text-lg font-semibold text-emerald-700">{EXTRACTION_SUMMARY.extracted}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600">Extracted</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
                <p className="text-lg font-semibold text-red-700">{EXTRACTION_SUMMARY.failed}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-red-600">Failed</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
                <p className="text-lg font-semibold text-blue-700">{EXTRACTION_SUMMARY.avgConfidence}%</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-blue-600">Avg. Confidence</p>
              </div>
            </div>
            {EXTRACTION_SUMMARY.failed > 0 ? (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                <p className="text-xs leading-relaxed text-amber-800">
                  {EXTRACTION_SUMMARY.failed} document requires manual review.
                </p>
              </div>
            ) : null}
          </SectionCard>

          {/* -------------------------------------------------------- */}
          {/* VERIFICATION RESULTS                                        */}
          {/* -------------------------------------------------------- */}
          <SectionCard
            id="results"
            title="Verification Results"
            description="Declared vs. verified information for each submitted document."
            icon={Gauge}
          >
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-lg border border-slate-200 md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-4 py-2.5">Document</th>
                    <th scope="col" className="px-4 py-2.5">Declared</th>
                    <th scope="col" className="px-4 py-2.5">Extracted / Verified</th>
                    <th scope="col" className="px-4 py-2.5">Source</th>
                    <th scope="col" className="px-4 py-2.5">Status</th>
                    <th scope="col" className="px-4 py-2.5">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {VERIFICATION_RESULTS.map((row) => (
                    <tr
                      key={row.document}
                      className={row.status === "MISMATCH" ? "bg-red-50/60" : "bg-white"}
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">{row.document}</td>
                      <td className="px-4 py-3 text-slate-600">{row.declared}</td>
                      <td className="px-4 py-3 text-slate-600">{row.verified}</td>
                      <td className="px-4 py-3 text-slate-500">{row.source}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.confidence}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile stacked cards */}
            <ul className="space-y-3 md:hidden">
              {VERIFICATION_RESULTS.map((row) => (
                <li
                  key={row.document}
                  className={`rounded-lg border p-3.5 ${
                    row.status === "MISMATCH" ? "border-red-200 bg-red-50/60" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{row.document}</p>
                    <StatusBadge status={row.status} />
                  </div>
                  <dl className="mt-2 space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">Declared</dt>
                      <dd className="text-right">{row.declared}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">Verified</dt>
                      <dd className="text-right">{row.verified}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">Source</dt>
                      <dd className="text-right">{row.source}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">Confidence</dt>
                      <dd className="text-right">{row.confidence}%</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* -------------------------------------------------------- */}
          {/* HONESTY / SOURCE LABEL LEGEND                               */}
          {/* -------------------------------------------------------- */}
          <SectionCard
            id="legend"
            title="Verification Method"
            description="What each status means for this demo environment."
            icon={Info}
          >
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <li className="rounded-lg border border-slate-200 p-3.5">
                <StatusBadge status="VERIFIED" />
                <p className="mt-2 text-xs text-slate-500">
                  Verified against a real authoritative or external source.
                </p>
              </li>
              <li className="rounded-lg border border-slate-200 p-3.5">
                <StatusBadge status="VALIDATED" />
                <p className="mt-2 text-xs text-slate-500">
                  Locally validated using format and logic checks — no external source consulted.
                </p>
              </li>
              <li className="rounded-lg border border-slate-200 p-3.5">
                <StatusBadge status="SIMULATED" />
                <p className="mt-2 text-xs text-slate-500">
                  External source is not connected in this demo; result is sandbox/mock data.
                </p>
              </li>
              <li className="rounded-lg border border-slate-200 p-3.5">
                <StatusBadge status="MISMATCH" />
                <p className="mt-2 text-xs text-slate-500">
                  Declared bidder information and verification/source information disagree.
                </p>
              </li>
            </ul>
          </SectionCard>

          {/* -------------------------------------------------------- */}
          {/* ACTION AREA                                                 */}
          {/* -------------------------------------------------------- */}
          <SectionCard id="action" title="Verification Summary" icon={FileWarning}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  Compliance progress:{" "}
                  <span className="font-semibold text-slate-800">
                    {verifiedRequiredCount} / {REQUIRED_DOCUMENTS.length} documents verified
                  </span>
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-amber-600">
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {flagCount} flags require officer review
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleRunVerification}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:w-auto"
                >
                  <PlayCircle className="h-4 w-4" aria-hidden="true" />
                  Run Verification
                </button>
                <button
                  type="button"
                  onClick={handleSaveRecord}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:w-auto"
                >
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Save Verification Record
                </button>
              </div>
            </div>

            {actionMessage ? (
              <div
                role="status"
                className={`mt-4 flex items-start gap-2 rounded-md border px-3.5 py-2.5 ${
                  actionMessage.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-blue-200 bg-blue-50 text-blue-800"
                }`}
              >
                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p className="text-xs leading-relaxed">{actionMessage.text}</p>
              </div>
            ) : null}

            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
              Final qualification/disqualification remains with the Procurement Officer.
            </p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
