import { useState } from "react";
import DashboardSidebar from "../Components/dashboard/DashboardSidebar";
import TendersComponent from "../Components/tenders";

export default function Tenders() {
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

      <div className="min-w-0 flex-1">
        <TendersComponent />
      </div>

    </div>
  );
}