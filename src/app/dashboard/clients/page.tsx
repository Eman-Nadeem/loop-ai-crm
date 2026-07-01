"use client";

import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Client, getClients } from "@/lib/mock-data/clients";
import ClientCard from "@/components/clients/client-card";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "freelancer" | "fiverr" | "upwork">("all");

  useEffect(() => {
    async function loadClients() {
      try {
        const data = await getClients();
        setClients(data);
      } catch (error) {
        console.error("Failed to load clients:", error);
      } finally {
        setLoading(false);
      }
    }
    loadClients();
  }, []);

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
    alert("The 'Add New Client' wizard is scoped for Future Chunks. Please check TODO.md for details!");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Row: Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manage Clients</h1>
        </div>

        {/* Search, Filter Icon, Add Button */}
        <div className="flex items-center gap-2">
          {/* Interactive Search Bar */}
          <div className="relative">
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
            className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 hover:shadow-lg transition-all cursor-pointer"
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
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredClients.map((client) => (
              <motion.div
                layout
                key={client.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <ClientCard client={client} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
