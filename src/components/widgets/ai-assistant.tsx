"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Heart, Hash, Send, ExternalLink, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to call API");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `AI Service Error: ${error.message || "Please check your OpenRouter API key and internet connection."}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === "improve") {
      handleSendMessage("How can I improve relationship scores with my Upwork clients?");
    } else if (action === "find") {
      handleSendMessage("Recommend standard tactics to find new clients in the Media sector.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
        <div className="flex items-center gap-2.5">
          {/* Logo Icon */}
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-linear-to-tr from-indigo-600 to-purple-600 text-white shadow-sm">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7C4.747 9.547 4.7 10.768 4.7 12s.047 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.092-1.209.138-2.43.138-3.662z" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">How can I help you?</h3>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" title="Expand Chat">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Area / Initial Prompt */}
      {messages.length === 0 ? (
        /* Quick Actions when empty */
        <div className="grid grid-cols-2 gap-3 py-2">
          {/* Action 1 */}
          <button
            onClick={() => handleQuickAction("improve")}
            className="flex flex-col items-start justify-between p-3.5 text-left border border-slate-100 rounded-xl bg-slate-50 hover:bg-purple-50/50 hover:border-purple-200 transition-all group cursor-pointer"
          >
            <div className="p-1.5 rounded-lg bg-pink-100 text-pink-600 mb-3 group-hover:scale-110 transition-transform">
              <Heart className="w-4 h-4 fill-pink-500" />
            </div>
            <span className="text-xs font-semibold text-slate-700 leading-tight">Improve Relationships</span>
          </button>

          {/* Action 2 */}
          <button
            onClick={() => handleQuickAction("find")}
            className="flex flex-col items-start justify-between p-3.5 text-left border border-slate-100 rounded-xl bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all group cursor-pointer"
          >
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
              <Hash className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-700 leading-tight">Find new Clients</span>
          </button>
        </div>
      ) : (
        /* Conversation Feed */
        <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1 pb-1">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col gap-1 max-w-[85%] ${
                msg.role === "user" ? "self-end items-end" : "self-start items-start"
              }`}
            >
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-slate-900 text-white rounded-br-sm"
                    : "bg-slate-50 border border-slate-100 text-slate-800 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 self-start bg-slate-50 border border-slate-100 p-3 rounded-2xl rounded-bl-sm text-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="relative flex items-center mt-1"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          disabled={isLoading}
          className="w-full text-xs py-3.5 pl-4 pr-11 bg-[#f3f4fa]/60 border border-slate-100 rounded-xl focus:outline-none focus:border-purple-200 focus:bg-white transition-all text-slate-800 placeholder-slate-400 font-medium"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-3 p-1.5 rounded-lg bg-white border border-slate-100 hover:border-purple-100 hover:bg-purple-50 text-slate-400 hover:text-purple-600 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-400 disabled:border-slate-100 transition-all cursor-pointer"
        >
          {isLoading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
        </button>
      </form>
    </div>
  );
}
