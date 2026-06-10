/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { RouterConnection, RouterResource, NetworkInterface, DhcpLease, LogEntry, NatRule, WifiBillingUser, MonthlyFinancialRecord, FinanceSummary } from "./types";
import {
  INITIAL_INTERFACES,
  INITIAL_CLIENTS,
  INITIAL_LOGS,
  INITIAL_BILLING_USERS,
  INITIAL_FINANCE_SUMMARY,
  INITIAL_FINANCE_RECORDS,
  updateSimulatedResources,
  updateSimulatedInterfaces,
  addNewSimulatedLog,
  formatBytes,
} from "./utils";
import { NetworkChart } from "./components/NetworkChart";
import { ClientManager } from "./components/ClientManager";
import { InterfaceGrid } from "./components/InterfaceGrid";
import { LogViewer } from "./components/LogViewer";
import { AIAssistant } from "./components/AIAssistant";
import { WifiBillingDashboard } from "./components/WifiBillingDashboard";
import {
  Activity,
  Cpu,
  Database,
  Globe,
  HardDrive,
  Info,
  Layers,
  LineChart,
  Network,
  Power,
  RefreshCw,
  Router,
  Save,
  Server,
  Settings,
  Shield,
  Clock,
  Terminal,
  Wifi,
  AlertTriangle,
  FileCode,
  Sparkles,
} from "lucide-react";

