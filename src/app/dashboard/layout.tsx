"use client";

import React from "react";
import { usePathname } from "next/navigation";
import TopNav from "@/components/dashboard/top-nav";
import AgreementsOverview from "@/components/widgets/agreements-overview";
import ClientsSource from "@/components/widgets/clients-source";
import ProjectStatusOverview from "@/components/widgets/project-status-overview";
import AIAssistant from "@/components/widgets/ai-assistant";
import { CRMProvider } from "@/lib/context/crm-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isClientsPage = pathname === "/dashboard/clients";
  const isProjectsPage = pathname === "/dashboard/projects";
  const isInboxPage = pathname === "/dashboard/inbox";
  const isAnalyticsPage = pathname === "/dashboard/analytics";

  const isFullWidthPage = isInboxPage || isAnalyticsPage || isProjectsPage;

  return (
    <CRMProvider>
      <div className="min-h-screen flex flex-col bg-transparent">
        {/* Top Navigation */}
        <TopNav />

        {/* Grid Split Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
          {/* Main Area - Spans full 12 columns on Inbox/Analytics, p-0 on Inbox for flush docking */}
          <main className={`${isFullWidthPage ? "lg:col-span-12" : "lg:col-span-8"} ${isInboxPage ? "p-0" : "p-6 sm:p-8"} bg-transparent`}>
            {children}
          </main>

          {/* Right Sidebar Widgets - Hidden completely on Inbox & Analytics pages */}
          {!isFullWidthPage && (
            <aside className="lg:col-span-4 p-6 sm:p-8 bg-slate-50/40 border-t lg:border-t-0 lg:border-l border-slate-100/80 flex flex-col gap-6">
              {isClientsPage && (
                <>
                  <AgreementsOverview />
                  <ClientsSource />
                </>
              )}
              {isProjectsPage && (
                <ProjectStatusOverview />
              )}
              <AIAssistant />
            </aside>
          )}
        </div>
      </div>
    </CRMProvider>
  );
}
