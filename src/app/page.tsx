"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen justify-center items-center px-4 py-16 text-slate-800">
      {/* Outer Floating Pill Navigation (Logo + CRM) */}
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm shadow-slate-200/30">
          {/* Small Loop Logo */}
          <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-white">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7C4.747 9.547 4.7 10.768 4.7 12s.047 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.092-1.209.138-2.43.138-3.662z" />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-700">LoopAI</span>
        </div>
        <div className="bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm shadow-slate-200/30">
          <span className="text-xs font-bold text-slate-500">CRM</span>
        </div>
      </div>

      {/* Main landing container card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-slate-200/40 p-8 sm:p-12 shadow-[0_20px_50px_rgba(31,32,41,0.04)] text-center flex flex-col items-center gap-6"
      >
        {/* Glow badge */}
        <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-purple-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 fill-purple-200" />
          <span>Chunk 1 Setup Completed</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Next-Generation Client Intelligence
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-md">
          Manage your client database across Upwork, Freelancer, and Fiverr. 
          Use custom metrics visualizers and AI relationship coaching to supercharge your outcomes.
        </p>

        {/* Feature Highlights */}
        <div className="w-full flex flex-col gap-2.5 text-left border-y border-slate-100 py-6 my-2">
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Responsive Client cards with interactive Framer Motion states</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Interactive search and platform-specific filter pills</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Custom-designed Agreements & Lead Source visual widgets</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>AI Relationship Assistant connected to OpenRouter (Gemini API)</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <Link
            href="/dashboard/overview"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-sm font-semibold shadow-md shadow-indigo-100 hover:shadow-lg transition-all cursor-pointer"
          >
            <span>Enter CRM Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
