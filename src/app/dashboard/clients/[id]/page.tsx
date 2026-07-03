"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Mail, Calendar, DollarSign, Cpu, Tag, MessageSquare, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { useCRM } from "@/lib/context/crm-context";
import Dialog from "@/components/ui/dialog";
import AlertDialog from "@/components/ui/alert-dialog";
import ProjectCard from "@/components/projects/project-card";

// Gradient helper identical to ClientCard
const getAvatarGradient = (id: string) => {
  const gradients = [
    "from-purple-500 via-pink-500 to-orange-400",
    "from-blue-500 via-indigo-500 to-purple-500",
    "from-green-400 via-teal-500 to-blue-500",
    "from-yellow-400 via-orange-500 to-red-500",
    "from-pink-500 via-purple-500 to-indigo-500",
  ];
  const index = parseInt(id || "0") % gradients.length;
  return gradients[index];
};

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  
  const { clients, projects, threads, updateClient, deleteClient, loading } = useCRM();

  // Dialog States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Retrieve client record
  const client = clients.find((c) => c.id === id);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    company: "",
    sector: "UX/UI Design" as "UX/UI Design" | "Branding" | "Media",
    platform: "upwork" as "upwork" | "fiverr" | "freelancer",
    budget: "" as any,
    agreementStatus: "signed" as "signed" | "negotiating",
    clientSince: "",
  });

  // Load client data into form when opening edit dialog
  const handleOpenEdit = () => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email || "",
        role: client.role,
        company: client.company,
        sector: client.sector,
        platform: client.platform,
        budget: client.budget,
        agreementStatus: client.agreementStatus,
        clientSince: client.clientSince || new Date().toISOString().split("T")[0],
      });
      setIsEditOpen(true);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    
    updateClient(client.id, {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      company: formData.company,
      sector: formData.sector,
      platform: formData.platform,
      budget: Number(formData.budget),
      agreementStatus: formData.agreementStatus,
      clientSince: formData.clientSince,
    });
    
    setIsEditOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!client) return;
    deleteClient(client.id);
    router.push("/dashboard/clients");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-2">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-slate-200 border-t-purple-600" />
        <span className="text-xs font-medium">Loading client details...</span>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm font-semibold text-slate-500">Client profile not found.</p>
        <Link href="/dashboard/clients" className="text-xs font-semibold text-indigo-600 hover:underline mt-2">
          Back to Client Directory
        </Link>
      </div>
    );
  }

  // Filter linked projects
  const linkedProjects = projects.filter((p) => p.clientId === client.id);

  // Pull thread messages
  const thread = threads.find((t) => t.clientId === client.id);
  const previewMessages = thread ? thread.messages.slice(-3) : []; // last 3 messages

  const renderPlatformLogo = () => {
    switch (client.platform) {
      case "upwork":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#14a800] text-white border border-[#14a800]/10 uppercase tracking-wider">
            Upwork
          </span>
        );
      case "fiverr":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#1dbf73] text-white border border-[#1dbf73]/10 uppercase tracking-wider">
            Fiverr
          </span>
        );
      case "freelancer":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0087e0] text-white border border-[#0087e0]/10 uppercase tracking-wider">
            Freelancer
          </span>
        );
      default:
        return null;
    }
  };

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
          href="/dashboard/clients"
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
            <span>Edit Client</span>
          </button>
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100/80 border border-red-100 text-red-600 hover:text-red-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Client</span>
          </button>
        </div>
      </div>

      {/* Main Profile Identity Block */}
      <div className="bg-white rounded-4xl border border-slate-100 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        {/* Avatar Ring */}
        <div className={`p-[3px] rounded-full bg-linear-to-tr ${getAvatarGradient(client.id)} shadow-md`}>
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white bg-slate-50">
            <Image
              src={client.avatarUrl}
              alt={client.name}
              fill
              className="object-cover"
              sizes="96px"
              priority
            />
          </div>
        </div>

        {/* Details and Tagging */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2.5 mt-2">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">{client.name}</h1>
            <p className="text-sm font-semibold text-slate-400 mt-0.5">
              {client.role} at <span className="text-slate-500 font-bold">{client.company}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {renderPlatformLogo()}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200/50 uppercase tracking-wider">
              {client.sector}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${
              client.agreementStatus === "signed"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-amber-50 text-amber-700 border-amber-100"
            }`}>
              {client.agreementStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Key Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Budget Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-[0_2px_15px_rgba(0,0,0,0.005)] min-h-[105px]">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            Active Budget
          </span>
          <span className="text-xl font-extrabold text-slate-800 tracking-tight mt-1">${client.budget}k</span>
        </div>

        {/* Sector Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-[0_2px_15px_rgba(0,0,0,0.005)] min-h-[105px]">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            Market Sector
          </span>
          <span className="text-xs font-bold text-slate-800 tracking-tight mt-1 truncate">{client.sector}</span>
        </div>

        {/* Source Platform Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-[0_2px_15px_rgba(0,0,0,0.005)] min-h-[105px]">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            Lead Channel
          </span>
          <span className="text-xs font-bold text-slate-800 tracking-tight mt-1 capitalize">{client.platform}</span>
        </div>

        {/* Client Since Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-[0_2px_15px_rgba(0,0,0,0.005)] min-h-[105px]">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Client Since
          </span>
          <span className="text-xs font-bold text-slate-800 tracking-tight mt-1">
            {client.clientSince
              ? new Date(client.clientSince).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A"}
          </span>
        </div>
      </div>

      {/* Grid Content Split (Linked Projects + Message Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Linked Projects (Left / 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Linked Deliverables ({linkedProjects.length})
          </h3>

          {linkedProjects.length === 0 ? (
            <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-4xl p-10 text-center flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-slate-500">No projects connected.</span>
              <span className="text-[10px] text-slate-400 mt-1">Projects can be linked to this client under the project editor.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {linkedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} condensed />
              ))}
            </div>
          )}
        </div>

        {/* Inbox / Messages Preview (Right / 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Communication Feed
          </h3>

          <div className="bg-white border border-slate-100 rounded-4xl p-5 shadow-[0_2px_20px_rgba(0,0,0,0.005)] flex flex-col gap-4">
            {previewMessages.length === 0 ? (
              <div className="py-6 text-center text-slate-400 flex flex-col items-center justify-center">
                <span className="text-xs font-bold">No message history found.</span>
                <span className="text-[10px] text-slate-400 mt-1">Go to the Inbox to initiate a conversation thread.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                {previewMessages.map((msg) => {
                  const isMe = msg.sender === "me";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
                    >
                      <div
                        className={`p-3 rounded-2xl text-[11px] leading-relaxed font-medium ${
                          isMe
                            ? "bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-br-none"
                            : "bg-slate-100 text-slate-700 rounded-bl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-slate-400 font-semibold mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="border-t border-slate-100/70 pt-3 text-center">
              <Link
                href="/dashboard/inbox"
                className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <span>View full conversation</span>
                <Mail className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Client Dialog Form */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Client Profile">
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 pt-1">
          {/* Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Jane Doe"
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-medium"
            />
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="e.g. client@example.com"
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
                placeholder="e.g. CEO"
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
                placeholder="e.g. Acme Corp"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Sector & Platform Grid */}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value as any }))}
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

      {/* Delete Client Dialog Confirmation */}
      <AlertDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Are you absolutely sure?"
        description={`This action will permanently delete the profile of ${client.name} and terminate all linked projects under active development. This cannot be undone.`}
        confirmText="Yes, delete client"
        cancelText="Cancel"
        isDestructive={true}
      />
    </motion.div>
  );
}
