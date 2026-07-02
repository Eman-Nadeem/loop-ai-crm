"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { Project } from "@/lib/mock-data/projects";
import { useCRM } from "@/lib/context/crm-context";
import { motion, AnimatePresence } from "framer-motion";

interface GanttViewProps {
  projects: Project[];
}

export default function GanttView({ projects }: GanttViewProps) {
  const { updateProject, addToast } = useCRM();
  const timelineRef = useRef<HTMLDivElement>(null);

  // Track unsaved timeline adjustments locally: { projectId: newDeadlineString }
  const [unsavedDeadlines, setUnsavedDeadlines] = useState<Record<string, string>>({});

  // Track which project is currently resizing to display the real-time date tooltip
  const [resizingProjectId, setResizingProjectId] = useState<string | null>(null);

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 rounded-4xl bg-slate-50/50">
        <p className="text-sm font-semibold text-slate-500">No projects to display in the timeline.</p>
      </div>
    );
  }

  // Find min/max dates across all projects to determine timeline boundaries
  const projectDates = projects.flatMap((p) => {
    const currentDeadline = unsavedDeadlines[p.id] || p.deadline;
    return [
      new Date(p.startDate).getTime(),
      new Date(currentDeadline).getTime(),
    ];
  });

  const earliestTime = Math.min(...projectDates);
  const latestTime = Math.max(...projectDates);

  // Buffer: Align to start of earliest month and end of latest month
  const minDate = new Date(earliestTime);
  const timelineStart = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

  const maxDate = new Date(latestTime);
  const timelineEnd = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0, 23, 59, 59);

  const minTime = timelineStart.getTime();
  const maxTime = timelineEnd.getTime();
  const totalDuration = maxTime - minTime;

  // Generate list of months in timeline range
  const months: Date[] = [];
  let currentMonth = new Date(timelineStart.getFullYear(), timelineStart.getMonth(), 1);
  while (currentMonth <= timelineEnd) {
    months.push(new Date(currentMonth));
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }

  // Timeline bar styles (sharp corners)
  const statusColors = {
    active: "bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600",
    completed: "bg-linear-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600",
    on_hold: "bg-linear-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500",
  };

  // Drag resizing handler
  const handleResizeStart = (
    e: React.PointerEvent,
    projectId: string,
    currentDeadlineStr: string,
    startDateStr: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const container = timelineRef.current;
    if (!container) return;

    const containerWidth = container.getBoundingClientRect().width;
    const initialX = e.clientX;
    const initialTime = new Date(currentDeadlineStr).getTime();
    const startTime = new Date(startDateStr).getTime();

    setResizingProjectId(projectId);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - initialX;
      // Convert pixel delta to time duration delta
      const deltaDuration = (deltaX / containerWidth) * totalDuration;
      let newTime = initialTime + deltaDuration;

      // Restrict deadline to be at least 1 day after the start date
      const minAllowedTime = startTime + 24 * 60 * 60 * 1000;
      if (newTime < minAllowedTime) {
        newTime = minAllowedTime;
      }

      const newDate = new Date(newTime);
      const newDateStr = newDate.toISOString().split("T")[0];

      setUnsavedDeadlines((prev) => ({
        ...prev,
        [projectId]: newDateStr,
      }));
    };

    const handlePointerUp = () => {
      setResizingProjectId(null);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleSaveDeadlines = async () => {
    try {
      for (const [projectId, newDeadline] of Object.entries(unsavedDeadlines)) {
        await updateProject(projectId, { deadline: newDeadline });
      }
      setUnsavedDeadlines({});
      addToast("Project deadlines updated successfully!", "success");
    } catch (err) {
      addToast("Failed to save project deadlines.", "error");
    }
  };

  const handleCancelDeadlines = () => {
    setUnsavedDeadlines({});
  };

  const hasUnsavedChanges = Object.keys(unsavedDeadlines).length > 0;

  return (
    <div className="w-full flex flex-col">
      {/* Floating Save Actions Banner (Bottom Right - Fixed Viewport) */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-6 right-6 z-[9998] pointer-events-auto flex flex-col gap-3 p-4 bg-white border border-indigo-100 rounded-3xl shadow-[0_10px_35px_rgba(79,70,229,0.12)] max-w-md w-[360px] sm:w-[400px]"
          >
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800">Unsaved Timeline Changes</span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-normal">
                  You have modified project deadlines. Click to save these changes.
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-50 pt-2.5">
              <button
                onClick={handleCancelDeadlines}
                className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-500 hover:text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDeadlines}
                className="px-3.5 py-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 hover:shadow-lg transition-all cursor-pointer"
              >
                Save Deadlines
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gantt Timeline Container */}
      <div className="flex border border-slate-200/60 rounded-4xl bg-white overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.015)] w-full">
        {/* Left Side: Sticky Project List (Hidden on tablet and mobile) */}
        <div className="hidden lg:flex w-56 shrink-0 flex-col bg-white border-r border-slate-100/80 sticky left-0 z-20 shadow-[4px_0_15px_rgba(0,0,0,0.01)]">
          {/* Header */}
          <div className="h-12 border-b border-slate-100/80 flex items-center px-6 bg-slate-50/50">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
              Project Deliverable
            </span>
          </div>

          {/* Rows */}
          <div className="flex flex-col">
            {projects.map((project) => (
              <div
                key={project.id}
                className="h-16 flex flex-col justify-center px-6 border-b border-slate-50 last:border-b-0"
              >
                <div className="relative h-5 flex items-center group/name">
                  {/* Default Truncated Project Name */}
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="font-bold text-xs text-slate-800 hover:text-indigo-600 transition-colors truncate w-full block group-hover/name:opacity-0"
                  >
                    {project.name}
                  </Link>

                  {/* Expanded Project Name & Client Owner (Overlaps timeline on hover with higher z-index) */}
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="flex flex-col gap-1 absolute left-0 top-1/2 -translate-y-1/2 hidden group-hover/name:flex w-max max-w-[320px] bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.08)] px-3.5 py-2.5 -ml-3.5 rounded-2xl z-30 pointer-events-auto transition-all"
                  >
                    <span className="font-bold text-xs text-slate-800 hover:text-indigo-600 transition-colors whitespace-normal break-words">
                      {project.name}
                    </span>
                    {project.client && (
                      <span className="text-[9px] text-slate-400 font-semibold leading-none whitespace-normal break-words">
                        {project.client.name} • {project.client.company}
                      </span>
                    )}
                  </Link>
                </div>
                {project.client && (
                  <span className="text-[9px] text-slate-400 font-semibold mt-0.5 truncate">
                    {project.client.name} • {project.client.company}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Scrollable Timeline Area */}
        <div
          ref={timelineRef}
          className="flex-1 overflow-x-auto relative scrollbar-none no-scrollbar"
        >
          <div className="min-w-[1100px] relative">
            {/* Timeline Header (Months) */}
            <div className="h-12 border-b border-slate-100/80 flex relative z-10 bg-slate-50/50 w-full">
              {months.map((month, idx) => {
                const monthStart = month.getTime();
                const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
                const monthEnd = nextMonth.getTime();
                const monthDuration = monthEnd - monthStart;
                const widthPercent = (monthDuration / totalDuration) * 100;

                const monthName = month.toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                });

                return (
                  <div
                    key={idx}
                    className="h-full border-r border-slate-100 last:border-r-0 flex items-end pb-2 px-3 text-[10px] font-bold text-slate-500 select-none uppercase tracking-wider shrink-0"
                    style={{ width: `${widthPercent}%` }}
                  >
                    {monthName}
                  </div>
                );
              })}
            </div>

            {/* Grid background lines at month start/end (border-l, last:border-r) */}
            <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none z-0 flex w-full">
              {months.map((month, idx) => {
                const monthStart = month.getTime();
                const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
                const monthEnd = nextMonth.getTime();
                const monthDuration = monthEnd - monthStart;
                const widthPercent = (monthDuration / totalDuration) * 100;

                return (
                  <div
                    key={idx}
                    className="h-full border-l last:border-r border-slate-200 shrink-0"
                    style={{ width: `${widthPercent}%` }}
                  />
                );
              })}
            </div>

            {/* Timeline Bars (Project Rows) */}
            <div className="flex flex-col relative z-10 w-full">
              {projects.map((project) => {
                const start = new Date(project.startDate).getTime();
                const currentDeadline = unsavedDeadlines[project.id] || project.deadline;
                const end = new Date(currentDeadline).getTime();

                // Compute offsets
                const leftPercent = Math.max(0, ((start - minTime) / totalDuration) * 100);
                const widthPercent = Math.max(
                  4, // Ensure a minimum clickable width
                  Math.min(100 - leftPercent, ((end - start) / totalDuration) * 100)
                );

                const colorClass = statusColors[project.status];

                return (
                  <div
                    key={project.id}
                    className="h-16 border-b border-slate-50 last:border-b-0 flex items-center relative w-full px-2"
                  >
                    {/* Project timeline bar - rectangular shape (rounded-none) */}
                    <div
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                      className="absolute h-9 flex items-center relative group"
                    >
                      {/* Drag tooltip showing exact deadline date */}
                      {resizingProjectId === project.id && (
                        <div className="absolute -top-9 right-0 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-md z-30 whitespace-nowrap">
                          {new Date(currentDeadline).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </div>
                      )}

                      {/* Left click link */}
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className={`w-full h-full rounded-none flex items-center px-4 text-white font-bold text-xs shadow-xs transition-all hover:brightness-95 cursor-pointer overflow-hidden ${colorClass}`}
                        title={`${project.name}: ${project.startDate} to ${currentDeadline} (${project.progress}% completed)`}
                      >
                        <div className="flex items-center justify-between w-full min-w-0 gap-2">
                          <span className="truncate">{project.name}</span>
                          <span className="text-[10px] font-extrabold opacity-95 shrink-0 bg-white/15 px-1.5 py-0.5 rounded-md">
                            {project.progress}%
                          </span>
                        </div>
                      </Link>

                      {/* Right edge drag-to-resize handle */}
                      <div
                        onPointerDown={(e) =>
                          handleResizeStart(e, project.id, currentDeadline, project.startDate)
                        }
                        className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/20 transition-colors flex items-center justify-center select-none active:bg-white/30"
                        title="Drag to extend deadline"
                      >
                        {/* Tiny vertical drag handle strip */}
                        <div className="w-1 h-4 bg-white/40 rounded-full" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
