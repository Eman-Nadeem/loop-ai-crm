"use client";

import React from "react";
import TopNav from "@/components/dashboard/top-nav";
import AgreementsOverview from "@/components/widgets/agreements-overview";
import ClientsSource from "@/components/widgets/clients-source";
import AIAssistant from "@/components/widgets/ai-assistant";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Inside Header */}
      <TopNav />

      {/* Grid Split Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
        {/* Main Area */}
        <main className="lg:col-span-8 p-6 sm:p-8">
          {children}
        </main>

        {/* Right Sidebar Widgets */}
        <aside className="lg:col-span-4 p-6 sm:p-8 bg-slate-50/40 border-t lg:border-t-0 lg:border-l border-slate-100/80 flex flex-col gap-6">
          <AgreementsOverview />
          <ClientsSource />
          <AIAssistant />
        </aside>
      </div>
    </div>
  );
}
