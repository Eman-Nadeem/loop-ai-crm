"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { Plus } from "lucide-react";

export default function TopNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/dashboard/overview", disabled: true },
    { label: "Clients", href: "/dashboard/clients", disabled: false },
    { label: "Projects", href: "/dashboard/projects", disabled: true },
    { label: "Inbox", href: "/dashboard/inbox", disabled: true },
    { label: "Analytics", href: "/dashboard/analytics", disabled: true },
  ];

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100/80 bg-white/50 backdrop-blur-sm">
      {/* Left: Logo & Source Avatars & Org Switcher */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clients" className="flex items-center gap-2">
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

        {/* Overlapping Platform Badges */}
        <div className="hidden sm:flex items-center -space-x-2.5 ml-2">
          {/* Upwork */}
          <div className="w-7 h-7 rounded-full bg-[#14a800] border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm" title="Upwork Connected">
            Up
          </div>
          {/* Freelancer (Bird SVG) */}
          <div className="w-7 h-7 rounded-full bg-[#0087e0] border-2 border-white flex items-center justify-center text-white shadow-sm" title="Freelancer Connected">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13H5.5L12 6.5z" />
            </svg>
          </div>
          {/* Fiverr */}
          <div className="w-7 h-7 rounded-full bg-[#1dbf73] border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm" title="Fiverr Connected">
            fi
          </div>
          {/* Add Platform Button */}
          <button className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 border-dashed flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shadow-sm cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Clerk Org Switcher */}
        <div className="border-l border-slate-200 pl-4 py-0.5">
          <OrganizationSwitcher
            afterCreateOrganizationUrl="/dashboard/clients"
            afterLeaveOrganizationUrl="/dashboard/clients"
            afterSelectOrganizationUrl="/dashboard/clients"
            appearance={{
              elements: {
                rootBox: "flex items-center text-slate-600",
                organizationSwitcherTrigger: "py-1 px-2 border border-slate-100 hover:border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium",
              }
            }}
          />
        </div>
      </div>

      {/* Center: Tabs */}
      <div className="flex items-center bg-slate-50/80 border border-slate-100/50 p-1 rounded-full shadow-inner">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          if (item.disabled) {
            return (
              <span
                key={item.label}
                className="px-4 py-1.5 text-sm font-medium text-slate-400 cursor-not-allowed select-none"
              >
                {item.label}
              </span>
            );
          }
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Right: Clerk UserButton */}
      <div className="flex items-center gap-3">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 rounded-full border border-purple-200 shadow-sm",
            }
          }}
        />
      </div>
    </div>
  );
}
