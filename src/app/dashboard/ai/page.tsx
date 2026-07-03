"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, RefreshCw, Bot, User, Check, HelpCircle, BarChart3, AlertCircle } from "lucide-react";
import { useCRM } from "@/lib/context/crm-context";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isGrounded?: boolean;
}

export default function AIDedicatedPage() {
  const { addToast } = useCRM();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I am your LoopAI Workspace Assistant. Ask me any question about your active projects, client budgets, or unread emails, and I will query your live database to answer.",
      isGrounded: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat area
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages.map(m => ({ role: m.role, content: m.content })), userMessage],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to process chat response.");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content, isGrounded: !!data.isGrounded },
      ]);
    } catch (error: any) {
      console.error("[AI Chat Error]:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `AI Engine Error: ${error.message || "Please check your network connection and configuration."}`,
          isGrounded: false,
        },
      ]);
      addToast("Failed to retrieve AI response.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    { text: "Which projects are overdue?", icon: <AlertCircle className="w-3.5 h-3.5" /> },
    { text: "Do I have unread emails?", icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { text: "What is my total active budget?", icon: <BarChart3 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-73px)] w-full bg-white border-t border-slate-100 overflow-hidden">




      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 bg-slate-50/15">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={index}
              className={`flex items-start gap-3.5 max-w-[85%] ${
                isUser ? "self-end flex-row-reverse" : "self-start"
              }`}
            >
              {/* Profile Avatar Bubble */}
              <div
                className={`w-8.5 h-8.5 rounded-2xl flex items-center justify-center shrink-0 border shadow-3xs ${
                  isUser
                    ? "bg-slate-900 border-slate-950 text-white"
                    : "bg-linear-to-tr from-purple-600 to-indigo-500 border-purple-100 text-white"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message content block */}
              <div className="flex flex-col gap-1.5">
                <div
                  className={`p-4 rounded-3xl text-xs leading-relaxed font-medium shadow-[0_1px_3px_rgba(0,0,0,0.01)] ${
                    isUser
                      ? "bg-slate-900 text-white rounded-tr-xs"
                      : "bg-white border border-slate-200/80 text-slate-800 rounded-tl-xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>

                {/* Grounded tag indicator */}
                {!isUser && msg.isGrounded && (
                  <div className="flex items-center gap-1 text-[9px] font-extrabold text-indigo-600 tracking-wide uppercase px-1 selection:bg-indigo-50">
                    <Check className="w-2.5 h-2.5 text-indigo-500" />
                    <span>Based on your live workspace data</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3.5 self-start max-w-[85%]">
            <div className="w-8.5 h-8.5 rounded-2xl bg-linear-to-tr from-purple-600 to-indigo-500 border border-purple-100 text-white flex items-center justify-center shrink-0 shadow-3xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-xs text-xs font-semibold text-slate-500 shadow-3xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
              <span>Querying database and reasoning...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Tray */}
      <div className="bg-white border-t border-slate-100/80 p-4 flex flex-col gap-3">
        {/* Suggested Prompts */}
        <div className="flex items-center gap-2 flex-wrap">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.text)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-purple-50/50 border border-slate-100 hover:border-purple-200 text-slate-700 hover:text-purple-700 rounded-xl text-xs font-semibold shadow-3xs transition-all cursor-pointer disabled:opacity-60"
            >
              {q.icon}
              <span>{q.text}</span>
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Copilot about overdue deadlines, budgets, unread emails..."
            disabled={isLoading}
            className="w-full text-xs py-4 pl-4 pr-12 bg-slate-50 border border-slate-200/60 rounded-2xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 placeholder-slate-400 font-medium"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3.5 p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:bg-slate-100 disabled:text-slate-400 shadow-sm transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
