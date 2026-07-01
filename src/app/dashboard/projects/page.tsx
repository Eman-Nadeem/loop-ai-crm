"use client";

import React, { useState } from "react";
import { Search, SlidersHorizontal, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Project } from "@/lib/mock-data/projects";
import ProjectCard from "@/components/projects/project-card";
import { useCRM } from "@/lib/context/crm-context";
import Dialog from "@/components/ui/dialog";

export default function ProjectsPage() {
  const { projects, clients, loading, addProject } = useCRM();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed" | "on_hold">("all");
  
  // Dialog Open state
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    status: "active" as "active" | "completed" | "on_hold",
    budget: 0,
    startDate: new Date().toISOString().split("T")[0],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days out default
    progress: 0,
  });

  // Filter & Search Logic
  const filteredProjects = projects.filter((project) => {
    const matchesFilter =
      activeFilter === "all" || project.status === activeFilter;
    
    const clientName = project.client?.name || "";
    const clientCompany = project.client?.company || "";

    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientCompany.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesFilter && matchesSearch;
  });

  const handleAddNewProject = () => {
    // Reset form to defaults
    setFormData({
      name: "",
      clientId: clients.length > 0 ? clients[0].id : "",
      status: "active",
      budget: 0,
      startDate: new Date().toISOString().split("T")[0],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      progress: 0,
    });
    setIsAddOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) {
      alert("Please onboard a client first before tracking a project!");
      return;
    }
    
    addProject({
      name: formData.name,
      clientId: formData.clientId,
      status: formData.status,
      budget: Number(formData.budget),
      startDate: formData.startDate,
      deadline: formData.deadline,
      progress: Number(formData.progress),
    });
    setIsAddOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Row: Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manage Projects</h1>
        </div>

        {/* Search, Filter Icon, Add Button */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Interactive Search Bar */}
          <div className="relative w-full sm:w-auto flex-1 sm:flex-initial">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full sm:w-56 text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-medium"
            />
          </div>

          {/* Settings Filter Button */}
          <button className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition-colors cursor-pointer" title="Refine Filters">
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Add Project Button */}
          <button
            onClick={handleAddNewProject}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 hover:shadow-lg transition-all cursor-pointer flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4" />
            <span>Add new Project</span>
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        {(["all", "active", "completed", "on_hold"] as const).map((filter) => {
          const isActive = activeFilter === filter;
          const label = 
            filter === "all" 
              ? "All Projects" 
              : filter === "on_hold"
                ? "On Hold"
                : filter.charAt(0).toUpperCase() + filter.slice(1);
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                isActive
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Project Card Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="text-xs font-medium">Fetching workspace projects...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 rounded-4xl bg-slate-50/50">
          <p className="text-sm font-semibold text-slate-500">No projects match your filter or query.</p>
          <p className="text-xs text-slate-400 mt-1">Try modifying your search keywords or resetting the filter pill.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                layout="position"
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Project Dialog Modal */}
      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Track New Project">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          {/* Project Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Project Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Website Redesign & Branding"
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-medium"
            />
          </div>

          {/* Client Owner Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Client Owner</label>
            {clients.length === 0 ? (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold">
                No active clients found. Please onboard a client first.
              </div>
            ) : (
              <select
                value={formData.clientId}
                onChange={(e) => setFormData((prev) => ({ ...prev, clientId: e.target.value }))}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-semibold"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company})
                  </option>
                ))}
              </select>
            )}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, budget: Number(e.target.value) }))}
                placeholder="40"
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
              <span>Initial Progress Percentage</span>
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

          {/* Dialog Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100/80 mt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={clients.length === 0}
              className="px-4 py-2.5 text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Track Project
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
