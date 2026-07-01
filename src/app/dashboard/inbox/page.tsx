"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Search, Send, ArrowLeft, Sparkles, Loader2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Thread, Message, getThreads } from "@/lib/mock-data/messages";

export default function InboxPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMsgText, setNewMsgText] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileActive, setMobileActive] = useState(false); // Controls mobile pane toggle

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadInbox() {
      try {
        const data = await getThreads();
        setThreads(data);
        // Default to selecting the first thread on desktop
        if (data.length > 0) {
          setActiveThreadId(data[0].clientId);
          // Mark first thread as read
          markThreadAsRead(data[0].clientId, data);
        }
      } catch (error) {
        console.error("Failed to load threads:", error);
      } finally {
        setLoading(false);
      }
    }
    loadInbox();
  }, []);

  // Auto scroll to bottom of chat feed when active thread changes or messages update
  const activeThread = threads.find((t) => t.clientId === activeThreadId);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThreadId, activeThread?.messages]);

  const markThreadAsRead = (threadId: string, currentThreads: Thread[]) => {
    setThreads((prev) => {
      const target = prev.length > 0 ? prev : currentThreads;
      return target.map((t) => {
        if (t.clientId === threadId) {
          return {
            ...t,
            messages: t.messages.map((m) => ({ ...m, read: true })),
          };
        }
        return t;
      });
    });
  };

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    markThreadAsRead(threadId, threads);
    setMobileActive(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim() || !activeThreadId) return;

    const newMessage: Message = {
      id: `me_${Date.now()}`,
      sender: "me",
      text: newMsgText,
      timestamp: new Date().toISOString(),
      read: true,
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.clientId === activeThreadId) {
          return {
            ...t,
            messages: [...t.messages, newMessage],
          };
        }
        return t;
      })
    );

    setNewMsgText("");
  };

  const handleSuggestAIDraft = () => {
    alert("AI draft suggestion is scheduled for Chunk 5! When clicked, it will inspect this thread's context and output a suggested reply draft.");
  };

  // Filter threads by search query
  const filteredThreads = threads.filter((t) => {
    const clientName = t.client?.name || "";
    const clientCompany = t.client?.company || "";
    const lastMsgText = t.messages[t.messages.length - 1]?.text || "";
    return (
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMsgText.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="text-xs font-medium">Loading conversation threads...</span>
      </div>
    );
  }

  return (
    <div className="bg-white h-[calc(100vh-73px)] flex overflow-hidden w-full">
        {/* Left Pane: Conversations List */}
        <div
          className={`w-full md:w-80 border-r border-slate-100 flex flex-col shrink-0 bg-slate-50/10 ${
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
                placeholder="Search messages..."
                className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Threads list */}
          <div className="flex-1 overflow-y-auto">
            {filteredThreads.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">No conversations found.</div>
            ) : (
              filteredThreads.map((thread) => {
                const { client, messages } = thread;
                if (!client) return null;

                const isSelected = activeThreadId === thread.clientId;
                const lastMsg = messages[messages.length - 1];
                const unreadCount = messages.filter((m) => !m.read && m.sender === "client").length;

                return (
                  <button
                    key={thread.clientId}
                    onClick={() => handleSelectThread(thread.clientId)}
                    className={`w-full flex items-start gap-3 p-4 border-b border-slate-100/50 hover:bg-slate-50/50 transition-all text-left cursor-pointer ${
                      isSelected ? "bg-indigo-50/30 border-l-2 border-l-indigo-600" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-purple-200/80 bg-slate-50 shrink-0">
                      <Image src={client.avatarUrl} alt={client.name} fill className="object-cover" sizes="40px" />
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="text-xs font-bold text-slate-800 truncate">{client.name}</span>
                        <span className="text-[9px] text-slate-400 font-medium">
                          {lastMsg ? formatTime(lastMsg.timestamp) : ""}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold truncate leading-none mb-1.5">
                        {client.company}
                      </div>
                      <p className={`text-xs text-slate-500 truncate leading-snug ${unreadCount > 0 ? "font-bold text-slate-800" : ""}`}>
                        {lastMsg ? lastMsg.text : "No messages"}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {unreadCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Selected Conversation Chat Feed */}
        <div className={`flex-1 flex flex-col bg-white ${!mobileActive ? "hidden md:flex" : "flex"}`}>
          {activeThread && activeThread.client ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setMobileActive(false)}
                    className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg md:hidden mr-1 transition-all cursor-pointer"
                    aria-label="Back to List"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Avatar */}
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-purple-200/80 bg-slate-50 shrink-0">
                    <Image
                      src={activeThread.client.avatarUrl}
                      alt={activeThread.client.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>

                  {/* Active Client Details */}
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-extrabold text-slate-800">{activeThread.client.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5">
                      {activeThread.client.role}, {activeThread.client.company}
                    </span>
                  </div>
                </div>

                {/* AI Draft Suggest Button */}
                <button
                  onClick={handleSuggestAIDraft}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-indigo-100 hover:border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Suggest Reply</span>
                </button>
              </div>

              {/* Message History Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/10 flex flex-col gap-4">
                {activeThread.messages.map((msg) => {
                  const isMe = msg.sender === "me";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col gap-1 max-w-[75%] ${
                        isMe ? "self-end items-end" : "self-start items-start"
                      }`}
                    >
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-[0_1px_3px_rgba(0,0,0,0.01)] ${
                          isMe
                            ? "bg-linear-to-tr from-purple-600 to-indigo-600 text-white rounded-br-xs"
                            : "bg-white border border-slate-100 text-slate-800 rounded-bl-xs"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium px-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex items-center relative gap-2 bg-white">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newMsgText}
                    onChange={(e) => setNewMsgText(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full text-xs py-3.5 pl-4 pr-11 bg-slate-50/60 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!newMsgText.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white border border-slate-100 hover:border-purple-100 hover:bg-purple-50 text-slate-400 hover:text-purple-600 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-400 disabled:border-slate-100 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Empty state (No thread selected) */
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center shadow-xs">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold">Select a conversation thread to start messaging</span>
            </div>
          )}
        </div>
      </div>
  );
}
