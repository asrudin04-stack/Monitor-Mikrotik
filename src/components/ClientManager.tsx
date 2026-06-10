import React, { useState } from "react";
import { DhcpLease } from "../types";
import { Shield, ShieldAlert, WifiOff, Volume2, Settings, BarChart2, Star, Cpu } from "lucide-react";

interface ClientManagerProps {
  clients: DhcpLease[];
  onToggleBlock: (id: string) => void;
  onUpdateLimit: (id: string, limit: string) => void;
  onAskAIAboutClient: (hostname: string, address: string, mac: string) => void;
}

export function ClientManager({
  clients,
  onToggleBlock,
  onUpdateLimit,
  onAskAIAboutClient,
}: ClientManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "blocked">("all");

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.address.includes(searchTerm) ||
      client.mac.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "active") {
      return !client.blocked && client.activeRate !== "0 bps";
    }
    if (activeTab === "blocked") {
      return client.blocked;
    }
    return true;
  });

  return (
    <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            Daftar Perangkat DHCP Lease & Hotspot
          </h2>
          <p className="text-xs text-slate-400">
            Kelola perangkat WiFi yang terhubung ke jaringan Router Anda
          </p>
        </div>

        {/* Client categories tabs */}
        <div className="flex bg-[#1d263b] p-0.5 rounded-lg border border-slate-700 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 sm:flex-none text-xs px-3 py-1 rounded-md transition-colors ${
              activeTab === "all"
                ? "bg-[#2563eb] text-white font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Semua ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 sm:flex-none text-xs px-3 py-1 rounded-md transition-colors ${
              activeTab === "active"
                ? "bg-[#2563eb] text-white font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Aktif Transmit ({clients.filter((c) => !c.blocked && c.activeRate !== "0 bps").length})
          </button>
          <button
            onClick={() => setActiveTab("blocked")}
            className={`flex-1 sm:flex-none text-xs px-3 py-1 rounded-md transition-colors ${
              activeTab === "blocked"
                ? "bg-[#dc2626] text-white font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Terblokir ({clients.filter((c) => c.blocked).length})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari berdasarkan hostname, IP, atau MAC..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#1b2336] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
        />
      </div>

      {/* Table responsive */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-widest font-mono">
              <th className="pb-2 font-semibold">Perangkat</th>
              <th className="pb-2 font-semibold">IP Address</th>
              <th className="pb-2 font-semibold">MAC Address</th>
              <th className="pb-2 font-semibold text-center">Live Speed</th>
              <th className="pb-2 font-semibold text-center">Limit Queue</th>
              <th className="pb-2 font-semibold text-right">Aksi Kontrol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-xs text-slate-500 font-mono">
                  Tidak ada perangkat yang ditemukan
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => {
                const isBlocked = client.blocked;
                return (
                  <tr
                    key={client.id}
                    className={`text-xs transition-colors hover:bg-slate-800/20 ${
                      isBlocked ? "bg-red-950/10 opacity-70" : ""
                    }`}
                  >
                    {/* Device Hostname & status symbol */}
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {isBlocked ? (
                          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                        ) : client.activeRate !== "0 bps" ? (
                          <div className="relative">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full block animate-ping absolute"></span>
                            <span className="w-2 h-2 bg-emerald-500 rounded-full block relative"></span>
                          </div>
                        ) : (
                          <span className="w-2 h-2 bg-slate-600 rounded-full block"></span>
                        )}
                        <div>
                          <p className="font-semibold text-slate-200 max-w-[150px] truncate">
                            {client.hostname || "Device-unnamed"}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            DHCP Bind: {client.status}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Lease IP */}
                    <td className="py-3 font-mono text-slate-300">
                      {client.address}
                    </td>

                    {/* MAC */}
                    <td className="py-3 font-mono text-slate-400 text-[11px]">
                      {client.mac}
                    </td>

                    {/* Traffic Bandwidth Indicator */}
                    <td className="py-3 text-center">
                      <span
                        className={`font-mono font-semibold px-2 py-0.5 rounded ${
                          isBlocked
                            ? "bg-rose-950/20 text-rose-400 line-through"
                            : client.activeRate !== "0 bps"
                            ? "bg-slate-800 text-emerald-400"
                            : "bg-slate-900 text-slate-500"
                        }`}
                      >
                        {isBlocked ? "0 bps" : client.activeRate}
                      </span>
                    </td>

                    {/* Limit Dropdown selector */}
                    <td className="py-3 text-center">
                      <select
                        value={client.speedLimit}
                        disabled={isBlocked}
                        onChange={(e) => onUpdateLimit(client.id, e.target.value)}
                        className="bg-[#1b2336] border border-slate-700 rounded px-2 py-0.5 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="None">No Limit</option>
                        <option value="2M/2M">2 Mbps (Sangat Lambat)</option>
                        <option value="5M/5M">5 Mbps (Standard)</option>
                        <option value="10M/10M">10 Mbps (Sedang)</option>
                        <option value="30M/30M">30 Mbps (Cepat)</option>
                      </select>
                    </td>

                    {/* Action buttons list */}
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Ask AI about this Specific IP */}
                        <button
                          onClick={() => onAskAIAboutClient(client.hostname, client.address, client.mac)}
                          className="bg-indigo-950/40 text-indigo-400 border border-indigo-900 hover:bg-indigo-900/50 p-1.5 rounded transition-transform active:scale-95 text-[10px] font-medium"
                          title="Tanya solusi AI untuk perangkat ini"
                        >
                          Analisa AI
                        </button>

                        {/* Block/Unblock toggle */}
                        <button
                          onClick={() => onToggleBlock(client.id)}
                          className={`px-2 py-1 rounded text-[11px] font-mono font-semibold border transition-all ${
                            isBlocked
                              ? "bg-emerald-950/20 text-emerald-400 border-emerald-900 hover:bg-emerald-900/40"
                              : "bg-rose-950/20 text-rose-400 border-rose-900 hover:bg-rose-900/40"
                          }`}
                        >
                          {isBlocked ? "Buka Blokir" : "Isolasi IP"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Control panel notifications info */}
      <div className="mt-4 bg-[#1b2336]/40 p-3 rounded-lg border border-slate-800 flex items-start gap-2">
        <Shield className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-teal-300">Cara Kerja Isolasi IP:</strong> Menandai perangkat sebagai terisolasi akan mensimulasikan penambahan entri ke <code className="text-indigo-400">/ip firewall filter</code> dengan aksi <code className="text-indigo-400">chain=forward action=drop</code>, memutus akses internet client seketika demi keamanan jaringan.
        </p>
      </div>
    </div>
  );
}
