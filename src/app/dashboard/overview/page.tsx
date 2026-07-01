"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Briefcase, DollarSign, FileCheck, ArrowRight, Loader2 } from "lucide-react";
import ClientCard from "@/components/clients/client-card";
import AgreementsOverview from "@/components/widgets/agreements-overview";
import ClientsSource from "@/components/widgets/clients-source";
import { useCRM } from "@/lib/context/crm-context";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  themeColor: "purple" | "amber" | "emerald" | "rose";
}

function StatCard({ title, value, icon, description, themeColor }: StatCardProps) {
  const themes = {
    purple: {
      iconBg: "bg-indigo-50/50 border-indigo-100/50 text-indigo-600",
      glow: "hover:shadow-indigo-100/30",
    },
    amber: {
      iconBg: "bg-amber-50/50 border-amber-100/50 text-amber-600",
      glow: "hover:shadow-amber-100/30",
    },
    emerald: {
      iconBg: "bg-emerald-50/50 border-emerald-100/50 text-emerald-600",
      glow: "hover:shadow-emerald-100/30",
    },
    rose: {
      iconBg: "bg-rose-50/50 border-rose-100/50 text-rose-600",
      glow: "hover:shadow-rose-100/30",
    },
  }[themeColor];

  return (
    <div
      className={`bg-white rounded-4xl border border-slate-100 p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_15px_30px_rgba(31,32,41,0.05)] ${themes.glow} transition-all duration-300 min-h-[140px]`}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{title}</span>
          <span className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">{value}</span>
        </div>
        <div className={`p-3 rounded-2xl border ${themes.iconBg} flex items-center justify-center shadow-sm`}>
          {icon}
        </div>
      </div>
      <p className="text-[11px] text-slate-400 font-medium mt-3 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default function OverviewPage() {
  const { clients, projects, loading } = useCRM();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="text-xs font-medium">Aggregating relationship intelligence...</span>
      </div>
    );
  }

  // Compute metrics dynamically from state
  const totalClients = clients.length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const totalBudget = clients.reduce((sum, c) => sum + c.budget, 0);
  const signedAgreements = clients.filter((c) => c.agreementStatus === "signed").length;

  const recentClients = clients.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8"
    >
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Relationship Intelligence</h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">Welcome back! Here is a summary of your workspace integrations.</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Clients"
          value={totalClients}
          icon={<Users className="w-5 h-5" />}
          description="Integrated accounts across Upwork, Freelancer, and Fiverr"
          themeColor="purple"
        />
        <StatCard
          title="Active Projects"
          value={activeProjects}
          icon={<Briefcase className="w-5 h-5" />}
          description="Ongoing deliverables with active tracking setup"
          themeColor="amber"
        />
        <StatCard
          title="Revenue / Budget"
          value={`$${totalBudget.toLocaleString()}k`}
          icon={<DollarSign className="w-5 h-5" />}
          description="Aggregated budget across all active contracts"
          themeColor="emerald"
        />
        <StatCard
          title="Signed Agreements"
          value={signedAgreements}
          icon={<FileCheck className="w-5 h-5" />}
          description="Contracts fully executed and approved by both parties"
          themeColor="rose"
        />
      </div>

      {/* Inline Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AgreementsOverview clients={clients} loading={false} />
        <ClientsSource clients={clients} loading={false} />
      </div>

      {/* Recent Clients Section */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Recent Clients</h2>
          <Link
            href="/dashboard/clients"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 transition-all"
          >
            <span>View Client Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Client Grid (Max 4 items) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {recentClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
