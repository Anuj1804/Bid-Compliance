import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "./dashboard/DashboardSidebar";
import { ShieldCheck, AlertTriangle, Building2, ChevronRight, Clock, FileWarning } from "lucide-react";

export default function GlobalReviewsInbox() {
  const navigate = useNavigate();
  const [flags, setFlags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch pending flags WITH Bidder Data from backend
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/api/bidders/all-flags/pending", {
      headers: {
        "Authorization": token ? `Bearer ${token}` : ""
      }
    })
      .then(r => r.json())
      .then(data => {
        setFlags(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <DashboardSidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Global Review Inbox</h1>
            <p className="mt-1 text-sm text-slate-500">
              Centralized dashboard of all pending compliance issues across all bidders.
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12">
              <p className="text-slate-500 font-medium animate-pulse">Loading global inbox...</p>
            </div>
          ) : flags.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 p-12 text-center">
               <ShieldCheck className="mb-4 h-16 w-16 text-emerald-500" />
               <h3 className="text-lg font-bold text-emerald-800">No Pending Issues!</h3>
               <p className="mt-1 text-sm text-emerald-600">The AI engine hasn't found any active flags. You are all caught up.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {flags.map(flag => (
                <div key={flag.flag_id} className="group overflow-hidden rounded-xl border border-red-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-red-300">
                  
                  {/* Top Bar: Bidder Identity */}
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Building2 className="h-4 w-4 text-indigo-500" />
                      {flag.company_name}
                      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-slate-500">
                        BID-{flag.bidder_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      Pending Review
                    </div>
                  </div>

                  {/* Body: Issue Details */}
                  <div className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="flex flex-1 items-start gap-4">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <FileWarning className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            flag.severity === "HIGH" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}>
                            {flag.severity || "MEDIUM"} RISK
                          </span>
                        </div>
                        <h3 className="mt-1.5 text-base font-bold text-slate-900">
                          {flag.check_type} Failed
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                          {flag.reason}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <button 
                      onClick={() => navigate(`/officer-review/${flag.bidder_id}`)} 
                      className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-600 w-full justify-center sm:w-auto"
                    >
                      Review Bidder
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}