import { useState } from "react";

import DashboardSidebar from "../Components/dashboard/DashboardSidebar";
import DashboardHeader from "../Components/dashboard/DashboardHeader";
import OverviewStats from "../Components/dashboard/OverviewStats";
import NeedsAttention from "../Components/dashboard/NeedsAttention";
import RecentTenders from "../Components/dashboard/RecentTenders";

export default function Dashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <DashboardSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content */}
      <div className="min-w-0 flex-1">
        <DashboardHeader />

        <main className="p-6 lg:p-8">
          <OverviewStats />
          <NeedsAttention />
          <RecentTenders />
        </main>
      </div>
    </div>
  );
}