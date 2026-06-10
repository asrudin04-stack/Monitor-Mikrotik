import React, { useState } from "react";
import { LogEntry } from "../types";
import { Search, AlertTriangle, Info, Terminal, Trash2, ArrowUpRight, Zap } from "lucide-react";

interface LogViewerProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  onAnalyzeWithAI: (logEntry: LogEntry) => void;
}

export function LogViewer({ logs, onClearLogs, onAnalyzeWithAI }: LogViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<"all" | "info" | "warning" | "critical">("all");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.topics.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = selectedSeverity === "all" || log.severity === selectedSeverity;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col h-[400px]">
      {/* Log Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 shrink-0">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            RouterOS Log & Analisa Keamanan
          </h2>
          <p className="text-xs text-slate-400">
            System log realtime untuk melacak aktivitas IP Firewall & DHCP leases
          </p>
        </div>
        <button
          onClick={onClearLogs}
          className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors"
          title="Bersihkan log di tampilan"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Flush
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col md:flex-row gap-2 mb-3 shrink-0">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kata kunci log (misal: 'assign', 'drop', 'winbox')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1b2336] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
          />
        </div>

        {/* Severity selection */}
        <div className="flex bg-[#1b2336] border border-slate-700 rounded-lg p-0.5 font-mono text-[11px]">
          {(["all", "info", "warning", "critical"] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1 rounded-md capitalize transition-all ${
                selectedSeverity === sev
                  ? sev === "critical"
                    ? "bg-rose-950/60 text-rose-400 border border-rose-900/50"
                    : sev === "warning"
                    ? "bg-amber-950/60 text-amber-400 border border-amber-900/50"
                    : "bg-[#2563eb] text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {sev === "all" ? "Semua" : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Log list output box */}
      <div className="flex-1 overflow-y-auto bg-slate-950 border border-slate-800/80 rounded-lg p-3 font-mono text-[11px] leading-relaxed select-text min-h-0 space-y-2.5 custom-scrollbar">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-slate-600 py-20 italic">
            -- Sunyi... Tidak ada kecocokan log terekam --
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isCrit = log.severity === "critical";
            const isWarn = log.severity === "warning";

            let topicBg = "bg-slate-800/80 text-slate-400";
            let textStyles = "text-slate-300";
            let AlertIcon = Info;

            if (isCrit) {
              topicBg = "bg-rose-950/40 text-rose-400 border border-rose-900/40";
              textStyles = "text-rose-200 font-medium";
              AlertIcon = AlertTriangle;
            } else if (isWarn) {
              topicBg = "bg-amber-950/40 text-amber-400 border border-amber-900/40";
              textStyles = "text-amber-200";
              AlertIcon = AlertTriangle;
            }

            return (
              <div
                key={log.id}
                className={`py-2 px-2.5 rounded-lg border flex items-start gap-2.5 transition-all hover:bg-slate-900 ${
                  isCrit
                    ? "bg-rose-950/10 border-rose-950/30 shadow-sm shadow-rose-950/5 animate-pulse"
                    : isWarn
                    ? "bg-amber-950/5 border-amber-950/20"
                    : "bg-slate-900/40 border-transparent"
                }`}
              >
                {/* Severity Status Dot */}
                <span className="mt-1 shrink-0">
                  <AlertIcon
                    className={`w-3.5 h-3.5 ${
                      isCrit ? "text-rose-500" : isWarn ? "text-amber-500" : "text-slate-500"
                    }`}
                  />
                </span>

                {/* Time Stamp */}
                <span className="text-slate-500 shrink-0 select-none font-bold">
                  [{log.time}]
                </span>

                {/* Log Topics */}
                <span className={`text-[10px] uppercase font-bold tracking-tight px-1.5 py-0.5 rounded shrink-0 ${topicBg}`}>
                  {log.topics}
                </span>

                {/* Message Body */}
                <div className={`flex-1 break-words leading-relaxed ${textStyles}`}>
                  {log.message}
                </div>

                {/* Ask AI Helper integration */}
                <button
                  onClick={() => onAnalyzeWithAI(log)}
                  className="shrink-0 bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 rounded px-1.5 py-0.5 text-[9px] flex items-center gap-1 group-hover:border-indigo-900 transition-colors"
                  title="Analis masalah log ini menggunakan Gemini AI"
                >
                  <Zap className="w-2.5 h-2.5 text-indigo-400" />
                  AI RPK
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
