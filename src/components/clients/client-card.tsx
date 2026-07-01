"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, Star } from "lucide-react";
import { Client } from "@/lib/mock-data/clients";

interface ClientCardProps {
  client: Client;
  isHoveredExplicitly?: boolean; // For demonstration/testing
}

// Function to generate unique gradients for each card avatar border
const getAvatarGradient = (id: string) => {
  const gradients = [
    "from-purple-500 via-pink-500 to-orange-400",
    "from-blue-500 via-indigo-500 to-purple-500",
    "from-green-400 via-teal-500 to-blue-500",
    "from-yellow-400 via-orange-500 to-red-500",
    "from-pink-500 via-purple-500 to-indigo-500",
  ];
  const index = parseInt(id) % gradients.length;
  return gradients[index];
};

export default function ClientCard({ client }: ClientCardProps) {
  // SVG Platform Logos
  const renderPlatformLogo = () => {
    switch (client.platform) {
      case "upwork":
        return (
          <div className="w-5 h-5 rounded-full bg-[#14a800] flex items-center justify-center text-[8px] font-bold text-white shadow-sm" title="Upwork">
            Up
          </div>
        );
      case "fiverr":
        return (
          <div className="w-5 h-5 rounded-full bg-[#1dbf73] flex items-center justify-center text-[8px] font-bold text-white shadow-sm" title="Fiverr">
            fi
          </div>
        );
      case "freelancer":
        return (
          <div className="w-5 h-5 rounded-full bg-[#0087e0] flex items-center justify-center text-white shadow-sm" title="Freelancer">
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13H5.5L12 6.5z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative group bg-white rounded-4xl border border-slate-100 p-6 flex flex-col items-center justify-between text-center shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_15px_35px_rgba(31,32,41,0.06)] transition-shadow duration-300 min-h-[260px] overflow-hidden"
    >
      {/* Top Action Overlay - Slides in on hover */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Mail Button */}
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          whileHover={{ scale: 1.05 }}
          className="pointer-events-auto p-2 bg-white border border-slate-100 hover:border-purple-100 hover:bg-purple-50 text-slate-400 hover:text-purple-600 rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100 duration-200 cursor-pointer"
        >
          <Mail className="w-4 h-4" />
        </motion.button>

        {/* Star Button */}
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          whileHover={{ scale: 1.05 }}
          className="pointer-events-auto p-2 bg-white border border-slate-100 hover:border-yellow-100 hover:bg-yellow-50 text-slate-400 hover:text-yellow-500 rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100 duration-200 cursor-pointer"
        >
          <Star className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Profile Details Container */}
      <div className="flex flex-col items-center pt-2">
        {/* Avatar Ring */}
        <div className={`p-[2.5px] rounded-full bg-linear-to-tr ${getAvatarGradient(client.id)} shadow-md mb-3`}>
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white bg-slate-50">
            <Image
              src={client.avatarUrl}
              alt={client.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        </div>

        {/* Name and Role */}
        <h4 className="font-bold text-slate-800 text-sm tracking-tight leading-snug">
          {client.name}
        </h4>
        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
          {client.role}, {client.company}
        </p>
      </div>

      {/* Grid Stats Divider */}
      <div className="w-full border-t border-slate-100/70 my-5" />

      {/* Column stats (From, Sector, Budget) */}
      <div className="w-full grid grid-cols-3 text-center">
        {/* From */}
        <div className="flex flex-col items-center justify-between gap-1 border-r border-slate-50">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">From</span>
          <div className="flex items-center justify-center h-6">
            {renderPlatformLogo()}
          </div>
        </div>

        {/* Sector */}
        <div className="flex flex-col items-center justify-between gap-1 border-r border-slate-50">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Sector</span>
          <span className="text-[11px] text-slate-800 font-bold leading-tight h-6 flex items-center">
            {client.sector}
          </span>
        </div>

        {/* Budget */}
        <div className="flex flex-col items-center justify-between gap-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Budget</span>
          <span className="text-[11px] text-slate-800 font-bold leading-tight h-6 flex items-center">
            ${client.budget}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
