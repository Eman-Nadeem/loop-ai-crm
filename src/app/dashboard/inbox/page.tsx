import React from "react";
import { Mail } from "lucide-react";

export default function InboxPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-slate-200 rounded-4xl bg-slate-50/50 p-8">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100 shadow-sm">
        <Mail className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold text-slate-800 tracking-tight">Inbox Hub</h1>
      <p className="text-sm font-semibold text-slate-500 mt-2">Coming soon!</p>
      <p className="text-xs text-slate-400 mt-1 max-w-sm">
        Integrated customer communications aggregating Upwork, Freelancer, and Fiverr message threads are currently scheduled for Future Chunks.
      </p>
    </div>
  );
}
