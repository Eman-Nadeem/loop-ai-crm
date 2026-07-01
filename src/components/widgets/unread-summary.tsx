"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import { Thread, getThreads } from "@/lib/mock-data/messages";

interface UnreadSummaryProps {
  threads?: Thread[];
  loading?: boolean;
}

export default function UnreadSummary({ threads: propThreads, loading: propLoading }: UnreadSummaryProps) {
  const [threads, setThreads] = useState<Thread[]>(propThreads || []);
  const [loading, setLoading] = useState(propLoading !== undefined ? propLoading : !propThreads);

  useEffect(() => {
    if (propThreads) {
      setThreads(propThreads);
      setLoading(false);
      return;
    }

    async function loadThreads() {
      try {
        const data = await getThreads();
        setThreads(data);
      } catch (error) {
        console.error("Failed to load threads in UnreadSummary:", error);
      } finally {
        setLoading(false);
      }
    }
    loadThreads();
  }, [propThreads]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all flex items-center justify-center min-h-[160px]">
        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
      </div>
    );
  }

  // Filter threads that contain at least one unread message from the client
  const unreadThreads = threads.filter((t) =>
    t.messages.some((m) => !m.read && m.sender === "client")
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm tracking-tight">Inbox Status</h3>
        <button className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {unreadThreads.length === 0 ? (
        /* Caught up state */
        <div className="flex flex-col items-center justify-center py-6 text-center bg-emerald-50/30 border border-emerald-100/50 rounded-2xl p-4">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 shadow-sm">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs font-bold text-slate-800">You're all caught up!</span>
          <span className="text-[10px] text-slate-400 mt-0.5 font-medium">All incoming messages have been read</span>
        </div>
      ) : (
        /* Unread list */
        <div className="flex flex-col gap-3">
          {/* Badge indicator */}
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
            </span>
            <span className="text-xs font-bold text-slate-700">
              {unreadThreads.length} {unreadThreads.length === 1 ? "thread needs" : "threads need"} attention
            </span>
          </div>

          {/* List of unread conversations */}
          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {unreadThreads.map((thread) => {
              const { client, messages } = thread;
              if (!client) return null;
              
              // Get the last unread message
              const lastUnread = [...messages]
                .reverse()
                .find((m) => !m.read && m.sender === "client");
                
              return (
                <div
                  key={thread.clientId}
                  className="flex items-start gap-2.5 p-2 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all cursor-pointer"
                >
                  {/* Client Avatar */}
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-purple-200/80 bg-slate-50 shrink-0">
                    <Image
                      src={client.avatarUrl}
                      alt={client.name}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                  
                  {/* Summary Text */}
                  <div className="flex flex-col min-w-0 text-left flex-1">
                    <span className="text-xs font-bold text-slate-700 leading-none truncate">{client.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{client.company}</span>
                    <p className="text-[10px] text-slate-500 font-medium truncate mt-1 italic">
                      "{lastUnread?.text || "New message"}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
