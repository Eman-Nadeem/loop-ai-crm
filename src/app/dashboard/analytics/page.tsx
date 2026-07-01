"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Briefcase, DollarSign, FileCheck, Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getAnalyticsData, MonthlyStats, calculateTrends, ComparisonTrends } from "@/lib/mock-data/analytics";

interface StatCardProps {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  description: string;
  themeColor: "purple" | "amber" | "emerald" | "rose";
}

function StatCard({ title, value, trend, icon, description, themeColor }: StatCardProps) {
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

  const trendIsPositive = trend >= 0;

  return (
    <div
      className={`bg-white rounded-4xl border border-slate-100 p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_15px_30px_rgba(31,32,41,0.05)] ${themes.glow} transition-all duration-300 min-h-[140px]`}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1 text-left">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{title}</span>
          <span className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">{value}</span>
        </div>
        <div className={`p-3 rounded-2xl border ${themes.iconBg} flex items-center justify-center shadow-sm`}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-[70%] text-left">
          {description}
        </p>
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border shrink-0 ${
            trendIsPositive
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-rose-50 text-rose-700 border-rose-100"
          }`}
        >
          {trendIsPositive ? `+${trend}%` : `${trend}%`}
        </span>
      </div>
    </div>
  );
}

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 text-white p-3.5 rounded-2xl shadow-xl text-xs font-semibold">
        <p className="text-slate-400 mb-1.5 font-bold">{label} 2026</p>
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2 mt-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
            <span className="text-slate-300">{item.name}: </span>
            <span className="font-extrabold text-white">
              {item.name.toLowerCase().includes("revenue") || item.name.toLowerCase().includes("budget")
                ? `$${item.value.toLocaleString()}k`
                : item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<MonthlyStats[]>([]);
  const [trends, setTrends] = useState<ComparisonTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      try {
        const stats = await getAnalyticsData();
        setData(stats);
        
        if (stats.length >= 2) {
          const current = stats[stats.length - 1];
          const previous = stats[stats.length - 2];
          setTrends(calculateTrends(current, previous));
        }
      } catch (error) {
        console.error("Failed to load analytics data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (!mounted || loading || !trends || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="text-xs font-medium">Mounting analytics dashboard...</span>
      </div>
    );
  }

  const current = data[data.length - 1];

  // Project breakdown pie data
  const projectBreakdownData = [
    { name: "Active", value: 5, color: "#10b981" },     // Emerald
    { name: "Completed", value: 2, color: "#64748b" },  // Slate
    { name: "On Hold", value: 1, color: "#f59e0b" },    // Amber
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8"
    >
      {/* Title */}
      <div className="text-left">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Performance Analytics</h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          Widescreen financial reports and pipeline optimizations derived across all integrations.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Revenue Budget"
          value={`$${current.revenue.toLocaleString()}k`}
          trend={trends.revenueChange}
          icon={<DollarSign className="w-5 h-5" />}
          description="Aggregated budget across active contracts"
          themeColor="emerald"
        />
        <StatCard
          title="Total Clients"
          value={current.clients}
          trend={trends.clientsChange}
          icon={<Users className="w-5 h-5" />}
          description="Linked workspace source client accounts"
          themeColor="purple"
        />
        <StatCard
          title="Active Projects"
          value={current.activeProjects}
          trend={trends.projectsChange}
          icon={<Briefcase className="w-5 h-5" />}
          description="Ongoing deliverables with active tracking"
          themeColor="amber"
        />
        <StatCard
          title="Signed Agreements"
          value={current.signedAgreements}
          trend={trends.agreementsChange}
          icon={<FileCheck className="w-5 h-5" />}
          description="Contracts fully executed by both parties"
          themeColor="rose"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Revenue vs Target Budget */}
        <div className="bg-white rounded-4xl border border-slate-100 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col gap-4">
          <div className="flex flex-col items-start">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Revenue & Target Budget</h3>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Historical growth curves (last 6 months)</span>
          </div>
          <div className="h-72 w-full text-xs font-semibold text-slate-400 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} dx={-5} tickFormatter={(v) => `$${v}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Actual Revenue"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="budget"
                  name="Target Budget"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorBudget)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Agreements Pipeline Over Time */}
        <div className="bg-white rounded-4xl border border-slate-100 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col gap-4">
          <div className="flex flex-col items-start">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Agreements Pipeline</h3>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Signed contracts vs. pending negotiations</span>
          </div>
          <div className="h-72 w-full text-xs font-semibold text-slate-400 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSigned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorNegotiating" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} dx={-5} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
                <Area
                  type="monotone"
                  stackId="1"
                  dataKey="signedAgreements"
                  name="Signed"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSigned)"
                />
                <Area
                  type="monotone"
                  stackId="1"
                  dataKey="negotiatingAgreements"
                  name="Negotiating"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorNegotiating)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Clients Source Growth */}
        <div className="bg-white rounded-4xl border border-slate-100 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col gap-4">
          <div className="flex flex-col items-start">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Clients platform growth</h3>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Distribution over source networks</span>
          </div>
          <div className="h-72 w-full text-xs font-semibold text-slate-400 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} dx={-5} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
                {/* Upwork Green */}
                <Bar dataKey="upwork" name="Upwork" stackId="a" fill="#14a800" radius={[0, 0, 0, 0]} />
                {/* Freelancer Blue */}
                <Bar dataKey="freelancer" name="Freelancer" stackId="a" fill="#0087e0" radius={[0, 0, 0, 0]} />
                {/* Fiverr Green */}
                <Bar dataKey="fiverr" name="Fiverr" stackId="a" fill="#1dbf73" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Project Status Breakdown */}
        <div className="bg-white rounded-4xl border border-slate-100 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col gap-4">
          <div className="flex flex-col items-start">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Project status breakdown</h3>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Ratio distribution of active pipeline</span>
          </div>
          <div className="h-72 w-full text-xs font-semibold text-slate-400 mt-2 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {projectBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ bottom: 0 }} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Donut Center text */}
            <div className="absolute flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
              <span className="text-3xl font-extrabold text-slate-800 leading-none">8</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Projects</span>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
