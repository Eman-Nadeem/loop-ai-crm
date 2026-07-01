"use client";

import React, { useState } from "react";
import { Search, SlidersHorizontal, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Client } from "@/lib/mock-data/clients";
import ClientCard from "@/components/clients/client-card";
import { useCRM } from "@/lib/context/crm-context";
import Dialog from "@/components/ui/dialog";

export default function ClientsPage() {
  const { clients, loading, addClient } = useCRM();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "freelancer" | "fiverr" | "upwork">("all");
  
  // Dialog Open state
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    company: "",
    sector: "UX/UI Design" as "UX/UI Design" | "Branding" | "Media",
    platform: "upwork" as "upwork" | "fiverr" | "freelancer",
    budget: 0,
    agreementStatus: "signed" as "signed" | "negotiating",
    clientSince: new Date().toISOString().split("T")[0],
  });

  // Filter & Search Logic
  const filteredClients = clients.filter((client) => {
    const matchesFilter =
      activeFilter === "all" || client.platform === activeFilter;
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.sector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAddNewClient = () => {
    // Reset form to defaults
    setFormData({
      name: "",
      role: "",
      company: "",
      sector: "UX/UI Design",
      platform: "upwork",
      budget: 0,
      agreementStatus: "signed",
      clientSince: new Date().toISOString().split("T")[0],
    });
    setIsAddOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClient({
      name: formData.name,
      role: formData.role,
      company: formData.company,
      sector: formData.sector,
      platform: formData.platform,
      budget: Number(formData.budget),
      agreementStatus: formData.agreementStatus,
      clientSince: formData.clientSince,
    });
    setIsAddOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Row: Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manage Clients</h1>
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
              placeholder="Search clients..."
              className="w-full sm:w-56 text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-medium"
            />
          </div>

          {/* Settings Filter Button */}
          <button className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition-colors cursor-pointer" title="Refine Filters">
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Add Client Button */}
          <button
            onClick={handleAddNewClient}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 hover:shadow-lg transition-all cursor-pointer flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4" />
            <span>Add new Client</span>
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        {(["all", "freelancer", "fiverr", "upwork"] as const).map((filter) => {
          const isActive = activeFilter === filter;
          const label = filter === "all" ? "All Clients" : filter.charAt(0).toUpperCase() + filter.slice(1);
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

      {/* Client Card Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="text-xs font-medium">Fetching client intelligence...</span>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 rounded-4xl bg-slate-50/50">
          <p className="text-sm font-semibold text-slate-500">No clients match your filter or query.</p>
          <p className="text-xs text-slate-400 mt-1">Try modifying your search keywords or resetting the filter pill.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredClients.map((client) => (
              <motion.div
                layout="position"
                key={client.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <ClientCard client={client} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Client Dialog Modal */}
      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Onboard New Client">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          {/* Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Sarah Jenkins"
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-medium"
            />
          </div>

          {/* Role & Company Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Job Title</label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                placeholder="e.g. VP of Product"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Company Name</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                placeholder="e.g. FlowCore"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Sector & Source Platform Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Sector</label>
              <select
                value={formData.sector}
                onChange={(e) => setFormData((prev) => ({ ...prev, sector: e.target.value as any }))}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-semibold"
              >
                <option value="UX/UI Design">UX/UI Design</option>
                <option value="Branding">Branding</option>
                <option value="Media">Media</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Lead Channel</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData((prev) => ({ ...prev, platform: e.target.value as any }))}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-semibold"
              >
                <option value="upwork">Upwork</option>
                <option value="fiverr">Fiverr</option>
                <option value="freelancer">Freelancer</option>
              </select>
            </div>
          </div>

          {/* Budget & Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Contract Budget ($k)</label>
              <input
                type="number"
                required
                min={0}
                value={formData.budget}
                onChange={(e) => setFormData((prev) => ({ ...prev, budget: Number(e.target.value) }))}
                placeholder="100"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Agreement Status</label>
              <select
                value={formData.agreementStatus}
                onChange={(e) => setFormData((prev) => ({ ...prev, agreementStatus: e.target.value as any }))}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-semibold"
              >
                <option value="signed">Signed</option>
                <option value="negotiating">Negotiating</option>
              </select>
            </div>
          </div>

          {/* Client Since date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Client Since</label>
            <input
              type="date"
              required
              value={formData.clientSince}
              onChange={(e) => setFormData((prev) => ({ ...prev, clientSince: e.target.value }))}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-semibold"
            />
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
              className="px-4 py-2.5 text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 hover:shadow-lg transition-all cursor-pointer"
            >
              Onboard Client
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
