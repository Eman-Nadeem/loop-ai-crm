"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { Plus, Menu, X, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function TopNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Overview", href: "/dashboard/overview" },
    { label: "Clients", href: "/dashboard/clients" },
    { label: "Projects", href: "/dashboard/projects" },
    { label: "Inbox", href: "/dashboard/inbox" },
    { label: "Analytics", href: "/dashboard/analytics" },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between px-6 py-4 border-b border-slate-100/80 bg-white/80 backdrop-blur-md gap-2 lg:gap-0 sticky top-0 z-50">
      {/* Top Row (Always visible, responsive) */}
      <div className="flex items-center justify-between w-full lg:w-auto gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/overview" className="flex items-center gap-2">
            {/* Loop Icon (Double Circle) */}
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-linear-to-tr from-purple-600 to-indigo-500 text-white shadow-sm shadow-purple-200">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7C4.747 9.547 4.7 10.768 4.7 12s.047 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.092-1.209.138-2.43.138-3.662z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12a3 3 0 116 0 3 3 0 01-6 0z"
                />
              </svg>
            </div>
            <span className="font-bold text-slate-800 tracking-tight text-lg">LoopAI</span>
          </Link>

          {/* AI Copilot shortcut button */}
          <Link
            href="/dashboard/ai"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-700 rounded-xl text-xs font-bold shadow-3xs transition-colors ml-3 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-650 animate-pulse" />
            <span>AI Copilot</span>
          </Link>

          {/* Clerk Org Switcher */}
          <div className="border-l border-slate-200 pl-3 py-0.5 max-w-[120px] sm:max-w-none overflow-hidden">
            <OrganizationSwitcher
              afterCreateOrganizationUrl="/dashboard/overview"
              afterLeaveOrganizationUrl="/dashboard/overview"
              afterSelectOrganizationUrl="/dashboard/overview"
              appearance={{
                elements: {
                  rootBox: "flex items-center text-slate-600",
                  organizationSwitcherTrigger: "py-1 px-2 border border-slate-100 hover:border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium",
                }
              }}
            />
          </div>
        </div>

        {/* Mobile controls (UserButton + Hamburger) */}
        <div className="flex items-center gap-2 lg:hidden">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-7 h-7 rounded-full border border-purple-200 shadow-sm",
              }
            }}
          />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-slate-500 hover:text-slate-800 border border-slate-200/60 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Center: Navigation Links (Desktop) */}
      <div className="hidden lg:flex items-center gap-1 sm:gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative px-4 py-1.5 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                isActive
                  ? "text-slate-800"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="activeNavBorder"
                  className="absolute inset-0 bg-white border-2 border-purple-700 rounded-full -z-10 shadow-xs"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Right: Clerk UserButton (Desktop) */}
      <div className="hidden lg:flex items-center gap-3">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 rounded-full border border-purple-200 shadow-sm",
            }
          }}
        />
      </div>

      {/* Mobile Drawer (Visible when expanded on small screens) */}
      {isOpen && (
        <div className="w-full lg:hidden flex flex-col gap-4 pt-4 border-t border-slate-100 mt-2 animate-in fade-in slide-in-from-top-4 duration-200">
          {/* Navigation Links list */}
          <div className="flex flex-col gap-1">
            {[...navItems, { label: "AI Copilot", href: "/dashboard/ai" }].map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2.5 text-sm font-semibold rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-50 border-slate-200 text-slate-800 font-bold"
                      : "bg-transparent border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* AI Copilot shortcut badge (mobile menu) */}
          <div className="flex items-center gap-2 px-4 py-2 border-t border-slate-100/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">Copilot:</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 border border-purple-100 text-purple-700 rounded-lg text-[9px] font-extrabold select-none">
              <Sparkles className="w-2.5 h-2.5 text-purple-500 animate-pulse" />
              <span>ACTIVE SYNC</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
