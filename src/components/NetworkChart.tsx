import React from "react";
import { formatBandwidth } from "../utils";

interface DataPoint {
  rx: number; // bps
  tx: number; // bps
  label: string;
}

interface NetworkChartProps {
  history: DataPoint[];
  maxSpeed: number; // to scale the heights
}

export function NetworkChart({ history, maxSpeed }: NetworkChartProps) {
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 20;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Find max rx and tx to scale correctly if speed is dynamic
  const effectiveMax = Math.max(
    ...history.map((d) => Math.max(d.rx, d.tx, 1000000)), // min scale 1Mbps
    maxSpeed
  );

  // Generate coordinate points for SVG path
  const getPoints = (key: "rx" | "tx") => {
    if (history.length < 2) return "";
    return history
      .map((d, index) => {
        const x = paddingX + (index / (history.length - 1)) * chartWidth;
        const val = d[key];
        const y = paddingY + chartHeight - (val / effectiveMax) * chartHeight;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  const rxPoints = getPoints("rx");
  const txPoints = getPoints("tx");

  // Create area paths
  const getAreaPath = (pointsStr: string) => {
    if (!pointsStr) return "";
    const firstX = paddingX;
    const lastX = paddingX + chartWidth;
    const baseY = paddingY + chartHeight;
    return `M ${firstX},${baseY} L ${pointsStr} L ${lastX},${baseY} Z`;
  };

  const rxAreaPath = getAreaPath(rxPoints);
  const txAreaPath = getAreaPath(txPoints);

  return (
    <div className="w-full bg-[#151c2c] border border-slate-800 rounded-xl p-4 shadow-lg shadow-black/30">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
        <div>
          <h3 className="font-semibold text-slate-100 text-sm tracking-wide uppercase">
            Grafik Bandwidth Real-Time
          </h3>
          <p className="text-xs text-slate-400">
            Monitoring lalu lintas data WAN (ether1) 30 detik terakhir
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-pulse"></span>
            <span className="text-emerald-400">RX (Download): {formatBandwidth(history[history.length - 1]?.rx || 0)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 block"></span>
            <span className="text-cyan-400">TX (Upload): {formatBandwidth(history[history.length - 1]?.tx || 0)}</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
        {/* SVG Canvas */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full font-mono"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="rxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + ratio * chartHeight;
            const value = effectiveMax * (1 - ratio);
            return (
              <g key={i} className="opacity-40">
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="8"
                  className="font-mono"
                >
                  {formatBandwidth(value)}
                </text>
              </g>
            );
          })}

          {/* Vertical Grid Markers */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio, i) => {
            const x = paddingX + ratio * chartWidth;
            return (
              <line
                key={i}
                x1={x}
                y1={paddingY}
                x2={x}
                y2={paddingY + chartHeight}
                stroke="#334155"
                strokeWidth="0.5"
                className="opacity-20"
              />
            );
          })}

          {/* Render Area Plots */}
          {rxAreaPath && <path d={rxAreaPath} fill="url(#rxGrad)" />}
          {txAreaPath && <path d={txAreaPath} fill="url(#txGrad)" />}

          {/* Render Stroke Lines */}
          {rxPoints && (
            <path
              d={`M ${rxPoints}`}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {txPoints && (
            <path
              d={`M ${txPoints}`}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {/* Time labels overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-10 flex justify-between text-[9px] text-slate-500 font-mono pointer-events-none">
          <span>30 detik lalu</span>
          <span>15 detik lalu</span>
          <span>sekarang</span>
        </div>
      </div>
    </div>
  );
}
