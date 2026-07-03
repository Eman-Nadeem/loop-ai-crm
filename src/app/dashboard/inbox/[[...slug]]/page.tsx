"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Search, 
  Send, 
  ArrowLeft, 
  Sparkles, 
  Loader2, 
  MessageSquare, 
  RotateCw, 
  Check, 
  Mail,
  ArrowDownLeft,
  ArrowUpRight,
  Paperclip
} from "lucide-react";
import { useCRM } from "@/lib/context/crm-context";

interface InboxPageProps {
  params: Promise<{ slug?: string[] }>;
}

export default function InboxPage({ params }: InboxPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;

  const clientId = slug?.[0] || null;
  const emailId = slug?.[1] || null;

  const {
    threads,
    loading,
    addMessage,
    markThreadAsRead,
    isGmailConnected,
    gmailSyncing,
    syncGmail,
    disconnectGmail,
    addToast,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState("");
  const [newMsgText, setNewMsgText] = useState("");
  const [mobileActive, setMobileActive] = useState(false); // Controls mobile pane toggle
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "unmatched">("all");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Find active thread details
  const activeThread = threads.find((t) => t.clientId === clientId) || null;
  // Find active message details
  const activeMessage = activeThread?.messages.find((m) => m.id === emailId) || null;

  // Auto-scroll messages to bottom (if viewing details)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessage]);

  // Mark selected thread as read
  useEffect(() => {
    if (clientId && activeThread && !activeThread.isUnmatched) {
      const hasUnread = activeThread.messages.some((m) => !m.read && m.sender === "client");
      if (hasUnread) {
        markThreadAsRead(clientId);
      }
    }
  }, [clientId, activeThread, markThreadAsRead]);

  // Check query param to trigger AI Suggest Draft automatically
  useEffect(() => {
    const triggerAI = searchParams.get("generateAI");
    if (triggerAI === "true" && activeMessage && activeMessage.sender === "client" && !newMsgText) {
      handleSuggestAIDraft();
      // Remove query param to prevent loop
      const cleanPath = `/dashboard/inbox/${clientId}/${emailId}`;
      router.replace(cleanPath);
    }
  }, [searchParams, activeMessage]);

  const handleSelectThread = (id: string) => {
    router.push(`/dashboard/inbox/${id}`);
    setMobileActive(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim() || !activeThread || !activeMessage) return;

    const email = activeThread.isUnmatched ? activeThread.unmatchedEmail : activeThread.client?.email;
    if (!email) return;

    const subject = activeMessage.subject
      ? (activeMessage.subject.toLowerCase().startsWith("re:") ? activeMessage.subject : `Re: ${activeMessage.subject}`)
      : "Follow-up via LoopAI";
    const body = newMsgText;

    const composeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      email
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Always open Gmail Compose in a new tab
    window.open(composeUrl, "_blank");
    
    if (isGmailConnected) {
      addToast("Opening Gmail Compose in a new tab...", "info");
    } else {
      // If Gmail is not connected, log the draft locally for session continuity
      addMessage(activeThread.clientId, newMsgText, "me");
      addToast("Opening Gmail Compose. Connect Gmail to auto-sync replies.", "info");
    }
    
    setNewMsgText("");
  };

  const handleSuggestAIDraft = async () => {
    if (!activeThread || !activeMessage || isGeneratingReply) return;

    const clientPayload = activeThread.isUnmatched
      ? { name: "Prospect", email: activeThread.unmatchedEmail, company: "No matching client", role: "Contact" }
      : activeThread.client;

    // Get the previous 5-6 emails leading up to the active message as context to prevent hallucinations
    const sortedMessages = [...activeThread.messages].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const activeIdx = sortedMessages.findIndex((m) => m.id === activeMessage.id);
    const startIdx = Math.max(0, activeIdx - 6); // Keep up to 6 previous messages for context
    const contextMessages = activeIdx !== -1 
      ? sortedMessages.slice(startIdx, activeIdx + 1)
      : [activeMessage];

    setIsGeneratingReply(true);
    try {
      const response = await fetch("/api/chat/suggest-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client: clientPayload,
          messages: contextMessages,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate suggestion");
      }

      const data = await response.json();
      setNewMsgText(data.draft || "");
    } catch (error) {
      console.error("[Suggest Reply Error]:", error);
      addToast("Failed to generate reply draft.", "error");
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const unmatchedCount = threads.filter((t) => t.isUnmatched).length;

  // Filter threads by search and active tab
  const filteredThreads = threads.filter((thread) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = searchQuery.trim() === "" || (() => {
      if (thread.isUnmatched) {
        return thread.unmatchedEmail?.toLowerCase().includes(q) || 
               thread.messages.some(m => m.subject?.toLowerCase().includes(q) || m.text.toLowerCase().includes(q));
      }
      const client = thread.client;
      if (!client) return false;
      return client.name.toLowerCase().includes(q) || 
             client.company.toLowerCase().includes(q) ||
             thread.messages.some(m => m.subject?.toLowerCase().includes(q) || m.text.toLowerCase().includes(q));
    })();

    if (!matchesSearch) return false;

    if (filterTab === "unread") {
      return thread.messages.some(m => !m.read && m.sender === "client");
    }
    if (filterTab === "unmatched") {
      return !!thread.isUnmatched;
    }
    return true; // "all"
  });

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const diffMs = new Date().getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return `${Math.max(1, diffMins)}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const formatListDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    if (isToday) {
      return `Today, ${timeStr}`;
    } else if (isYesterday) {
      return `Yesterday, ${timeStr}`;
    } else {
      const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
      return `${weekday}, ${timeStr}`;
    }
  };

  const formatDetailedDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  // Simulated Attachments Helper
  const getAttachments = (text: string) => {
    if (text.toLowerCase().includes("attach") || text.toLowerCase().includes("logo files") || text.toLowerCase().includes("guidelines")) {
      return [{ name: "brand-guidelines-final.pdf", size: "2.4 MB" }];
    }
    return [];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-purple-650" />
        <span className="text-xs font-medium">Loading conversation threads...</span>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-73px)] overflow-hidden w-full bg-white border-t border-slate-100">
      {/* Left Pane: Conversations List (280px wide) */}
      <div
        className={`w-[280px] border-r border-slate-100 flex flex-col shrink-0 bg-slate-50/10 ${
          mobileActive ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100/80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search threads..."
              className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-medium"
            />
          </div>
        </div>

        {/* Minimalist Gmail Sync/Status Toolbar */}
        {isGmailConnected ? (
          <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center gap-2 select-none shrink-0">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Synced</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={syncGmail}
                disabled={gmailSyncing}
                className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg text-[9px] font-extrabold shadow-3xs cursor-pointer disabled:opacity-60 transition-all"
              >
                <RotateCw className={`w-2.5 h-2.5 ${gmailSyncing ? "animate-spin text-indigo-600" : "text-slate-400"}`} />
                <span>Sync</span>
              </button>
              <button
                onClick={disconnectGmail}
                className="text-[9px] font-extrabold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 py-2.5 border-b border-indigo-50/40 bg-indigo-50/10 flex items-center justify-between gap-2 shrink-0">
            <span className="text-[10px] text-slate-500 font-semibold leading-none">Gmail disconnected</span>
            <a
              href="/api/auth/google"
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-extrabold shadow-xs transition-all cursor-pointer"
            >
              Connect
            </a>
          </div>
        )}

        {/* Filter tabs */}
        <div className="px-3.5 py-3 border-b border-slate-100/50 flex gap-1.5 overflow-x-auto select-none scrollbar-none shrink-0">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTab === "all" ? "bg-slate-900 text-white shadow-xs" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterTab("unread")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTab === "unread" ? "bg-slate-900 text-white shadow-xs" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilterTab("unmatched")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              filterTab === "unmatched" ? "bg-slate-900 text-white shadow-xs" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            Unmatched · {unmatchedCount}
          </button>
        </div>

        {/* Threads list */}
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-semibold">No threads found.</div>
          ) : (
            filteredThreads.map((thread) => {
              const { client, messages, isUnmatched, unmatchedEmail } = thread;
              const isSelected = clientId === thread.clientId;
              const lastMsg = messages[messages.length - 1];
              const unreadCount = messages.filter((m) => !m.read && m.sender === "client").length;

              const displayName = isUnmatched ? unmatchedEmail : client?.name || "Client";
              const displaySub = isUnmatched ? "No matching client" : client?.company || "Company";

              return (
                <button
                  key={thread.clientId}
                  onClick={() => handleSelectThread(thread.clientId)}
                  className={`w-full flex items-start gap-3 p-4 border-b border-slate-100/50 hover:bg-slate-50/50 transition-all text-left cursor-pointer ${
                    isSelected ? "bg-indigo-50/30 border-l-2 border-l-indigo-600" : ""
                  } ${isUnmatched ? "opacity-75 hover:opacity-95" : ""}`}
                >
                  {/* Client Profile Photo or Mail Icon */}
                  {isUnmatched ? (
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-50 shrink-0 shadow-2xs">
                      {client?.avatarUrl ? (
                        <Image 
                          src={client.avatarUrl} 
                          alt={client.name} 
                          fill 
                          className="object-cover" 
                          sizes="40px" 
                        />
                      ) : (
                        <div className="w-full h-full bg-indigo-900/10 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {client?.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Meta info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5 gap-2">
                      <span className={`text-xs font-extrabold text-slate-800 truncate ${isUnmatched ? "text-slate-500 font-semibold" : ""}`}>
                        {displayName}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] text-slate-400 font-medium">
                          {lastMsg ? formatTime(lastMsg.timestamp) : ""}
                        </span>
                        {unreadCount > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                        )}
                      </div>
                    </div>
                    <div className={`text-[10px] text-slate-400 font-bold truncate leading-none mb-1.5 ${isUnmatched ? "text-slate-400/80 font-medium" : ""}`}>
                      {displaySub}
                    </div>
                    <p className={`text-xs text-slate-500 truncate leading-snug ${unreadCount > 0 ? "font-bold text-slate-800" : ""}`}>
                      {lastMsg ? (lastMsg.subject || lastMsg.text) : "No messages"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Conversation Details View */}
      <div className={`flex-1 flex flex-col bg-white ${!mobileActive ? "hidden md:flex" : "flex"}`}>
        {activeThread ? (
          activeMessage ? (
            /* Email Viewer State */
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <button
                onClick={() => router.push(`/dashboard/inbox/${clientId}`)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors font-bold cursor-pointer mb-5 align-self-start self-start"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to thread</span>
              </button>

              {/* Main Email Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col gap-4">
                {/* Card Header */}
                <div className="flex justify-between items-start flex-wrap gap-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    {/* User profile or me avatar */}
                    {activeMessage.sender === "me" ? (
                      <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                        ME
                      </div>
                    ) : activeThread.isUnmatched ? (
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 shrink-0">
                        {activeThread.client?.avatarUrl ? (
                          <Image 
                            src={activeThread.client.avatarUrl} 
                            alt={activeThread.client.name} 
                            fill 
                            className="object-cover" 
                            sizes="36px" 
                          />
                        ) : (
                          <div className="w-full h-full bg-indigo-900/10 text-indigo-700 font-bold text-xs flex items-center justify-center">
                            {activeThread.client?.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0,2)}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col text-left">
                      <span className="text-xs font-extrabold text-slate-800">
                        {activeMessage.sender === "me" 
                          ? "You" 
                          : (activeThread.isUnmatched ? activeThread.unmatchedEmail : activeThread.client?.name)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                        {activeMessage.sender === "me" ? "to me" : "to me"}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                    {formatDetailedDate(activeMessage.timestamp)}
                  </span>
                </div>

                {/* Email Subject line */}
                {activeMessage.subject && (
                  <h3 className="text-xs font-bold text-slate-850 text-left pt-1">
                    Subject: {activeMessage.subject}
                  </h3>
                )}

                {/* Email content body */}
                <div className="text-xs text-slate-650 leading-relaxed whitespace-pre-wrap text-left pt-1 font-medium">
                  {activeMessage.text}
                </div>

                {/* Attachment Row (simulated if exists) */}
                {(() => {
                  const attachments = getAttachments(activeMessage.text);
                  if (attachments.length === 0) return null;
                  return (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-600">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-700 hover:underline cursor-pointer">
                        {attachments[0].name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">({attachments[0].size})</span>
                    </div>
                  );
                })()}
              </div>

              {/* Reply box (Only render if the email was received - i.e. sender is client) */}
              {activeMessage.sender === "client" && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4 mt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800">Reply</span>
                    <button
                      type="button"
                      onClick={handleSuggestAIDraft}
                      disabled={isGeneratingReply}
                      className="flex items-center gap-1 px-3 py-1.5 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-[10px] font-bold shadow-3xs cursor-pointer disabled:opacity-60 transition-all"
                    >
                      {isGeneratingReply ? (
                        <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-purple-500" />
                      )}
                      <span>Generate AI draft</span>
                    </button>
                  </div>

                  <textarea
                    value={newMsgText}
                    onChange={(e) => setNewMsgText(e.target.value)}
                    placeholder="AI generated draft will appear here, or write your own reply..."
                    rows={4}
                    className="w-full text-xs p-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100 transition-all text-slate-800 placeholder-slate-400 font-medium resize-none"
                  />

                  <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[10px] font-bold text-slate-500">
                        Opens a pre-filled draft in Gmail — nothing sends from here
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={!newMsgText.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-50 transition-all"
                    >
                      <span>Open in Gmail</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Default State: Flat List of Client Emails only */
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-3">
                  {/* Client profile image or mail icon */}
                  {activeThread.isUnmatched ? (
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0">
                      {activeThread.client?.avatarUrl ? (
                        <Image 
                          src={activeThread.client.avatarUrl} 
                          alt={activeThread.client.name} 
                          fill 
                          className="object-cover" 
                          sizes="40px" 
                        />
                      ) : (
                        <div className="w-full h-full bg-indigo-900/10 text-indigo-755 font-bold text-xs flex items-center justify-center">
                          {activeThread.client?.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col text-left">
                    <h2 className="text-sm font-extrabold text-slate-800">
                      {activeThread.isUnmatched ? activeThread.unmatchedEmail : activeThread.client?.name}
                    </h2>
                    <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                      {activeThread.isUnmatched 
                        ? "No matching client" 
                        : `${activeThread.client?.role}, ${activeThread.client?.company} · ${activeThread.client?.email}`}
                    </span>
                  </div>
                </div>

                {/* New AI Draft Button (only for matched clients) */}
                {!activeThread.isUnmatched && (
                  <button
                    onClick={() => {
                      const latestClientMsg = [...activeThread.messages]
                        .reverse()
                        .find(m => m.sender === "client");
                      if (latestClientMsg) {
                        router.push(`/dashboard/inbox/${clientId}/${latestClientMsg.id}?generateAI=true`);
                      } else if (activeThread.messages.length > 0) {
                        router.push(`/dashboard/inbox/${clientId}/${activeThread.messages[0].id}?generateAI=true`);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-750 rounded-xl text-xs font-bold shadow-3xs cursor-pointer transition-all shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>New AI draft</span>
                  </button>
                )}
              </div>

              {/* Flat list of emails (Oldest First) */}
              {activeThread.messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-semibold">No messages in this thread.</div>
              ) : (
                <>
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.015)]">
                    {[...activeThread.messages]
                      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                      .map((msg, index) => {
                        const isSent = msg.sender === "me";
                        const unread = !msg.read && msg.sender === "client";

                        return (
                          <Link
                            key={msg.id}
                            href={`/dashboard/inbox/${clientId}/${msg.id}`}
                            className={`w-full flex items-start gap-3.5 p-4 text-left transition-all border-b border-slate-100 hover:bg-slate-50/50 ${
                              index === activeThread.messages.length - 1 ? "border-b-0" : ""
                            }`}
                          >
                            {/* Direction Arrow */}
                            <div className="mt-0.5 shrink-0">
                              {isSent ? (
                                <ArrowUpRight className="w-4 h-4 text-indigo-500" />
                              ) : (
                                <ArrowDownLeft className="w-4 h-4 text-slate-400" />
                              )}
                            </div>

                            {/* Subject & First Line Preview */}
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-bold text-slate-800 truncate block">
                                {msg.subject || "No subject"}
                              </span>
                              <span className="text-[11px] text-slate-400 font-semibold truncate block mt-0.5">
                                {msg.text}
                              </span>
                            </div>

                            {/* Date & Unread Status Indicator */}
                            <div className="flex items-center gap-1.5 shrink-0 ml-4">
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {formatListDate(msg.timestamp)}
                              </span>
                              {unread && (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-650 shrink-0" />
                              )}
                            </div>
                          </Link>
                        );
                      })}
                  </div>
                  <span className="text-center text-[10px] text-slate-400 mt-4 font-bold select-none">
                    Received (↙) and sent (↗) shown together, oldest first · click any row to open
                  </span>
                </>
              )}
            </div>
          )
        ) : (
          /* Empty state (No thread selected) */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-4">
            {!isGmailConnected ? (
              <div className="max-w-sm flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Sync with Gmail</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Pull, search, and manage your client threads directly in LoopAI CRM. 
                  We request read-only access (<code>gmail.readonly</code>) to parse and link incoming client emails.
                </p>
                <a
                  href="/api/auth/google"
                  className="mt-2 px-6 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 hover:shadow-lg transition-all"
                >
                  Connect Gmail Account
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold">Select a conversation thread to start messaging</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
