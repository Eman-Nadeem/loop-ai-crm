"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Calendar, DollarSign, Activity, FileCheck2, User } from "lucide-react";
import { motion } from "framer-motion";
import { useCRM } from "@/lib/context/crm-context";
import Dialog from "@/components/ui/dialog";
import AlertDialog from "@/components/ui/alert-dialog";
import ProgressBar from "@/components/ui/progress-bar";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;

  const { projects, updateProject, deleteProject, loading } = useCRM();

  // Dialog States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Retrieve project record
  const project = projects.find((p) => p.id === id);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    status: "active" as "active" | "completed" | "on_hold",
    budget: "" as any,
    startDate: "",
    deadline: "",
    progress: 0,
  });

  // Load project data into form when opening edit dialog
  const handleOpenEdit = () => {
    if (project) {
      setFormData({
        name: project.name,
        status: project.status,
        budget: project.budget,
        startDate: project.startDate,
        deadline: project.deadline,
        progress: project.progress,
      });
      setIsEditOpen(true);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    updateProject(project.id, {
      name: formData.name,
      status: formData.status,
      budget: Number(formData.budget),
      startDate: formData.startDate,
      deadline: formData.deadline,
      progress: Number(formData.progress),
    });

    setIsEditOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!project) return;
    deleteProject(project.id);
    router.push("/dashboard/projects");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-2">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-slate-200 border-t-purple-600" />
        <span className="text-xs font-medium">Loading project details...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm font-semibold text-slate-500">Project record not found.</p>
        <Link href="/dashboard/projects" className="text-xs font-semibold text-indigo-600 hover:underline mt-2">
          Back to Projects Directory
        </Link>
      </div>
    );
  }

  const { client } = project;

  // Status style mapping
  const statusStyles = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-100/85",
    completed: "bg-slate-100 text-slate-700 border-slate-200/85",
    on_hold: "bg-amber-50 text-amber-700 border-amber-100/85",
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      {/* Top Header Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/dashboard/projects"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to directory</span>
        </Link>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenEdit}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Project</span>
          </button>
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100/80 border border-red-100 text-red-600 hover:text-red-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Project</span>
          </button>
        </div>
      </div>

      {/* Main Project Header Block */}
      <div className="bg-white rounded-4xl border border-slate-100 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <div className="flex flex-col gap-3 text-left">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${statusStyles}`}>
              {statusLabels}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">{project.name}</h1>
        </div>

        {/* Linked Client Bubble */}
        {client && (
          <Link href={`/dashboard/clients/${client.id}`} className="shrink-0 group">
            <div className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50/20 border border-slate-100/80 hover:border-indigo-100 rounded-3xl transition-all shadow-xs cursor-pointer">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-purple-200/80 bg-slate-100 shrink-0">
                <Image
                  src={client.avatarUrl}
                  alt={client.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="flex flex-col items-start min-w-[120px] text-left pr-2">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Client Owner</span>
                <span className="text-xs font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors mt-0.5">{client.name}</span>
                <span className="text-[10px] text-slate-400 font-medium leading-none truncate w-32 mt-0.5">{client.company}</span>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Key Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Budget Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-[0_2px_15px_rgba(0,0,0,0.005)] min-h-[105px]">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            Project Budget
          </span>
          <span className="text-xl font-extrabold text-slate-800 tracking-tight mt-1">${project.budget}k</span>
        </div>

        {/* Start Date Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-[0_2px_15px_rgba(0,0,0,0.005)] min-h-[105px]">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Start Date
          </span>
          <span className="text-xs font-bold text-slate-800 tracking-tight mt-1">
            {project.startDate
              ? new Date(project.startDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A"}
          </span>
        </div>

        {/* Deadline Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-[0_2px_15px_rgba(0,0,0,0.005)] min-h-[105px]">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Project Deadline
          </span>
          <span className="text-xs font-bold text-slate-800 tracking-tight mt-1">
            {project.deadline
              ? new Date(project.deadline).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A"}
          </span>
        </div>

        {/* Progress Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-[0_2px_15px_rgba(0,0,0,0.005)] min-h-[105px]">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            Milestone Progress
          </span>
          <div className="flex flex-col gap-1.5 w-full mt-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 leading-none">
              <span>Completed</span>
              <span>{project.progress}%</span>
            </div>
            <ProgressBar value={project.progress} colorClass={progressColors} heightClass="h-1.5" />
          </div>
        </div>
      </div>

      {/* Edit Project Dialog Form */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Project Details">
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 pt-1">
          {/* Project Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Project Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Website Redesign"
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-medium"
            />
          </div>

          {/* Status & Budget Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Project Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-semibold"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Project Budget ($k)</label>
              <input
                type="number"
                required
                min={0}
                value={formData.budget}
                onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value as any }))}
                placeholder="50"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Start Date & Deadline Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-semibold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Deadline</label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-semibold"
              />
            </div>
          </div>

          {/* Progress Field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              <span>Progress Percentage</span>
              <span className="text-slate-700 font-bold">{formData.progress}%</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData((prev) => ({ ...prev, progress: Number(e.target.value) }))}
                className="flex-1 accent-indigo-600 bg-slate-100 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData((prev) => ({ ...prev, progress: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                className="w-16 text-center text-xs px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-bold"
              />
            </div>
          </div>

          {/* Dialog buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100/80 mt-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 hover:shadow-lg transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Dialog>

      {/* Delete Project Dialog Confirmation */}
      <AlertDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Are you absolutely sure?"
        description={`This action will permanently delete ${project.name} and clear all historical sprint progress. This cannot be undone.`}
        confirmText="Yes, delete project"
        cancelText="Cancel"
        isDestructive={true}
      />
    </motion.div>
  );
}