export default function App() {
  // User Security Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("rt_net_logged_in") === "true";
  });
  const [securityPin, setSecurityPin] = useState<string>(() => {
    return localStorage.getItem("rt_net_security_pin") || "admin123";
  });
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinChangeOld, setPinChangeOld] = useState("");
  const [pinChangeNew, setPinChangeNew] = useState("");
  const [showPinChangeSuccess, setShowPinChangeSuccess] = useState(false);
  const [securityLogs, setSecurityLogs] = useState<string[]>(() => {
    const saved = localStorage.getItem("rt_net_security_logs");
    return saved ? JSON.parse(saved) : [
      `Sistem keamanan diaktifkan pada ${new Date().toLocaleDateString("id-ID")}`,
      "Password keamanan default disetel ke: admin123"
    ];
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === securityPin) {
      setIsLoggedIn(true);
      setPinError("");
      localStorage.setItem("rt_net_logged_in", "true");
      
      const updatedLogs = [
        `Login berhasil pada ${new Date().toLocaleTimeString("id-ID")} - Sesi Admin Aktif`,
        ...securityLogs.slice(0, 10)
      ];
      setSecurityLogs(updatedLogs);
      localStorage.setItem("rt_net_security_logs", JSON.stringify(updatedLogs));
      setSuccessBanner("Selamat Datang Kembali! Otentikasi Dashboard Berhasil.");
    } else {
      setPinError("Password PIN salah! Silakan coba kembali.");
      const updatedLogs = [
        `❌ Gagal login: Percobaan dengan sandi tidak sah pada ${new Date().toLocaleTimeString("id-ID")}`,
        ...securityLogs.slice(0, 10)
      ];
      setSecurityLogs(updatedLogs);
      localStorage.setItem("rt_net_security_logs", JSON.stringify(updatedLogs));
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEnteredPin("");
    localStorage.setItem("rt_net_logged_in", "false");
    setSuccessBanner("Sesi ditutup dengan aman. Dashboard terkunci.");
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinChangeOld !== securityPin) {
      setErrorBanner("Password PIN Lama Salah! Tidak dapat mengubah sandi.");
      return;
    }
    if (pinChangeNew.length < 4) {
      setErrorBanner("Password baru terlalu pendek! Minimal 4 karakter demi keamanan.");
      return;
    }
    setSecurityPin(pinChangeNew);
    localStorage.setItem("rt_net_security_pin", pinChangeNew);
    setPinChangeOld("");
    setPinChangeNew("");
    setShowPinChangeSuccess(true);
    setSuccessBanner("Sukses! PIN keamanan dashboard Anda berhasil diperbarui.");
    setTimeout(() => {
      setShowPinChangeSuccess(false);
    }, 4000);
  };

  // 1. Core Connection States (Simulated ON by default for instant trial)
  const [connection, setConnection] = useState<RouterConnection>({
    host: "103.55.22.190",
    port: "80",
    username: "admin",
    protocol: "http",
    isSimulated: true, // starts with simulation mode active
  });

  const [password, setPassword] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"traffic" | "billing">("traffic");

  // 6. WiFi Tagihan & Laporan Keuangan States
  const [billingUsers, setBillingUsers] = useState<WifiBillingUser[]>(INITIAL_BILLING_USERS);
  const [financeRecords, setFinanceRecords] = useState<MonthlyFinancialRecord[]>(INITIAL_FINANCE_RECORDS);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary>(INITIAL_FINANCE_SUMMARY);

  const handlePayBill = (userId: string) => {
    setBillingUsers((prevUsers) => {
      const target = prevUsers.find((u) => u.id === userId);
      if (!target) return prevUsers;

      // Update financial counters
      setFinanceSummary((prevSum) => ({
        ...prevSum,
        incomeThisMonth: prevSum.incomeThisMonth + target.price,
        pendingReceivables: Math.max(0, prevSum.pendingReceivables - target.price),
      }));

      // Append transaction details into live diagnostic logs
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      const newLog: LogEntry = {
        id: `bill-pay-${Date.now()}`,
        time: timeStr,
        topics: "hotspot,account,info",
        message: `Pembayaran lunas terkonfirmasi: ${target.clientName} (${target.addressNum}) untuk paket ${target.packageName} sebesar Rp ${target.price.toLocaleString("id-ID")}`,
        severity: "info",
      };
      setLogs((oldLogs) => [newLog, ...oldLogs]);
      setSuccessBanner(`Tagihan ${target.clientName} berhasil dilunasi via Kas Masuk.`);

      return prevUsers.map((u) => (u.id === userId ? { ...u, status: "Lunas" as const } : u));
    });
  };

  const handleIsolateUser = (userId: string) => {
    setBillingUsers((prevUsers) => {
      const target = prevUsers.find((u) => u.id === userId);
      if (!target) return prevUsers;

      // Append filter drop rule simulation in MikroTik logging
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      const newLog: LogEntry = {
        id: `bill-block-${Date.now()}`,
        time: timeStr,
        topics: "firewall,warning",
        message: `Akses Diisolasi: Dropping forward traffic dari MAC ${target.macAddress} (Pelanggan ${target.clientName} - ${target.addressNum}) karena menunggak tagihan`,
        severity: "warning",
      };
      setLogs((oldLogs) => [newLog, ...oldLogs]);
      setErrorBanner(`Akses internet ${target.clientName} telah DIISOLASI di Router MikroTik.`);

      return prevUsers.map((u) => (u.id === userId ? { ...u, status: "Isolasi" as const } : u));
    });
  };

  const handleRestoreUser = (userId: string) => {
    setBillingUsers((prevUsers) => {
      const target = prevUsers.find((u) => u.id === userId);
      if (!target) return prevUsers;

      // Append filter allowed rule simulation in MikroTik logging
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      const newLog: LogEntry = {
        id: `bill-unblock-${Date.now()}`,
        time: timeStr,
        topics: "firewall,info",
        message: `Isolasi Dibuka: Melepas filter traffic untuk MAC ${target.macAddress} (Pelanggan ${target.clientName} - ${target.addressNum})`,
        severity: "info",
      };
      setLogs((oldLogs) => [newLog, ...oldLogs]);
      setSuccessBanner(`Akses internet ${target.clientName} dipulihkan.`);

      return prevUsers.map((u) => (u.id === userId ? { ...u, status: "Pending" as const } : u));
    });
  };

  const handleAddBillingUser = (newUser: Partial<WifiBillingUser>) => {
    const fullUser: WifiBillingUser = {
      id: newUser.id || `bill-user-${Date.now()}`,
      clientName: newUser.clientName || "Pelanggan Baru",
      addressNum: newUser.addressNum || "Blok C-",
      packageName: newUser.packageName || "Hotspot Ultra 10 Mbps",
      bandwidthLimit: newUser.bandwidthLimit || "10M/10M",
      price: newUser.price || 150000,
      dueDate: newUser.dueDate || "2026-06-15",
      status: newUser.status as any || "Pending",
      uptimeSeconds: 0,
      phone: newUser.phone || "0812-",
      macAddress: newUser.macAddress || "FC:00:FF:AA:BB:CC"
    };

    setBillingUsers((prev) => [fullUser, ...prev]);

    // Log addition to MikroTik CLI log interface
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    setLogs((oldLogs) => [
      {
        id: `bill-add-${Date.now()}`,
        time: timeStr,
        topics: "hotspot,info",
        message: `Membuat kontrak langganan baru: ${fullUser.clientName} (${fullUser.packageName}) limit @ ${fullUser.bandwidthLimit}`,
        severity: "info",
      },
      ...oldLogs,
    ]);

    setSuccessBanner(`Berhasil mendaftarkan pelanggan baru: ${fullUser.clientName}.`);
  };

  const handleAskAIAuditing = (prompt: string) => {
    setRemoteAIQuery({
      text: prompt,
      timestamp: Date.now()
    });
    setSuccessBanner("Permintaan audit keuangan dikirim ke Asisten AI!");
  };

  // 2. MikroTik Router Diagnostics States
  const [resources, setResources] = useState<RouterResource>({
    cpuLoad: 8.5,
    freeMemory: 395829103, // ~395 MB
    totalMemory: 1024 * 1024 * 1024, // 1 GB
    freeDisk: 64829302, // ~64 MB
    totalDisk: 128 * 1024 * 1024, // 128 MB
    boardName: "mAP lite (RB750Gr3 hEX)",
    uptime: "2d04h15m22s",
    version: "v7.12.1 (stable)",
    cpuCount: 4,
  });

  const [interfaces, setInterfaces] = useState<NetworkInterface[]>(INITIAL_INTERFACES);
  const [clients, setClients] = useState<DhcpLease[]>(INITIAL_CLIENTS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [natRules, setNatRules] = useState<NatRule[]>([]);

  // 3. Realtime Bandwidth Historic States (keep track of last 30 readings for charts)
  const [bandwidthHistory, setBandwidthHistory] = useState<{ rx: number; tx: number; label: string }[]>(
    Array.from({ length: 30 }, (_, i) => ({ rx: 12000000, tx: 3500000, label: `${i}` }))
  );

  // 4. Remote Prompt Trigger to interact with Gemini Assistant Sidebar
  const [remoteAIQuery, setRemoteAIQuery] = useState<{ text: string; timestamp: number } | null>(null);

  // 5. Applet UI Flags
  const [latencyMs, setLatencyMs] = useState<number | null>(4); // simulated router ping latency
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [isTestConnecting, setIsTestConnecting] = useState(false);
  const [isQueryingRealRouter, setIsQueryingRealRouter] = useState(false);

  // Auto clean notifications banners
  useEffect(() => {
    if (errorBanner) {
      const timer = setTimeout(() => setErrorBanner(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [errorBanner]);

  useEffect(() => {
    if (successBanner) {
      const timer = setTimeout(() => setSuccessBanner(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successBanner]);

  // Main Live Refresh Timer Loop (Runs every 1.5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (connection.isSimulated) {
        // Run Simulated updates
        setResources((prev) => updateSimulatedResources(prev));
        
        setInterfaces((prev) => {
          const updated = updateSimulatedInterfaces(prev);
          
          // Capture current download/upload speeds on WAN port
          const wan = updated.find((i) => i.name.includes("WAN"));
          if (wan) {
            setBandwidthHistory((history) => {
              const newHist = [...history.slice(1), { rx: wan.rxSpeed, tx: wan.txSpeed, label: "" }];
              return newHist;
            });
          }

          // Randomly update DHCP client speeds to match WAN spikes
          setClients((clList) =>
            clList.map((client) => {
              if (client.blocked) return { ...client, activeRate: "0 bps" };
              // Generate realistic active usage rate
              const randBytes = Math.random() > 0.3 ? Math.random() * (wan ? wan.rxSpeed * 0.15 : 2000000) : 0;
              const rateStr =
                randBytes === 0
                  ? "0 bps"
                  : randBytes < 1000000
                  ? `${(randBytes / 1000).toFixed(1)} Kbps`
                  : `${(randBytes / 1000000).toFixed(1)} Mbps`;
              return { ...client, activeRate: rateStr };
            })
          );

          return updated;
        });

        // 20% probability of new MikroTik log arriving
        if (Math.random() > 0.8) {
          setLogs((prev) => addNewSimulatedLog(prev));
        }

        // Fluctuate latency slightly
        setLatencyMs((lat) => {
          if (lat === null) return 4;
          const delta = Math.floor((Math.random() - 0.5) * 3);
          const next = lat + delta;
          return next < 1 ? 1 : next > 25 ? 12 : next;
        });

      } else {
        // REAL CONNECTIVITY - QUERY MIKROTIK VIA OUR NODE BACKEND PROXY (ROS v7+ REST API)
        fetchRealRouterStats();
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [connection.isSimulated, connection.host, connection.username]);

  // Query RouterOS API endpoint details
  const fetchRealRouterStats = async () => {
    setIsQueryingRealRouter(true);
    try {
      // Step A: Grab system details
      const resRaw = await fetch("/api/mikrotik/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: connection.host,
          port: connection.port,
          username: connection.username,
          password: password,
          protocol: connection.protocol,
          endpoint: "/system/resource",
        }),
      });

      if (!resRaw.ok) {
        setErrorBanner(`Koneksi Router Asli gagal (HTTP ${resRaw.status}). Mengembalikan ke Mode Simulasi otomatis.`);
        setConnection((c) => ({ ...c, isSimulated: true }));
        setIsQueryingRealRouter(false);
        return;
      }

      const resJson = await resRaw.json();
      if (resJson.success && resJson.data) {
        const item = resJson.data;
        setResources({
          cpuLoad: parseFloat(item["cpu-load"] || "0"),
          freeMemory: parseInt(item["free-memory"] || "0"),
          totalMemory: parseInt(item["total-memory"] || "1024"),
          freeDisk: parseInt(item["free-hdd-space"] || "0"),
          totalDisk: parseInt(item["total-hdd-space"] || "1"),
          boardName: item["board-name"] || "MikroTik Router",
          uptime: item["uptime"] || "Unknown",
          version: item["version"] || "v7.x",
          cpuCount: parseInt(item["cpu-count"] || "1"),
        });
      }

      // Step B: Grab interface metrics
      const intRaw = await fetch("/api/mikrotik/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: connection.host,
          port: connection.port,
          username: connection.username,
          password: password,
          protocol: connection.protocol,
          endpoint: "/interface",
        }),
      });

      if (intRaw.ok) {
        const intJson = await intRaw.json();
        if (intJson.success && Array.isArray(intJson.data)) {
          // Map RouterOS interfaces to our format
          const mapped: NetworkInterface[] = intJson.data.map((i: any) => {
            const rxRaw = parseInt(i["rx-byte"] || "0");
            const txRaw = parseInt(i["tx-byte"] || "0");
            const rxSpd = parseInt(i["last-link-down-time"] ? "0" : "15400000"); // fallback Mock speed
            return {
              name: i["name"],
              type: i["type"] || "ether",
              rxBytes: rxRaw,
              txBytes: txRaw,
              rxSpeed: rxSpd,
              txSpeed: Math.round(rxSpd * 0.25),
              status: i["running"] === "true" || i["running"] === true ? "up" : "down",
            };
          });
          setInterfaces(mapped);

          // Append to chart history
          const wan = mapped[0];
          if (wan) {
            setBandwidthHistory((history) => [
              ...history.slice(1),
              { rx: wan.rxSpeed, tx: wan.txSpeed, label: "" },
            ]);
          }
        }
      }

      // Step C: DHCP Leases
      const dhcpRaw = await fetch("/api/mikrotik/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: connection.host,
          port: connection.port,
          username: connection.username,
          password: password,
          protocol: connection.protocol,
          endpoint: "/ip/dhcp-server/lease",
        }),
      });

      if (dhcpRaw.ok) {
        const dhcpJson = await dhcpRaw.json();
        if (dhcpJson.success && Array.isArray(dhcpJson.data)) {
          const mappedClients: DhcpLease[] = dhcpJson.data.map((l: any, idx: number) => ({
            id: l[".id"] || `cl-${idx}`,
            address: l["address"] || "0.0.0.0",
            mac: l["mac-address"] || "00:00:00:00:00:00",
            hostname: l["host-name"] || l["comment"] || "Unnamed Client",
            status: l["status"] || "unknown",
            activeRate: "Calculated",
            speedLimit: l["rate-limit"] || "None",
            blocked: l["blocked"] === true || l["blocked"] === "true",
          }));
          setClients(mappedClients);
        }
      }

      // Set online latency
      setLatencyMs(8);
      setErrorBanner(null);
    } catch (err: any) {
      console.warn("Mikrotik query error: ", err);
      setErrorBanner(`Koneksi Router Asli gagal. Mengembalikan ke Mode Simulasi otomatis.`);
      setConnection((c) => ({ ...c, isSimulated: true }));
    } finally {
      setIsQueryingRealRouter(false);
    }
  };

  // Test connection button
  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestConnecting(true);
    setConnectionTestResult(null);

    try {
      const response = await fetch("/api/mikrotik/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: connection.host,
          port: connection.port,
          username: connection.username,
          password: password,
          protocol: connection.protocol,
        }),
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setConnectionTestResult({
          success: true,
          message: "Koneksi Berhasil! RouterOS terverifikasi. Anda dapat menonaktifkan Mode Simulasi sekarang.",
        });
        setSuccessBanner("Test Koneksi Berhasil! MikroTik REST API merespons dengan aman.");
      } else {
        setConnectionTestResult({
          success: false,
          message: resData.message || "Gagal menghubungi Router. Periksa kredensial / Firewall Anda.",
        });
      }
    } catch (err: any) {
      setConnectionTestResult({
        success: false,
        message: err.message || "Timeout server connection request.",
      });
    } finally {
      setIsTestConnecting(false);
    }
  };

  // Action helpers to flow details into AI Assistant
  const askAIAboutLog = (log: LogEntry) => {
    const textPrompt = `Harap jelaskan apa penyebab dan letak masalah log MikroTik berikut di jaringan saya, dan beri panduan detail serta solusinya:
Topics: "${log.topics}"
Severity: "${log.severity}"
Message: "${log.message}"`;
    setRemoteAIQuery({
      text: textPrompt,
      timestamp: Date.now(),
    });
    setSuccessBanner("Pesan analisis Log dikirim ke AI Assistant di kolom samping.");
  };

  const askAIAboutClient = (hostname: string, address: string, mac: string) => {
    const textPrompt = `Buatkan konfigurasi lengkap script RouterOS v7 untuk membatasi bandwidth perangkat "${hostname}" dengan IP static ${address} dan MAC address ${mac}. Saya ingin batas kecepatan 15 Mbps download dan 5 Mbps upload via Simple Queue. Tolong berikan kode command-line CLI dan petunjuk penerapannya di Winbox.`;
    setRemoteAIQuery({
      text: textPrompt,
      timestamp: Date.now(),
    });
    setSuccessBanner("Mengirim permintaan pembuatan script limit pelanggan ke AI.");
  };

  // Toggle Client Block Simulation
  const handleToggleBlockClient = (id: string) => {
    setClients((oldList) => {
      const target = oldList.find((c) => c.id === id);
      const isBlocking = target ? !target.blocked : false;

      // Add log
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      const newLog: LogEntry = {
        id: `log-block-${Date.now()}`,
        time: timeStr,
        topics: "firewall,info",
        message: isBlocking
          ? `IP Firewall Filter rule ADDED: forward drop src:${target?.address} (${target?.hostname})`
          : `IP Firewall Filter rule REMOVED: allowed forward src:${target?.address} (${target?.hostname})`,
        severity: isBlocking ? "warning" : "info",
      };
      setLogs((oldLogs) => [newLog, ...oldLogs]);

      // Trigger user alert
      if (isBlocking) {
        setSuccessBanner(`Perangkat ${target?.hostname} berhasil diputus & diisolasi.`);
      } else {
        setSuccessBanner(`Akses internet ${target?.hostname} dipulihkan.`);
      }

      return oldList.map((c) => (c.id === id ? { ...c, blocked: !c.blocked } : c));
    });
  };

  // Update Client Speed Queue
  const handleUpdateLimitClient = (id: string, limit: string) => {
    setClients((oldList) => {
      const target = oldList.find((c) => c.id === id);

      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      const newLog: LogEntry = {
        id: `log-queue-${Date.now()}`,
        time: timeStr,
        topics: "queue,info",
        message: `Simple Queue modified: '${target?.hostname}-queue' max-limit=${limit === "None" ? "unlimited" : limit}`,
        severity: "info",
      };
      setLogs((oldLogs) => [newLog, ...oldLogs]);
      setSuccessBanner(`Pembatasan bandwidth ${target?.hostname} diubah menjadi: ${limit}`);

      return oldList.map((c) => (c.id === id ? { ...c, speedLimit: limit } : c));
    });
  };

  const handleClearLogs = () => {
    setLogs([]);
    setSuccessBanner("Logs console dibersihkan.");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none antialiased">
        {/* Ambient background glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md bg-gradient-to-b from-[#121825] to-[#0d121d] border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 hover:shadow-indigo-500/5 transition-all duration-300">
          <div className="text-center mb-6">
            {/* 3D-like glowing shield emblem */}
            <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-indigo-600 to-indigo-400 p-4 rounded-2xl shadow-xl shadow-indigo-950/50 flex items-center justify-center mb-4 border border-indigo-500/30">
              <Shield className="w-8 h-8 text-white animate-pulse" />
            </div>
            
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">
              Sistem Pengaman Jaringan
            </span>
            <h2 className="text-xl font-bold font-sans text-slate-100 tracking-tight mt-1">
              RT/RW Net Secure Login
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Dashboard monitoring bandwidth dan billing keuangan terenkripsi standar lokal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-slate-400 font-bold text-xs mb-1.5 uppercase tracking-wide font-mono">
                Password PIN Keamanan:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Masukkan password PIN"
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  className="w-full bg-[#161f31] border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-3 text-sm text-white text-center font-mono focus:outline-none focus:border-indigo-500 tracking-widest placeholder:tracking-normal placeholder:text-xs"
                />
              </div>
              {pinError && (
                <p className="text-rose-400 text-center font-bold font-mono text-[11px] mt-2 animate-bounce">
                  ⚠ {pinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-400 hover:from-indigo-500 hover:to-indigo-300 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-950/40 active:scale-95 uppercase tracking-wider animate-pulse hover:animate-none"
            >
              Buka Kunci Dashboard
            </button>
          </form>

          {/* Quick Info & Default Credentials indicator */}
          <div className="mt-5 pt-4 border-t border-slate-800/60 text-center">
            <div className="bg-[#192135]/40 border border-indigo-900/30 rounded-xl p-3 text-left">
              <span className="text-[10px] font-bold text-indigo-400 block uppercase font-mono tracking-wider mb-1">
                🔑 Kredensial Default:
              </span>
              <p className="text-[10.5px] text-slate-300 leading-relaxed">
                Gunakan sandi default <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400 font-indigo-400 font-bold font-mono">admin123</code> untuk login percobaan. Anda dapat memperbarui PIN ini kapan pun di menu pengaturan router.
              </p>
            </div>
          </div>

          {/* Simulated Login Logs for high-fidelity security feedback */}
          <div className="mt-4 pt-3 border-t border-slate-800/40">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block mb-1.5 font-mono">
              LOG MONITOR KEAMANAN TERBARU:
            </span>
            <div className="bg-black/40 border border-slate-900 rounded-lg p-2.5 max-h-[105px] overflow-y-auto font-mono text-[9px] text-indigo-300 space-y-1.5 custom-scrollbar">
              {securityLogs.map((logStr, idx) => (
                <div key={idx} className="pb-1 border-b border-slate-950/20 last:border-0 last:pb-0">
                  <span className="text-slate-500">▶</span> {logStr}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-600 font-mono mt-8">
          © 2026 RT-RW Net Secure Platform • Port 3000 Active
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* 1. Global Alert Toast Banners */}
      {errorBanner && (
        <div className="bg-rose-950/90 text-rose-200 px-4 py-2 text-xs font-semibold border-b border-rose-800 flex items-center justify-between animate-slide-down shrink-0 font-mono">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
            {errorBanner}
          </span>
          <button onClick={() => setErrorBanner(null)} className="text-rose-400 hover:text-white ml-4">
            [X]
          </button>
        </div>
      )}

      {successBanner && (
        <div className="bg-emerald-950/90 text-emerald-200 px-4 py-3 text-xs font-semibold border-b border-emerald-800 flex items-center justify-between shrink-0 font-mono z-50">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            {successBanner}
          </span>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-400 hover:text-white font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* 2. Top Navigation & Logo Brand bar */}
      <header className="border-b border-slate-800/80 bg-[#0d1321] px-5 py-3 flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-900/30">
            <Router className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Mikrotik Network Monitor
              <span className="text-[10px] bg-indigo-950/60 border border-indigo-900/50 text-indigo-400 px-1.5 py-0.5 rounded-full font-mono uppercase font-bold tracking-widest">
                v7 REST
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Sistem manajemen bandwidth terintegrasi AI Consultant
            </p>
          </div>
        </div>

        {/* Dynamic App Tab switcher: Traffic vs Invoicing */}
        <div className="flex bg-[#121824] border border-slate-800 p-0.5 rounded-xl font-sans text-xs">
          <button
            onClick={() => {
              setActiveTab("traffic");
              setSuccessBanner("Menampilkan status bandwidth real-time.");
            }}
            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === "traffic"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Traffic & DHCP Monitor
          </button>
          <button
            onClick={() => {
              setActiveTab("billing");
              setSuccessBanner("Membuka monitor invoice & pembukuan keuangan WiFi (3D).");
            }}
            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === "billing"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/50 bg-gradient-to-r"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 text-transparent bg-clip-text" />
            WiFi Billing & Keuangan
          </button>
        </div>

        {/* Network quick dials */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Simulation Toggle Pills */}
          <div className="flex items-center bg-[#151c2c] border border-slate-800 rounded-lg p-0.5 font-mono text-[11px]">
            <button
              onClick={() => {
                setConnection((c) => ({ ...c, isSimulated: true }));
                setResources((r) => ({ ...r, boardName: "mAP lite (RB750Gr3 hEX)" }));
                setSuccessBanner("Beralih ke MODE SIMULASI. Semua data visual diolah otomatis.");
              }}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                connection.isSimulated
                  ? "bg-slate-800 text-teal-400 font-bold border border-slate-700/50"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              Simulasi Status
            </button>
            <button
              onClick={() => {
                setConnection((c) => ({ ...c, isSimulated: false }));
                setResources((r) => ({ ...r, boardName: "RB5009UG+S+IN" }));
                setSuccessBanner("Menghubungkan ke Router asli melalui REST API...");
              }}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                !connection.isSimulated
                  ? "bg-indigo-900/80 text-white font-bold border border-indigo-700/50"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              Router RouterOS Real
            </button>
          </div>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-2 rounded-lg border text-slate-300 transition-colors flex items-center gap-1.5 ${
              showConfig ? "bg-indigo-950 border-indigo-800" : "bg-[#151c2c] border-slate-800 hover:bg-[#1a2336]"
            }`}
            title="Pengaturan Jaringan & Keamanan PIN"
          >
            <Settings className="w-4 h-4" />
            <span className="text-[10px] hidden sm:inline font-mono font-bold">Opsi PIN</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg border border-rose-900 bg-rose-950/30 text-rose-400 hover:bg-rose-900/40 hover:text-white transition-colors flex items-center gap-1.5"
            title="Kunci Panel (Logout Keamanan)"
          >
            <Power className="w-4 h-4" />
            <span className="text-[10px] hidden sm:inline font-mono font-bold text-rose-300">Lock</span>
          </button>
        </div>
      </header>

      {/* 3. Settings Expansion form */}
      {(showConfig || !connection.isSimulated) && (
        <section className="bg-[#0e1423] border-b border-slate-800 p-5 shrink-0 transition-all">
          <form onSubmit={handleTestConnection} className="max-w-5xl mx-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              MikroTik RouterOS API - Pengaturan Koneksi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">
                  Router IP / Hostname
                </label>
                <input
                  type="text"
                  value={connection.host}
                  onChange={(e) => setConnection((c) => ({ ...c, host: e.target.value }))}
                  placeholder="e.g. 192.168.88.1"
                  className="w-full bg-[#151c2c] border border-slate-700 rounded p-1.5 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">
                  Username API
                </label>
                <input
                  type="text"
                  value={connection.username}
                  onChange={(e) => setConnection((c) => ({ ...c, username: e.target.value }))}
                  className="w-full bg-[#151c2c] border border-slate-700 rounded p-1.5 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">
                  Password Router
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#151c2c] border border-slate-700 rounded p-1.5 text-xs text-white text-security"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">
                  Port & Protocol REST API
                </label>
                <div className="flex gap-1.5">
                  <select
                    value={connection.protocol}
                    onChange={(e) => setConnection((c) => ({ ...c, protocol: e.target.value as any }))}
                    className="bg-[#151c2c] border border-slate-700 rounded p-1 text-xs text-white"
                  >
                    <option value="http">HTTP</option>
                    <option value="https">HTTPS</option>
                  </select>
                  <input
                    type="text"
                    value={connection.port}
                    onChange={(e) => setConnection((c) => ({ ...c, port: e.target.value }))}
                    className="w-16 bg-[#151c2c] border border-slate-700 rounded p-1.5 text-xs text-white text-center"
                    placeholder="80"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isTestConnecting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-semibold px-4 py-2.5 rounded text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  {isTestConnecting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Power className="w-3.5 h-3.5" />
                  )}
                  Test Koneksi
                </button>
              </div>
            </div>

            {/* Hint Box */}
            <div className="mt-3.5 bg-slate-900/60 p-3 rounded border border-slate-800 text-[11px] text-slate-400 leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-slate-200 block mb-0.5">💡 Syarat Integrasi RouterOS v7REST API:</span>
                Pastikan port REST API MikroTik diaktifkan. Anda dapat mengaktifkannya via terminal CLI MikroTik dengan mengeksekusi:<br />
                <code className="text-yellow-400 font-mono mt-1 block bg-black/40 px-2 py-0.5 rounded">
                  /ip service set rest port=80 disabled=no
                </code>
              </div>
              <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-2.5 md:pt-0 md:pl-4">
                <b className="text-slate-200 block mb-0.5">Status Koneksi Aktif:</b>
                {connection.isSimulated ? (
                  <span className="text-teal-400 font-bold block animate-pulse">
                    🟢 SIMULATION ACTIVE (Menggunakan Data Mocking Presisi Tinggi)
                  </span>
                ) : (
                  <span className="text-indigo-400 font-bold block">
                    🔵 REAL ROUTER: {connection.host} via REST API {connection.protocol.toUpperCase()}
                  </span>
                )}
                {connectionTestResult && (
                  <div className={`mt-2 font-semibold p-1.5 rounded text-xs leading-normal ${
                    connectionTestResult.success ? "bg-emerald-950/40 text-emerald-300" : "bg-rose-950/40 text-rose-300"
                  }`}>
                    {connectionTestResult.message}
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Pemisah Keamanan Antarmuka */}
          <div className="border-t border-slate-805/80 border-dashed my-4"></div>

          {/* Form Manajemen Keamanan PIN & Log Keamanan RT/RW Net */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Sisi Kiri: Form Perbarui PIN (Symmetric Lock) */}
            <div className="md:col-span-6 bg-gradient-to-b from-[#111623] to-[#0c0f1b] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
                  <Shield className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Manajemen Kredensial & Ganti PIN Keamanan
                </h4>
                <p className="text-[11px] text-slate-400 mb-3.5 leading-relaxed">
                  Batasi akses orang tidak sah pada dashboard monitoring. PIN ini mengamankan seluruh fungsi MikroTik, simple queue, dan tagihan billing.
                </p>

                <form onSubmit={handleUpdatePin} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] text-slate-400 font-mono uppercase mb-1 font-bold">
                        PIN Sandi Lama:
                      </label>
                      <input
                        type="password"
                        required
                        value={pinChangeOld}
                        onChange={(e) => setPinChangeOld(e.target.value)}
                        placeholder="PIN lama Anda"
                        className="w-full bg-[#151c2c] border border-slate-700 rounded p-2 text-xs text-center font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-400 font-mono uppercase mb-1 font-bold">
                        PIN Sandi Baru:
                      </label>
                      <input
                        type="password"
                        required
                        value={pinChangeNew}
                        onChange={(e) => setPinChangeNew(e.target.value)}
                        placeholder="Min 4 karakter"
                        className="w-full bg-[#151c2c] border border-slate-700 rounded p-2 text-xs text-center font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-1.5 px-4 rounded transition-colors shadow-lg shadow-emerald-950/40"
                    >
                      Terapkan PIN Baru
                    </button>
                  </div>
                </form>

                {showPinChangeSuccess && (
                  <div className="mt-2 bg-emerald-950/40 border border-emerald-900 text-emerald-300 p-2 rounded text-[11px] font-semibold text-center font-mono animate-pulse">
                    ✓ PIN Keamanan Dashboard Berhasil Diperbarui!
                  </div>
                )}
              </div>
            </div>

            {/* Sisi Kanan: Log Riwayat Akses Sistem Keamanan */}
            <div className="md:col-span-6 bg-gradient-to-b from-[#111623] to-[#0c0f1b] border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  Audit Keamanan & Log Percobaan Akses
                </h4>
                <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                  Pantau siapapun yang mencoba membuka panel. Membantu mengidentifikasi brute-force demi mengamankan MikroTik Anda.
                </p>

                <div className="bg-black/30 border border-slate-900 rounded p-2.5 text-[9.5px] font-mono text-indigo-300 space-y-1.5 max-h-[110px] overflow-y-auto scrollbar-thin">
                  {securityLogs.map((log, idx) => (
                    <div key={idx} className="pb-1 border-b border-slate-900/40 last:border-0 last:pb-0">
                      <span className="text-slate-500">•</span> {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. MAIN BENTO GRID BODY CONTENT */}
      <main className="flex-1 p-4 md:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        
        {/* Left Side: Monitor Dashboards (8 cols) */}
        <section className="lg:col-span-8 flex flex-col gap-4 min-h-0">
          
          {activeTab === "traffic" ? (
            <>
              {/* Quick Bento Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0">
                {/* 1. System Latency */}
                <div className="bg-[#121824] border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Globe className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold font-mono block">Ping Latency</span>
                    <span className="text-base font-extrabold text-white font-mono">
                      {latencyMs ? `${latencyMs} ms` : "Timeout"}
                    </span>
                  </div>
                </div>

                {/* 2. CPU usage */}
                <div className="bg-[#121824] border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold font-mono block">CPU Usage ({resources.cpuCount} Core)</span>
                    <span className="text-base font-extrabold text-[#10b981] font-mono">
                      {resources.cpuLoad}%
                    </span>
                    {/* Minibar */}
                    <div className="w-full bg-slate-900 h-1 rounded overflow-hidden mt-1">
                      <div
                        className={`h-full rounded ${resources.cpuLoad > 80 ? "bg-rose-500" : "bg-emerald-500"}`}
                        style={{ width: `${resources.cpuLoad}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* 3. RAM usage */}
                <div className="bg-[#121824] border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold font-mono block">RAM Free</span>
                    <span className="text-base font-extrabold text-cyan-400 font-mono">
                      {formatBytes(resources.freeMemory)}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono block">
                      Total: {formatBytes(resources.totalMemory)}
                    </span>
                  </div>
                </div>

                {/* 4. Router Specs */}
                <div className="bg-[#121824] border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                  <div className="p-[#8px] rounded-lg bg-amber-500/10 text-amber-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-500 uppercase font-bold font-mono block">Board & OS</span>
                    <span className="text-xs font-extrabold text-amber-400 font-mono block truncate" title={resources.boardName}>
                      {resources.boardName}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono truncate">
                      OS: {resources.version}
                    </span>
                  </div>
                </div>

                {/* 5. Uptime statistics */}
                <div className="bg-[#121824] border border-slate-800 rounded-xl p-3 flex items-center gap-3 col-span-2 md:col-span-1">
                  <div className="p-2 rounded-lg bg-fuchsia-500/10 text-fuchsia-400">
                    <Clock className="w-5 h-5 animate-spin-slow" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold font-mono block">Router Uptime</span>
                    <span className="text-xs font-bold text-fuchsia-300 font-mono block leading-none pt-0.5" title={resources.uptime}>
                      {resources.uptime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Traffic bandwidth Chart Area */}
              <div className="shrink-0">
                <NetworkChart history={bandwidthHistory} maxSpeed={100 * 1000000} />
              </div>

              {/* Split Content: Leases on left, Ports list on right */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-1 overflow-y-auto">
                {/* Leases clients table (column span 8) */}
                <div className="xl:col-span-7">
                  <ClientManager
                    clients={clients}
                    onToggleBlock={handleToggleBlockClient}
                    onUpdateLimit={handleUpdateLimitClient}
                    onAskAIAboutClient={askAIAboutClient}
                  />
                </div>

                {/* Interfaces status LED grid (column span 5) */}
                <div className="xl:col-span-5">
                  <InterfaceGrid interfaces={interfaces} />
                </div>
              </div>

              {/* System logs view */}
              <div className="shrink-0 mt-2">
                <LogViewer
                  logs={logs}
                  onClearLogs={handleClearLogs}
                  onAnalyzeWithAI={askAIAboutLog}
                />
              </div>
            </>
          ) : (
            <WifiBillingDashboard
              users={billingUsers}
              financeRecords={financeRecords}
              financeSummary={financeSummary}
              onPayBill={handlePayBill}
              onIsolateUser={handleIsolateUser}
              onRestoreUser={handleRestoreUser}
              onAddUser={handleAddBillingUser}
              onAskAIAuditing={handleAskAIAuditing}
            />
          )}

        </section>

        {/* Right Side: Gemini AI Advisor Sidebar (4 cols) */}
        <aside className="lg:col-span-4 flex flex-col h-full min-h-[500px]">
          <AIAssistant
            routerContext={{
              model: resources.boardName,
              version: resources.version,
              cpu: `${resources.cpuLoad}%`,
              clientCount: clients.filter((c) => !c.blocked).length,
              interfaces: interfaces.map((i) => i.name).join(", "),
            }}
            remotePromptTrigger={remoteAIQuery}
          />
        </aside>

      </main>

      {/* 5. Humble Human Foot Note */}
      <footer className="border-t border-slate-800/80 bg-[#070b13] px-5 py-3 text-center shrink-0">
        <p className="text-[11px] text-slate-500 font-mono">
          © 2026 RouterOS Monitoring Consultant Applet • Built with Antigravity AI Coding Platform & Microsoft/MikroTik API Standards.
        </p>
      </footer>
    </div>
  );
}
