"use client";

import React from "react";
import { usePathname } from "next/navigation";
import TopNav from "@/components/dashboard/top-nav";
import AgreementsOverview from "@/components/widgets/agreements-overview";
import ClientsSource from "@/components/widgets/clients-source";
import ProjectStatusOverview from "@/components/widgets/project-status-overview";
import UnreadSummary from "@/components/widgets/unread-summary";
import AIAssistant from "@/components/widgets/ai-assistant";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isClientsPage = pathname === "/dashboard/clients";
  const isProjectsPage = pathname === "/dashboard/projects";
  const isInboxPage = pathname === "/dashboard/inbox";

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Top Navigation */}
      <TopNav />

      {/* Grid Split Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
        {/* Main Area - Spans full 12 columns and has 0 padding on Inbox page, otherwise 8 columns and standard padding */}
        <main className={`${isInboxPage ? "lg:col-span-12 p-0" : "lg:col-span-8 p-6 sm:p-8"} bg-transparent`}>
          {children}
        </main>

        {/* Right Sidebar Widgets - Hidden completely on Inbox page */}
        {!isInboxPage && (
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
  );
}
