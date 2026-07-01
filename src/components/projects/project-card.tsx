"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, DollarSign, FolderGit2 } from "lucide-react";
import { Project } from "@/lib/mock-data/projects";
import ProgressBar from "@/components/ui/progress-bar";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { client } = project;

  // Status badge style mapping
  const statusStyles = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-100/80",
    completed: "bg-slate-100 text-slate-700 border-slate-200/80",
    on_hold: "bg-amber-50 text-amber-700 border-amber-100/80",
  }[project.status];

  const statusLabels = {
    active: "Active",
    completed: "Completed",
    on_hold: "On Hold",
  }[project.status];

  // Budget color mapping
  const progressColors = {
    active: "bg-linear-to-r from-indigo-500 to-purple-500",
    completed: "bg-linear-to-r from-emerald-400 to-teal-500",
    on_hold: "bg-linear-to-r from-amber-400 to-orange-400",
  }[project.status];

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative group bg-white rounded-4xl border border-slate-100 p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_15px_35px_rgba(31,32,41,0.06)] transition-shadow duration-300 min-h-[260px] overflow-hidden"
    >
      {/* Top Section: Icon, Name & Status */}
      <div className="flex flex-col gap-2 items-start w-full">
        <div className="flex justify-between items-center w-full">
          {/* Project Icon */}
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 shadow-sm flex items-center justify-center">
            <FolderGit2 className="w-4 h-4" />
          </div>
          {/* Status Badge */}
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusStyles}`}>
            {statusLabels}
          </span>
        </div>

        {/* Project Name */}
        <h4 className="font-bold text-slate-800 text-sm tracking-tight leading-snug mt-2 line-clamp-1 w-full text-left">
          {project.name}
        </h4>
      </div>

      {/* Middle Section: Client details */}
      {client && (
        <div className="flex items-center gap-2.5 w-full bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100/50 my-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-purple-200/80 bg-slate-50 shrink-0">
            <Image
              src={client.avatarUrl}
              alt={client.name}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
          <div className="flex flex-col items-start min-w-0">
            <span className="text-xs font-bold text-slate-700 leading-none truncate w-full">{client.name}</span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 truncate w-full">{client.company}</span>
          </div>
        </div>
      )}

      {/* Progress Section */}
      <div className="flex flex-col gap-2 w-full mt-1">
        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
          <span>Progress</span>
          <span className="text-slate-800 font-bold">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} colorClass={progressColors} heightClass="h-1.5" />
      </div>

      {/* Divider */}
      <div className="w-full border-t border-slate-100/70 my-3" />

      {/* Bottom Section: Budget & Dates */}
      <div className="grid grid-cols-2 gap-2 text-left w-full">
        {/* Budget */}
        <div className="flex flex-col col-span-1">
          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Budget</span>
          <span className="text-xs font-bold text-slate-800 flex items-center gap-0.5 mt-0.5">
            <DollarSign className="w-3 h-3 text-slate-400 shrink-0" />
            {project.budget}k
          </span>
        </div>
        {/* Deadline */}
        <div className="flex flex-col items-end col-span-1">
          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Deadline</span>
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
