"use client";

import React, { useEffect, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { Project, getProjects } from "@/lib/mock-data/projects";

import { useCRM } from "@/lib/context/crm-context";

interface ProjectStatusOverviewProps {
  projects?: Project[];
  loading?: boolean;
}

export default function ProjectStatusOverview({ projects: propProjects, loading: propLoading }: ProjectStatusOverviewProps) {
  const crm = useCRM();
  const projects = propProjects || crm.projects;
  const loading = propLoading !== undefined ? propLoading : (propProjects ? false : crm.loading);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all flex items-center justify-center min-h-[220px]">
        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
      </div>
    );
  }

  const active = projects.filter((p) => p.status === "active").length;
  const completed = projects.filter((p) => p.status === "completed").length;
  const onHold = projects.filter((p) => p.status === "on_hold").length;
  const total = active + completed + onHold;

  const activePercentage = total > 0 ? (active / total) * 100 : 0;
  const completedPercentage = total > 0 ? (completed / total) * 100 : 0;
  const onHoldPercentage = total > 0 ? (onHold / total) * 100 : 0;

  // Find an on-hold project dynamically to offer a targeted recommendation
  const onHoldProject = projects.find((p) => p.status === "on_hold");

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm tracking-tight">Project Status Overview</h3>
        <button className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Segmented Bar */}
      <div className="h-10 w-full flex gap-1 rounded-xl overflow-hidden bg-slate-50">
        {/* Active Segment (Emerald Green Pastel) */}
        {active > 0 && (
          <div
            style={{ width: `${activePercentage}%` }}
            className="h-full bg-linear-to-r from-[#dcfce7] to-[#bbf7d0] rounded-l-md"
            title={`Active: ${active} projects`}
          />
        )}
        {/* Completed Segment (Slate/Grey Pastel) */}
        {completed > 0 && (
          <div
            style={{ width: `${completedPercentage}%` }}
            className="h-full bg-linear-to-r from-[#f1f5f9] to-[#e2e8f0]"
            title={`Completed: ${completed} projects`}
          />
        )}
        {/* On Hold Segment (Amber/Orange Pastel) */}
        {onHold > 0 && (
          <div
            style={{ width: `${onHoldPercentage}%` }}
            className="h-full bg-linear-to-r from-[#fef3c7] to-[#fde68a] rounded-r-md"
            title={`On Hold: ${onHold} projects`}
          />
        )}
      </div>

      {/* Labels Row */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex flex-col">
          <span className="text-base font-bold text-slate-800 leading-none">{active}</span>
          <span className="text-[11px] text-slate-400 mt-1 font-semibold">Active</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-base font-bold text-slate-800 leading-none">{completed}</span>
          <span className="text-[11px] text-slate-400 mt-1 font-semibold">Completed</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-base font-bold text-slate-800 leading-none">{onHold}</span>
          <span className="text-[11px] text-slate-400 mt-1 font-semibold">On Hold</span>
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
            {onHold > 0 && onHoldProject ? (
              <>
                You have {onHold} project on hold. Follow up with{" "}
                <span className="font-semibold underline cursor-pointer hover:text-indigo-700">
                  {onHoldProject.client?.name}
                </span>{" "}
                at {onHoldProject.client?.company} to resolve project blockers.
              </>
            ) : (
              <>
                All projects are moving smoothly! Active projects account for{" "}
                <span className="font-semibold">{activePercentage.toFixed(0)}%</span> of your current workload pipeline.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
