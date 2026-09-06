import { useState } from "react";

import DashboardSidebar from "../Components/dashboard/DashboardSidebar";
import DashboardHeader from "../Components/dashboard/DashboardHeader";
import AuditTrail from "../Components/Audittrail";

export default function AuditTrailPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

   

        <main className="p-6 lg:p-8">
          <AuditTrail />
        </main>
    
    </div>
  );
}