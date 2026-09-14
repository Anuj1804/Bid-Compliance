import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Upload, FileText, FileCheck2, FileWarning, FileClock, X, CheckCircle2,
  BadgeCheck, Circle, AlertTriangle, Info, ClipboardList, ShieldCheck, PlayCircle
} from "lucide-react";
const PIPELINE_STAGES = [
  { key: "uploading", label: "Uploading" },
  { key: "ocr", label: "OCR Extracting" },
  { key: "verifying", label: "Verifying" },
  { key: "completed", label: "Completed" },
];
const STATUS_STYLES = {
  VERIFIED: {
    icon: CheckCircle2,
    label: "VERIFIED",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  VALIDATED: {
    icon: BadgeCheck,
    label: "VALIDATED",
    classes: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  SIMULATED: {
    icon: Circle,
    label: "SIMULATED",
    classes: "bg-orange-50 text-orange-700 border-orange-200",
  },
  MISMATCH: {
    icon: AlertTriangle,
    label: "MISMATCH",
    classes: "bg-red-50 text-red-700 border-red-200",
  },
  UNVERIFIED: {
    icon: AlertTriangle,
    label: "UNVERIFIED",
    classes: "bg-red-50 text-red-700 border-red-200",
  },
  RESOLVED: {
    icon: CheckCircle2,
    label: "RESOLVED",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PENDING: {
    icon: FileClock,
    label: "PENDING",
    classes: "bg-slate-100 text-slate-600 border-slate-200"
  },
};
function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide ${s.classes}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {s.label}
    </span>
  );
}
function SectionCard({ title, description, icon: Icon, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}>
      <div className="mb-4 flex items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600">
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
        )}
        <div>
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
export default function DocumentVerification() {
  const navigate = useNavigate();
  const { tenderId, bidderId } = useParams();
  const [isDragOver, setIsDragOver] = useState(false);
  const [queue, setQueue] = useState([]);
  const [actionMessage, setActionMessage] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState("");
  const [previewDoc, setPreviewDoc] = useState(null); // stores { url, name } for preview
  const [bidderInfo, setBidderInfo] = useState(null);
  const [liveVerification, setLiveVerification] = useState(null); 
  useEffect(() => {
    if (!bidderId) return;
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8000/api/bidders/${bidderId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => setBidderInfo(data))
      .catch((err) => console.error(err));
  }, [bidderId]);
  const fileInputRef = useRef(null);
  const [explicitUploadType, setExplicitUploadType] = useState(null);
  const nextIdRef = useRef(1);
  const activeResult = liveVerification || bidderInfo?.latest_verification;
  const activeChecks = activeResult?.checks || [];
  const activeFlags = bidderInfo?.flags || [];
  const getCheckDisplayStatus = (docType) => {
    const check = activeChecks.find((c) => c.check.toLowerCase().includes(docType.toLowerCase()));
    if (!check) return "PENDING";
    if (check.flag) {
      const resolved = activeFlags.find((f) => f.check_type === check.check && f.status === "resolved");
      if (resolved) return "RESOLVED";
      return "MISMATCH";
    }
    return check.status || "VERIFIED"; 
  };
  const updateQueueItem = (id, patch) => {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };
  const runPipeline = async (queueItem) => {
    const { file, id, docType } = queueItem;
    updateQueueItem(id, { stageIndex: 0, progress: 30 });
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", docType);
      
      updateQueueItem(id, { stageIndex: 1, progress: 60 });
      const uploadResp = await fetch(`http://localhost:8000/api/bidders/${bidderId}/documents`, {
        method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: formData,
      });
      
      if (!uploadResp.ok) throw new Error("Upload failed");
      const docResult = await uploadResp.json();
      updateQueueItem(id, { stageIndex: 3, progress: 100, extractedFields: docResult.extracted_fields });
    } catch (err) {
      updateQueueItem(id, { stageIndex: 3, progress: 100, error: err.message });
      setActionMessage({ type: "error", text: `Failed: ${err.message}` });
    }
  };
  const handleRunVerification = async () => {
    setIsVerifying(true);
    setActionMessage(null);
    try {
      // 1. Process staged files first
      const stagedItems = queue.filter(item => item.stageIndex === 0);
      if (stagedItems.length > 0) {
        setVerificationStep("Uploading & Scanning documents (this may take 1-2 mins)...");
        await Promise.all(stagedItems.map(item => runPipeline(item)));
      }

      // 2. Now run the actual verification cross-check
      setVerificationStep("Cross-checking AI extracted data with Government Sandbox...");
      const token = localStorage.getItem("token");
      const verifyResp = await fetch(`http://localhost:8000/api/bidders/${bidderId}/verify`, {
        method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!verifyResp.ok) throw new Error("Verification failed");
      
      setVerificationStep("Finalizing risk assessment...");
      const verifyResult = await verifyResp.json();
      
      // Update local state instantly with new result
      setLiveVerification(verifyResult);
      
      // Also silently refresh the full bidderInfo to get fresh flags
      fetch(`http://localhost:8000/api/bidders/${bidderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then(r => r.json()).then(data => setBidderInfo(data)).catch(() => {});

      setActionMessage({ type: "success", text: "Verification complete! Summary updated." });
    } catch (err) {
      setActionMessage({ type: "error", text: `Failed: ${err.message}` });
    } finally {
      setIsVerifying(false);
      setVerificationStep("");
    }
  };
  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    const newItems = files.map((file) => {
      const id = nextIdRef.current++;
      let docType = explicitUploadType || "GST";
      if (!explicitUploadType) {
        const lowerName = file.name.toLowerCase();
        if (lowerName.includes("pan")) docType = "PAN";
        else if (lowerName.includes("udyam")) docType = "UDYAM";
        else if (lowerName.includes("oem")) docType = "OEM";
      }
      return { id, file: file, name: file.name, size: file.size, stageIndex: 0, progress: 0, docType };
    });
    setQueue((prev) => [...prev, ...newItems]);
    setExplicitUploadType(null); 
    // Files are now just staged. We do NOT run the pipeline automatically anymore.
  };
  const openFilePicker = (docType = null) => {
    if (docType) setExplicitUploadType(docType);
    fileInputRef.current?.click();
  };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* HEADER */}
        <div className="mb-6">
          <p className="text-xs font-medium text-slate-400">Workspace / Document Verification</p>
          <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Document Verification Lab</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">Upload new documents to actively re-run AI compliance checks.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-700">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                LIVE WORKSPACE
              </span>
            </div>
          </div>
        </div>
        {actionMessage && (
          <div className={`mb-6 rounded-md p-4 text-sm font-medium ${actionMessage.type === "error" ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>
            {actionMessage.text}
          </div>
        )}
        {isVerifying && (
          <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 p-4 shadow-sm flex items-center gap-4">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <div>
              <p className="text-sm font-semibold text-blue-900">Processing Verification...</p>
              <p className="text-sm text-blue-700">{verificationStep}</p>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-6">
          {/* REQUIRED DOCUMENTS */}
          <SectionCard title="Required Documents" description="Status of compliance documents. Click Upload to replace or test a document." icon={ShieldCheck}>
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
              {["GST", "PAN", "Udyam"].map((doc, idx) => {
                const existingDoc = bidderInfo?.documents?.find(d => d.document_type.toLowerCase() === doc.toLowerCase());
                return (
                <li key={idx} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{doc} Document</p>
                      <p className="text-xs text-slate-400">Mandatory check</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-6 sm:pl-0">
                    <StatusBadge status={getCheckDisplayStatus(doc)} />
                    {existingDoc && (
                      <button
                        onClick={() => setPreviewDoc({ url: `http://localhost:8000/${existingDoc.file_path.replace(/\\/g, '/')}`, name: doc })}
                        className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-600 shadow-sm hover:bg-slate-50"
                      >
                        View
                      </button>
                    )}
                  </div>
                </li>
                );
              })}
            </ul>
          </SectionCard>
          {/* DROPZONE & QUEUE */}
          <SectionCard title="Verification Queue" description="Live processing pipeline for uploaded documents." icon={PlayCircle}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = null; // allow re-uploading the same file
              }}
              className="hidden"
              multiple
              accept=".pdf,image/*"
            />
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragOver(false); addFiles(e.dataTransfer.files); }}
              onClick={() => openFilePicker(null)}
              className={`mb-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${isDragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"}`}
            >
              <Upload className={`h-8 w-8 ${isDragOver ? "text-blue-500" : "text-slate-400"}`} />
              <p className="mt-3 text-sm font-medium text-slate-700">Drop documents here or <span className="text-blue-600">browse</span></p>
            </div>
            {queue.length > 0 && (
              <ul className="space-y-3">
                {queue.map((item) => (
                  <li key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">{item.name}</p>
                          <p className="text-xs text-slate-500">[{item.docType}] • {(item.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-500">{item.progress}%</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.file) {
                              setPreviewDoc({ url: URL.createObjectURL(item.file), name: item.name });
                            }
                          }}
                          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-600 shadow-sm hover:bg-slate-50"
                        >
                          View
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${item.error ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    {item.error && <p className="mt-2 text-xs text-red-600">Error: {item.error}</p>}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
          {/* DYNAMIC PIPELINE STATUS SUMMARY */}
          {(queue.length > 0 || isVerifying) && (
            <SectionCard id="processing-summary" title="Pipeline Status" description="Real-time document processing metrics" icon={FileCheck2}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center transition-all">
                  <p className="text-lg font-semibold text-slate-800">{queue.length}</p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Submitted</p>
                </div>
                <div className={`rounded-lg border p-3 text-center transition-all ${queue.some(q => q.extractedFields) ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                  <p className={`text-lg font-semibold ${queue.some(q => q.extractedFields) ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {queue.filter(q => q.extractedFields).length}
                  </p>
                  <p className={`text-[11px] font-medium uppercase tracking-wide ${queue.some(q => q.extractedFields) ? 'text-emerald-600' : 'text-slate-500'}`}>OCR Extracted</p>
                </div>
                <div className={`rounded-lg border p-3 text-center transition-all ${isVerifying ? 'border-blue-200 bg-blue-50 animate-pulse' : (liveVerification ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-slate-50')}`}>
                  <p className={`text-lg font-semibold ${isVerifying ? 'text-blue-700' : (liveVerification ? 'text-indigo-700' : 'text-slate-500')}`}>
                    {isVerifying ? 'Running...' : (liveVerification ? 'Complete' : 'Pending')}
                  </p>
                  <p className={`text-[11px] font-medium uppercase tracking-wide ${isVerifying ? 'text-blue-600' : (liveVerification ? 'text-indigo-600' : 'text-slate-500')}`}>Verification</p>
                </div>
                <div className={`rounded-lg border p-3 text-center transition-all ${queue.some(q => q.error) ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                  <p className={`text-lg font-semibold ${queue.some(q => q.error) ? 'text-red-700' : 'text-slate-500'}`}>
                    {queue.filter(q => q.error).length}
                  </p>
                  <p className={`text-[11px] font-medium uppercase tracking-wide ${queue.some(q => q.error) ? 'text-red-600' : 'text-slate-500'}`}>Failed / Errors</p>
                </div>
              </div>
              {isVerifying && (
                <div className="mt-4 flex items-center gap-3 rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
                   <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600 shrink-0"></div>
                   <p className="text-sm font-medium text-blue-800">
                     Cross-referencing OCR data with GST, PAN, and Udyam Government Databases...
                   </p>
                </div>
              )}
            </SectionCard>
          )}
          {/* LIVE OCR EXTRACTION PREVIEW */}
          {queue.some(item => item.extractedFields) && (
            <SectionCard title="Live OCR Extraction" description="Raw data extracted from newly uploaded documents." icon={ScanLine}>
              <div className="grid gap-4 sm:grid-cols-2">
                {queue.filter(i => i.extractedFields).map(item => (
                  <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">{item.docType} Extraction</h3>
                    <div className="space-y-2">
                      {Object.entries(item.extractedFields).map(([key, val]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="font-medium text-slate-500 capitalize">{key.replace('_', ' ')}</span>
                          <span className="font-semibold text-slate-900 text-right w-1/2 break-all">{val?.value || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
          {/* AI VERIFICATION RESULTS */}
          <SectionCard title="AI Verification Results" description="Results generated from the AI Engine after processing." icon={ClipboardList}>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Document Check</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">AI Reasoning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {isVerifying ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                          <p className="text-sm font-medium text-slate-500 animate-pulse">Running AI Compliance Checks against Government Databases...</p>
                        </div>
                      </td>
                    </tr>
                  ) : activeChecks.length === 0 ? (
                    <tr><td colSpan="3" className="px-4 py-8 text-center text-slate-500">No results yet. Run verification.</td></tr>
                  ) : (
                    activeChecks.map((check, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{check.check}</td>
                        <td className="px-4 py-3"><StatusBadge status={check.status || (check.flag ? "MISMATCH" : "VERIFIED")} /></td>
                        <td className="px-4 py-3 text-xs">{check.reason || "Matches expected parameters."}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
          {/* ACTION BAR */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:px-6">
            <div>
              <p className="text-sm font-medium text-slate-900">Compliance Score: {activeResult?.compliance_score || 0}/100</p>
              <p className="text-xs text-slate-500">Risk Level: {activeResult?.risk_level || "Unknown"}</p>
            </div>
            <button
              onClick={handleRunVerification}
              disabled={isVerifying}
              className={`rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-all ${
                isVerifying ? "bg-blue-400 cursor-not-allowed animate-pulse" : "bg-blue-600 hover:bg-blue-700 shadow-sm"
              }`}
            >
              {isVerifying ? "Verifying..." : "Run Verification"}
            </button>
          </div>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6">
          <div className="relative flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-lg font-semibold text-slate-800">Document Preview: {previewDoc.name}</h3>
              <button onClick={() => setPreviewDoc(null)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-100 p-4 flex items-center justify-center">
              {previewDoc.url.toLowerCase().endsWith(".pdf") ? (
                <iframe src={previewDoc.url} className="h-full w-full rounded-md border bg-white" title="PDF Preview" />
              ) : (
                <img src={previewDoc.url} alt="Document Preview" className="max-h-full max-w-full rounded-md object-contain shadow-sm" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function ScanLine(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
      <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
      <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
      <line x1="7" y1="12" x2="17" y2="12"></line>
    </svg>
  );
}