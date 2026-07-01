"use client";

import React, { useEffect, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { Client, getClients } from "@/lib/mock-data/clients";

import { useCRM } from "@/lib/context/crm-context";

interface ClientsSourceProps {
  clients?: Client[];
  loading?: boolean;
}

export default function ClientsSource({ clients: propClients, loading: propLoading }: ClientsSourceProps) {
  const crm = useCRM();
  const clients = propClients || crm.clients;
  const loading = propLoading !== undefined ? propLoading : (propClients ? false : crm.loading);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all flex items-center justify-center min-h-[220px]">
        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
      </div>
    );
  }

  const upwork = clients.filter((c) => c.platform === "upwork").length;
  const freelancer = clients.filter((c) => c.platform === "freelancer").length;
  const fiverr = clients.filter((c) => c.platform === "fiverr").length;
  const total = upwork + freelancer + fiverr;

  const upworkPercentage = total > 0 ? (upwork / total) * 100 : 0;
  const freelancerPercentage = total > 0 ? (freelancer / total) * 100 : 0;
  const fiverrPercentage = total > 0 ? (fiverr / total) * 100 : 0;

  // Dynamically find the platform with the lowest client count
  const platforms = [
    { name: "Upwork", count: upwork },
    { name: "Freelancer", count: freelancer },
    { name: "Fiverr", count: fiverr },
  ];
  const lowestPlatform = platforms.reduce((min, p) => (p.count < min.count ? p : min), platforms[0]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm tracking-tight">Clients Source</h3>
        <button className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Segmented Bar */}
      <div className="h-10 w-full flex gap-1 rounded-xl overflow-hidden bg-slate-50">
        {/* Upwork Segment (Yellow-Orange Pastel) */}
        {upwork > 0 && (
          <div
            style={{ width: `${upworkPercentage}%` }}
            className="h-full bg-linear-to-r from-[#ffe4e6] to-[#fed7aa] rounded-l-md"
            title={`Upwork: ${upwork} clients`}
          />
        )}
        {/* Freelancer Segment (Blue-Purple Pastel) */}
        {freelancer > 0 && (
          <div
            style={{ width: `${freelancerPercentage}%` }}
            className="h-full bg-linear-to-r from-[#dbeafe] to-[#e0e7ff]"
            title={`Freelancer: ${freelancer} clients`}
          />
        )}
        {/* Fiverr Segment (Pink Pastel) */}
        {fiverr > 0 && (
          <div
            style={{ width: `${fiverrPercentage}%` }}
            className="h-full bg-linear-to-r from-[#fce7f3] to-[#ffe4e6] rounded-r-md"
            title={`Fiverr: ${fiverr} clients`}
          />
        )}
      </div>

      {/* Labels Row */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex flex-col">
          <span className="text-base font-bold text-slate-800 leading-none">{upwork}</span>
          <span className="text-[11px] text-slate-400 mt-1 font-semibold">Upwork</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-base font-bold text-slate-800 leading-none">{freelancer}</span>
          <span className="text-[11px] text-slate-400 mt-1 font-semibold">Freelancer</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-base font-bold text-slate-800 leading-none">{fiverr}</span>
          <span className="text-[11px] text-slate-400 mt-1 font-semibold">Fiverr</span>
        </div>
      </div>

      {/* Insights Tip Box */}
      {total > 0 && (
        <div className="bg-[#eef2ff] border border-indigo-50/50 rounded-xl p-3.5 flex items-start gap-3 mt-1 shadow-sm">
          {/* Loop Icon (Mini Purple Logo) */}
          <div className="shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center mt-0.5 shadow-sm">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7C4.747 9.547 4.7 10.768 4.7 12s.047 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.092-1.209.138-2.43.138-3.662z" />
            </svg>
          </div>
          <p className="text-xs text-indigo-900 leading-relaxed font-medium">
            Pay attention to {lowestPlatform.name} — where the fewest orders come from:{" "}
            <span className="font-semibold underline cursor-pointer hover:text-indigo-700">optimize your profile</span> to fix this.
          </p>
        </div>
      )}
    </div>
  );
}
