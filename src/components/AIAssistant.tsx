import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Terminal, Copy, Check, Loader2, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  routerContext: {
    model: string;
    version: string;
    cpu: string;
    clientCount: number;
    interfaces: string;
  };
  remotePromptTrigger?: {
    text: string;
    timestamp: number;
  } | null;
}

const CONVERSATION_SUGGESTIONS = [
  { label: "Port Forwarding Web", q: "Bagaimana cara melakukan port forwarding HTTP port 80 ke IP server lokal 192.168.88.100?" },
  { label: "Script Auto-Reboots", q: "Buatkan script scheduler untuk restart MikroTik otomatis setiap jam 03:00 pagi." },
  { label: "Limit Bandwidth Hotspot", q: "Bagaimana cara membatasi speed client hotspot menggunakan Simple Queue?" },
  { label: "Firewall Anti DDoS", q: "Beri contoh aturan firewall filter untuk melindungi router dari serangan DNS Flood." },
];

export function AIAssistant({ routerContext, remotePromptTrigger }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Halo! Saya adalah **Mikrotik AI Copilot**. 🧠🤖

Saya dilatih khusus tentang **MikroTik RouterOS (v6 & v7)**, routing, firewall security, dan optimasi QoS.

Ada yang bisa saya bantu konfigurasi atau selesaikan hari ini? *Tanya saya perihal command script, VPN, routing, hotspot, atau kendala log jaringan Anda.*`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle remote trigger (when client clicks "Ask AI" in List view or Log view!)
  useEffect(() => {
    if (remotePromptTrigger) {
      handleSend(remotePromptTrigger.text);
    }
  }, [remotePromptTrigger]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim()) return;

    // Add user message to state
    const newMsg: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, newMsg]);
    if (!customText) setInputMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: textToSend,
          context: routerContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error status: ${response.status}`);
      }

      const resData = await response.json();
      if (resData.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: resData.answer },
        ]);
      } else {
        throw new Error(resData.message || "Gagal mendapatkan analisis AI");
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Gagal menghubungi asisten AI: **${err.message}**.\n\nSilakan periksa kembali berkas \`.env\` atau pastikan server berjalan dengan benar.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Konsol obrolan dibersihkan. Hubungi saya kembali jika Anda membutuhkan panduan RouterOS baru!",
      },
    ]);
  };

  return (
    <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col h-full min-h-[500px]">
      {/* Sidebar Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 animate-pulse">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">AI Network Consultant</h3>
            <span className="text-[9px] text-[#22c55e] font-mono tracking-wide flex items-center gap-1">
              ● Gemini 3.5 Assistant Ready
            </span>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="text-[10px] text-slate-500 hover:text-slate-300 font-mono"
        >
          Clear Chat
        </button>
      </div>

      {/* Suggestion Prompts Chips */}
      {messages.length === 1 && (
        <div className="shrink-0 mb-3">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 font-mono">
            Rekomendasi Pertanyaan Cerdas:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[10.5px]">
            {CONVERSATION_SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSend(sug.q)}
                className="text-left bg-slate-900/60 border border-slate-800 hover:border-indigo-600/40 p-2 rounded-lg text-slate-300 hover:text-slate-100 font-sans leading-tight transition-colors"
              >
                {sug.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Window Container */}
      <div className="flex-1 overflow-y-auto space-y-4 bg-slate-950/40 p-3 rounded-lg border border-slate-900 min-h-0 custom-scrollbar text-xs">
        {messages.map((m, idx) => {
          const isAI = m.role === "assistant";
          return (
            <div
              key={idx}
              className={`flex flex-col max-w-[90%] ${
                isAI ? "self-start text-justify" : "self-end ml-auto text-left"
              }`}
            >
              <span className={`text-[9px] font-mono mb-1 text-slate-500 ${!isAI ? "text-right" : ""}`}>
                {isAI ? "🤖 CO-PILOT" : "🧑‍💻 USER SYSADMIN"}
              </span>

              <div
                className={`p-3 rounded-xl leading-relaxed whitespace-pre-wrap select-text group relative ${
                  isAI
                    ? "bg-[#182035] text-slate-200 rounded-tl-none border border-slate-800"
                    : "bg-indigo-600 text-white rounded-tr-none"
                }`}
              >
                {m.content}

                {/* Nice copy helper for command blocks in AI reply */}
                {isAI && (m.content.includes("/") || m.content.includes("add ")) && (
                  <button
                    onClick={() => copyToClipboard(m.content, idx)}
                    className="absolute bottom-2 right-2 p-1 bg-slate-900 border border-slate-700 rounded text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Salin skrip konfigurasi"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex flex-col self-start max-w-[80%]">
            <span className="text-[9px] font-mono mb-1 text-slate-500">🤖 CO-PILOT</span>
            <div className="bg-[#182035] p-3 rounded-xl rounded-tl-none border border-slate-800 text-slate-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Memproses konfigurasi RouterOS terbaik...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input container footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-3 shrink-0 flex gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          disabled={loading}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Tanyakan script queue, firewall, port forwarding..."
          className="flex-1 bg-[#1b2336] border border-slate-700 focus:border-indigo-600 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold font-sans px-3.5 rounded-lg flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
export default AIAssistant;
export {};
