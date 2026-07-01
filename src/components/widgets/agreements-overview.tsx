"use client";

import React, { useEffect, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { Client, getClients } from "@/lib/mock-data/clients";

interface AgreementsOverviewProps {
  clients?: Client[];
  loading?: boolean;
}

export default function AgreementsOverview({ clients: propClients, loading: propLoading }: AgreementsOverviewProps) {
  const [clients, setClients] = useState<Client[]>(propClients || []);
  const [loading, setLoading] = useState(propLoading !== undefined ? propLoading : !propClients);

  useEffect(() => {
    if (propClients) {
      setClients(propClients);
      setLoading(false);
      return;
    }

    async function loadClients() {
      try {
        const data = await getClients();
        setClients(data);
      } catch (error) {
        console.error("Failed to load clients in AgreementsOverview:", error);
      } finally {
        setLoading(false);
      }
    }
    loadClients();
  }, [propClients]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all flex items-center justify-center min-h-[160px]">
        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
      </div>
    );
  }

  const signed = clients.filter((c) => c.agreementStatus === "signed").length;
  const ongoing = clients.filter((c) => c.agreementStatus === "negotiating").length;
  const total = signed + ongoing;
  const signedPercentage = total > 0 ? (signed / total) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 text-sm tracking-tight">Agreements Overview</h3>
        <button className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar Container */}
      <div className="relative h-12 w-full rounded-xl border border-slate-100 overflow-visible flex mb-4 bg-slate-50">
        {/* Left Segment: Signed Contracts (Yellow-to-Green Gradient) */}
        <div
          style={{ width: `${signedPercentage}%` }}
          className="h-full rounded-l-xl bg-linear-to-r from-[#fae8c3] via-[#dcfce7] to-[#99f6e4] transition-all duration-500"
        />

        {/* Right Segment: Ongoing Negotiations (Diagonal Stripes) */}
        <div
          style={{ width: `${100 - signedPercentage}%` }}
          className="h-full rounded-r-xl stripe-pattern border-l border-slate-200 transition-all duration-500"
        />

        {/* Marker (Triangle + Dotted Line) */}
        {total > 0 && (
          <div
            style={{ left: `${signedPercentage}%` }}
            className="absolute top-0 bottom-0 -ml-px flex flex-col items-center justify-between pointer-events-none"
          >
            {/* Top Triangle Marker */}
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-emerald-600 mt-[-4px]" />
            {/* Dotted Divider */}
            <div className="h-full border-l border-dashed border-emerald-500/80" />
          </div>
        )}
      </div>

      {/* Statistics Row */}
      <div className="flex items-center justify-between text-sm">
        {/* Signed Contracts */}
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-slate-900 leading-none">{signed}</span>
          <span className="text-xs text-slate-400 mt-1.5 font-medium">Signed Contracts</span>
        </div>

        {/* Ongoing Negotiations */}
        <div className="flex flex-col items-end">
          <span className="text-2xl font-bold text-slate-900 leading-none">{ongoing}</span>
          <span className="text-xs text-slate-400 mt-1.5 font-medium">Ongoing Negotiations</span>
        </div>
      </div>
    </div>
  );
}
