import React from "react";
import { NetworkInterface } from "../types";
import { formatBandwidth, formatBytes } from "../utils";
import { ArrowDownLeft, ArrowUpRight, Network, Wifi, Activity, Power, Info } from "lucide-react";

interface InterfaceGridProps {
  interfaces: NetworkInterface[];
  onSelectInterface?: (name: string) => void;
  selectedInterfaceName?: string;
}

export function InterfaceGrid({
  interfaces,
  onSelectInterface,
  selectedInterfaceName,
}: InterfaceGridProps) {
  return (
    <div className="bg-[#121824] border border-slate-800 rounded-xl p-4 shadow-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            Status Interface RouterOS
          </h2>
          <p className="text-xs text-slate-400">
            Kondisi fisik port RJ45, WLAN, dan VIF Virtual Bridge
          </p>
        </div>
        <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 font-mono px-2 py-0.5 rounded uppercase">
          Total: {interfaces.length}
        </span>
      </div>

      {/* Grid of ports */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
        {interfaces.map((inter) => {
          const isUp = inter.status === "up";
          const isSelected = selectedInterfaceName === inter.name;

          // Compute custom color based on interface type
          let iconColor = "text-indigo-400";
          let bgIconColor = "bg-indigo-950/30";
          let InterfaceIcon = Network;

          if (inter.type === "wlan") {
            InterfaceIcon = Wifi;
            iconColor = "text-amber-400";
            bgIconColor = "bg-amber-950/30";
          } else if (inter.name.includes("WAN")) {
            InterfaceIcon = Activity;
            iconColor = "text-emerald-400";
            bgIconColor = "bg-emerald-950/30";
          } else if (inter.type === "bridge") {
            InterfaceIcon = Network;
            iconColor = "text-cyan-400";
            bgIconColor = "bg-cyan-950/30";
          }

          // Percentage of loading assuming 1 Gbps port or 100 Mbps WAN
          const maxSpeedRef = inter.name.includes("WAN") ? 100000000 : 1000000000; // 100M/1G
          const rxPercent = Math.min(100, (inter.rxSpeed / maxSpeedRef) * 100);
          const txPercent = Math.min(100, (inter.txSpeed / maxSpeedRef) * 100);

          return (
            <div
              key={inter.name}
              onClick={() => onSelectInterface?.(inter.name)}
              className={`group border rounded-xl p-3 cursor-pointer transition-all ${
                isSelected
                  ? "bg-[#1c2438] border-[#2563eb] shadow-md shadow-indigo-950/50"
                  : isUp
                  ? "bg-[#161d2d] border-slate-800 hover:border-slate-700 hover:bg-[#1a2235]"
                  : "bg-slate-950/40 border-slate-900/60 opacity-60"
              }`}
            >
              {/* Interface Header */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${bgIconColor} ${iconColor}`}>
                    <InterfaceIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200 text-xs tracking-wide truncate group-hover:text-indigo-400 transition-colors">
                      {inter.name}
                    </h4>
                    <span className="text-[9px] text-slate-500 uppercase font-mono">
                      Type: {inter.type}
                    </span>
                  </div>
                </div>

                {/* Status indicator on/off */}
                <span
                  title={isUp ? "Link up" : "No carrier / Link down"}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium tracking-wide ${
                    isUp
                      ? "bg-emerald-950/20 text-emerald-400 border border-emerald-900/40"
                      : "bg-slate-900 text-slate-500 border border-slate-800"
                  }`}
                >
                  <Power className="w-2.5 h-2.5" />
                  {isUp ? "UP" : "DOWN"}
                </span>
              </div>

              {/* Bandwidth displays if up */}
              {isUp ? (
                <div className="space-y-1.5 pt-1">
                  {/* Download speed */}
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center text-slate-400 text-[10px]">
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> RX
                      </span>
                      <span className="font-semibold text-slate-300">
                        {formatBandwidth(inter.rxSpeed)}
                      </span>
                    </div>
                    {/* Micro gauge */}
                    <div className="w-full bg-slate-950 h-1 rounded overflow-hidden mt-0.5">
                      <div
                        className="bg-emerald-500 h-full rounded transition-all duration-300"
                        style={{ width: `${Math.max(2, rxPercent)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Upload speed */}
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center text-slate-400 text-[10px]">
                        <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> TX
                      </span>
                      <span className="font-semibold text-slate-300">
                        {formatBandwidth(inter.txSpeed)}
                      </span>
                    </div>
                    {/* Micro gauge */}
                    <div className="w-full bg-slate-950 h-1 rounded overflow-hidden mt-0.5">
                      <div
                        className="bg-cyan-500 h-full rounded transition-all duration-300"
                        style={{ width: `${Math.max(2, txPercent)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] font-mono text-slate-500 italic py-2">
                  No Ethernet cable connected
                </p>
              )}

              {/* Tooltip detail block shown when selected */}
              {isSelected && isUp && (
                <div className="mt-2.5 pt-2 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-500 block text-[9px]">RX BYTES:</span>
                    <span className="text-emerald-400 font-bold">
                      {formatBytes(inter.rxBytes)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">TX BYTES:</span>
                    <span className="text-cyan-400 font-bold">
                      {formatBytes(inter.txBytes)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
