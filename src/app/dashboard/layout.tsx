"use client";

import React from "react";
import { usePathname } from "next/navigation";
import TopNav from "@/components/dashboard/top-nav";
import { CRMProvider } from "@/lib/context/crm-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isEdgeToEdgePage = pathname.startsWith("/dashboard/inbox") || pathname === "/dashboard/ai";

  return (
    <CRMProvider>
      <div className="min-h-screen flex flex-col bg-transparent">
        {/* Top Navigation */}
        <TopNav />

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          <main className={`flex-1 ${isEdgeToEdgePage ? "p-0" : "p-6 sm:p-8"} bg-transparent`}>
            {children}
          </main>
        </div>
      </div>
    </CRMProvider>
  );
}
