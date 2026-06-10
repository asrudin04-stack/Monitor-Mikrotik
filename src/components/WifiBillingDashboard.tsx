import React, { useState, useMemo } from "react";
import { WifiBillingUser, MonthlyFinancialRecord, FinanceSummary } from "../types";
import { formatRupiah } from "../utils";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Users,
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock,
  Plus,
  Send,
  Ticket,
  Calendar,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  Clock,
  Printer,
  ChevronRight,
  ShieldCheck,
  Percent,
  TrendingDown,
  Sparkles
} from "lucide-react";

interface WifiBillingDashboardProps {
  users: WifiBillingUser[];
  financeRecords: MonthlyFinancialRecord[];
  financeSummary: FinanceSummary;
  onPayBill: (userId: string) => void;
  onIsolateUser: (userId: string) => void;
  onRestoreUser: (userId: string) => void;
  onAddUser: (user: Partial<WifiBillingUser>) => void;
  onAskAIAuditing: (prompt: string) => void;
}

export function WifiBillingDashboard({
  users,
  financeRecords,
  financeSummary,
  onPayBill,
  onIsolateUser,
  onRestoreUser,
  onAddUser,
  onAskAIAuditing
}: WifiBillingDashboardProps) {
  // Tabs: "tariffs" | "reports" | "vouchers"
  const [subTab, setSubTab] = useState<"cards" | "ledger" | "voucherGen">("cards");

  // State for creating new user
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState<Partial<WifiBillingUser>>({
    clientName: "",
    addressNum: "Blok C-",
    packageName: "Hotspot Ultra 10 Mbps",
    bandwidthLimit: "10M/10M",
    price: 150000,
    dueDate: "2026-06-12",
    phone: "0812-",
    macAddress: "FC:AA:11:22:33:44",
    status: "Pending"
  });

  // State for Hotspot Voucher generator
  const [voucherQty, setVoucherQty] = useState(5);
  const [voucherPrice, setVoucherPrice] = useState(5000);
  const [generatedVouchers, setGeneratedVouchers] = useState<{ code: string; limit: string; price: number }[]>([]);

  // Calculate current month real stats based on Paid vs Outstanding users + static records
  const calculatedSum = useMemo(() => {
    let paidSum = 0;
    let pendingSum = 0;
    let isolatedSum = 0;
    let activeSubs = 0;

    users.forEach((u) => {
      activeSubs++;
      if (u.status === "Lunas") {
        paidSum += u.price;
      } else {
        pendingSum += u.price;
      }
      if (u.status === "Isolasi") {
        isolatedSum++;
      }
    });

    const vouchersRevenue = financeSummary.hotspotVouchersSoldCount * 3500; // Average Rp 3.500 per voucher
    const totalOmset = paidSum + vouchersRevenue;
    const netProfit = totalOmset - financeSummary.expenseThisMonth;

    return {
      paidSum,
      pendingSum,
      isolatedSum,
      vouchersRevenue,
      totalOmset,
      netProfit,
      activeSubs
    };
  }, [users, financeSummary]);

  // Generate hotspot voucher logic
  const handleGenerateVouchers = (e: React.FormEvent) => {
    e.preventDefault();
    const limitsMap: Record<number, string> = {
      2000: "2 Jam / 1 GB",
      5000: "24 Jam / 3 GB",
      10000: "3 Hari / Unlimited",
      15000: "7 Hari / Unlimited"
    };

    const limitSelected = limitsMap[voucherPrice] || "30 Hari / 20 GB";

    const newlyMade = Array.from({ length: voucherQty }).map(() => {
      // Create random uppercase code resembling RouterOS tickets
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return {
        code,
        limit: limitSelected,
        price: voucherPrice
      };
    });

    setGeneratedVouchers(newlyMade);
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.clientName) return;
    onAddUser({
      ...newUser,
      id: `bill-user-${Date.now()}`
    });
    setShowAddModal(false);
    // Reset
    setNewUser({
      clientName: "",
      addressNum: "Blok C-",
      packageName: "Hotspot Ultra 10 Mbps",
      bandwidthLimit: "10M/10M",
      price: 150000,
      dueDate: "2026-06-12",
      phone: "0812-",
      macAddress: "FC:AA:11:22:33:44",
      status: "Pending"
    });
  };

  const triggerAIFinanceAudit = () => {
    const recordsStr = financeRecords.map(r => `${r.month}: Voucher Rp ${r.salesVouchers}, Bulanan Rp ${r.salesFixedSubs}, Beban ISP Rp ${r.operationalExpense}`).join("\n");
    const prompt = `Analisi kinerja keuangan jaringan RT/RW Net saya berdasarkan data historis ini:
${recordsStr}

Omset Berjalan Bulan Ini: ${formatRupiah(calculatedSum.totalOmset)}
Beban ISP/Listrik: ${formatRupiah(financeSummary.expenseThisMonth)}
Piutang Tertimbun: ${formatRupiah(calculatedSum.pendingSum)}
Jumlah Pelanggan Aktif: ${calculatedSum.activeSubs}

Berikan audit keuangan profesional, hitung Net Profit Margin, hitung persentase piutang tidak tertagih, dan berikan strategi cerdas untuk meningkatkan keuntungan serta solusi jitu menangani pelanggan yang nunggak bayar tagihan WiFi.`;

    onAskAIAuditing(prompt);
  };

  return (
    <div id="billing-monitoring-container" className="space-y-5">
      
      {/* 3D-effect Financial Quick Info Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Omset total with 3D shadow and blue gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1a233a] to-[#0f1422] border-t-2 border-[#3b82f6] rounded-2xl p-4 shadow-xl shadow-black/40 hover:translate-y-[-2px] transition-transform duration-300">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 blur-sm">
            <TrendingUp className="w-24 h-24 text-blue-400" />
          </div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold">
            Total Omset Juni (Berjalan)
          </p>
          <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 font-mono mt-1">
            {formatRupiah(calculatedSum.totalOmset)}
          </h3>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
            <span className="text-emerald-400 font-bold">🚀 {formatRupiah(calculatedSum.paidSum)}</span> dari {calculatedSum.activeSubs} Rumah / Kos
          </div>
          <div className="mt-1 text-[9px] text-[#93c5fd] font-mono">
            Vouchers: {formatRupiah(calculatedSum.vouchersRevenue)} ({financeSummary.hotspotVouchersSoldCount} pcs)
          </div>
        </div>

        {/* Card 2: Pengeluaran with card design and pink gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1a233a] to-[#0f1422] border-t-2 border-[#ec4899] rounded-2xl p-4 shadow-xl shadow-black/40 hover:translate-y-[-2px] transition-transform duration-300">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 blur-sm">
            <TrendingDown className="w-24 h-24 text-rose-400" />
          </div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold">
            Beban Operasional Bulanan
          </p>
          <h3 className="text-xl font-black text-rose-400 font-mono mt-1">
            {formatRupiah(financeSummary.expenseThisMonth)}
          </h3>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
            <span>Uplink Fiber ISP: Rp 350.000 / bln</span>
          </div>
          <div className="mt-1 text-[9px] text-slate-500 font-mono">
            Biaya Listrik & Ops: Rp 100.000 / bln
          </div>
        </div>

        {/* Card 3: Pending Receivables / Piutang with amber gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1a233a] to-[#0f1422] border-t-2 border-[#f59e0b] rounded-2xl p-4 shadow-xl shadow-black/40 hover:translate-y-[-2px] transition-transform duration-300">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 blur-sm">
            <AlertCircle className="w-24 h-24 text-amber-400" />
          </div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold">
            Piutang Tertimbun
          </p>
          <h3 className="text-xl font-black text-amber-500 font-mono mt-1">
            {formatRupiah(calculatedSum.pendingSum)}
          </h3>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Nunggak / Menunggu Konfirmasi</span>
          </div>
          <div className="mt-1 text-[9px] text-slate-400 font-mono">
            {users.filter(u => u.status !== "Lunas").length} Pelanggan belum melunasi tagihan
          </div>
        </div>

        {/* Card 4: Net profit with emerald gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1a233a] to-[#0f1422] border-t-2 border-[#10b981] rounded-2xl p-4 shadow-xl shadow-black/40 hover:translate-y-[-2px] transition-transform duration-300">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 blur-sm">
            <DollarSign className="w-24 h-24 text-emerald-400" />
          </div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold">
            Estimasi Laba Bersih (Net Profit)
          </p>
          <h3 className="text-xl font-black text-emerald-400 font-mono mt-1">
            {formatRupiah(calculatedSum.netProfit)}
          </h3>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-300">
            <Percent className="w-3 h-3 text-emerald-400 font-bold" />
            <span className="font-semibold text-emerald-400">
              {((calculatedSum.netProfit / (calculatedSum.totalOmset || 1)) * 100).toFixed(1)}% Margin Ratio
            </span>
          </div>
          <div className="mt-1 text-[9px] text-slate-500 font-mono">
            Arus kas sehat, profit ditingkatkan AI
          </div>
        </div>
      </div>

      {/* Main Billing Controller & SubTabs Navigation */}
      <div className="bg-[#121824] border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-4">
          <div>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">
              FINANCIAL MODULE
            </span>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 mt-1">
              <Receipt className="w-5 h-5 text-indigo-400" />
              Kelola Bill Jaringan & Kas RT/RW Net
            </h2>
            <p className="text-xs text-slate-400">
              Monitoring data tagihan WiFi pelanggan tetap bulanan dan cetak tiket voucher Hotspot
            </p>
          </div>

          <div className="flex bg-[#1b2336] p-0.5 rounded-lg border border-slate-700 w-full sm:w-auto text-xs font-semibold">
            <button
              onClick={() => setSubTab("cards")}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                subTab === "cards" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Kartu Pelanggan 3D
            </button>
            <button
              onClick={() => setSubTab("ledger")}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                subTab === "ledger" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Laporan & Grafik Keuangan
            </button>
            <button
              onClick={() => setSubTab("voucherGen")}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                subTab === "voucherGen" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              Generate Voucher Hotspot
            </button>
          </div>
        </div>

        {/* ======================= TAB 1: 3D CLIENT ACCESS CARDS ======================= */}
        {subTab === "cards" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">
                Menampilkan <b className="text-indigo-400">{users.length} kartu langganan bulanan</b>. Arahkan mouse untuk melihat shadow realistis.
              </span>

              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-lg shadow-indigo-950/40"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Berlangganan Baru
              </button>
            </div>

            {/* 3D Cards list Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pt-2">
              {users.map((u) => {
                const isPaid = u.status === "Lunas";
                const isPending = u.status === "Pending";
                const isIsolated = u.status === "Isolasi";
                const isOverdue = u.status === "Jatuh Tempo";

                // Choose gradient backgrounds mimicking beautiful credit card surfaces (Hologram look)
                let cardBg = "from-[#111827] via-[#0f172a] to-[#1e1b4b] border-t-4 border-[#3b82f6]";
                if (isPaid) {
                  cardBg = "from-[#0d1527] via-[#052e16]/10 to-[#1e1b4b] border-t-4 border-emerald-500";
                } else if (isIsolated) {
                  cardBg = "from-[#0f172a] via-[#451a03]/10 to-[#0c0a09] border-t-4 border-rose-600";
                } else if (isOverdue) {
                  cardBg = "from-[#0d1527] via-[#78350f]/15 to-[#451a03]/20 border-t-4 border-amber-600";
                }

                return (
                  <div
                    key={u.id}
                    className={`relative bg-gradient-to-br ${cardBg} border border-slate-800/80 rounded-2xl p-5 shadow-xl hover:shadow-[#6366f1]/10 hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between overflow-hidden group`}
                  >
                    {/* Glowing mesh circles inside the card to look ultra sleek */}
                    <div className="absolute right-[-40px] bottom-[-40px] w-32 h-32 bg-[#4f46e5]/10 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>

                    {/* Top Row: Client detail and 3D symbol */}
                    <div className="shrink-0 mb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono tracking-widest text-slate-500 block">
                            CLIENT ID: {u.id.toUpperCase().slice(0, 10)}
                          </span>
                          <h4 className="font-bold text-slate-100 text-sm tracking-wide mt-1 group-hover:text-indigo-400 transition-colors">
                            {u.clientName}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-sans block pt-0.5 font-medium">
                            📍 {u.addressNum}
                          </span>
                        </div>

                        {/* Payment Status visual emblem */}
                        <div className="text-right">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-black ${
                              isPaid
                                ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50"
                                : isIsolated
                                ? "bg-rose-950/40 text-rose-500 border border-rose-900"
                                : isOverdue
                                ? "bg-red-950/60 text-red-400 border border-red-900"
                                : "bg-amber-950/40 text-amber-400 border border-amber-900/50"
                            }`}
                          >
                            {u.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle details: speed, cost */}
                    <div className="py-2.5 my-1.5 border-y border-slate-800/60 grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Paket Internet:</span>
                        <span className="text-slate-200 font-bold tracking-tight text-xs block truncate" title={u.packageName}>
                          {u.packageName}
                        </span>
                        <span className="text-indigo-400 text-[10px] font-semibold mt-0.5 block">
                          🏎️ Max @ {u.bandwidthLimit}
                        </span>
                      </div>
                      <div className="border-l border-slate-800/80 pl-3">
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Biaya Tagihan:</span>
                        <span className="text-indigo-300 font-extrabold text-sm block">
                          {formatRupiah(u.price)}
                        </span>
                        <span className="text-slate-400 text-[10px] block mt-0.5">
                          Tempo: {u.dueDate}
                        </span>
                      </div>
                    </div>

                    {/* Bottom stats: router connection state, active MAC info */}
                    <div className="mt-2.5">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pb-3">
                        <span className="truncate max-w-[120px]" title={u.macAddress}>MAC: {u.macAddress}</span>
                        <span>Uptime: {u.uptimeSeconds > 0 ? `${(u.uptimeSeconds / 3600).toFixed(1)} jam` : "offline"}</span>
                      </div>

                      {/* Interactive Payments & Router isolation command buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/40 shrink-0">
                        {/* Status Toggle helper */}
                        {!isPaid ? (
                          <button
                            onClick={() => onPayBill(u.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1 transition-colors shadow shadow-emerald-900/35"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            Bayar Lunas
                          </button>
                        ) : (
                          <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 rounded-lg text-center py-1.5 text-[11px] font-bold font-mono">
                            ✓ Lunas Terbayar
                          </div>
                        )}

                        {/* Block/Isolate button integrating with RouterOS Firewall Filter */}
                        {isIsolated ? (
                          <button
                            onClick={() => onRestoreUser(u.id)}
                            className="bg-slate-800 hover:bg-slate-700 text-teal-400 text-[11px] font-bold py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1 transition-colors border border-slate-700"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            Buka Isolasi
                          </button>
                        ) : (
                          <button
                            onClick={() => onIsolateUser(u.id)}
                            className={`text-[11px] font-bold py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1 transition-colors border ${
                              isPaid
                                ? "bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed hover:bg-slate-900"
                                : "bg-rose-950/20 text-rose-400 border-rose-900 hover:bg-rose-900/40"
                            }`}
                            title={isPaid ? "Pelanggan sudah bayar, tidak boleh diisolasi" : "Isolasi internet via RouterOS filter"}
                            disabled={isPaid}
                          >
                            <Lock className="w-3.5 h-3.5" />
                            Isolasi Jalur
                          </button>
                        )}
                      </div>

                      {/* Kirim tagihan via WA simulate button */}
                      {!isPaid && (
                        <a
                          href={`https://wa.me/${u.phone.replace(/[^0-9]/g, "")}?text=Halo%20${encodeURIComponent(u.clientName)},%20kami%20mengingatkan%20bahwa%20tagihan%20layanan%20WiFi%20jaringan%20RT/RW%20Net%20sebesar%20*${encodeURIComponent(formatRupiah(u.price))}*%20untuk%20paket%20*${encodeURIComponent(u.packageName)}*%20jatuh%20tempo%20pada%20*${u.dueDate}*.%20Silakan%20lakukan%20pembayaran%20melalui%20transfer%20atau%20cash.%20Terima%20kasih!`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 w-full bg-slate-900/60 hover:bg-[#25D366]/10 text-[10px] text-slate-400 hover:text-[#25D366] border border-slate-800 hover:border-[#25D366]/40 py-1.5 rounded-lg text-center flex items-center justify-center gap-1.5 transition-colors font-semibold"
                        >
                          <Send className="w-3 h-3 text-[#25D366]" />
                          Kirim Pengingat WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= TAB 2: FINANCIAL REPORT LEDGER ======================= */}
        {subTab === "ledger" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">
                  Laporan Neraca Laba Rugi RT/RW Net Bulanan
                </h3>
                <p className="text-xs text-slate-400">
                  Lacak omset penjualan voucher hotspot dan langganan bulanan dikurangi pengeluaran ISP
                </p>
              </div>

              <div className="flex gap-2">
                {/* AI Auditing Button */}
                <button
                  onClick={triggerAIFinanceAudit}
                  className="bg-indigo-900/30 text-indigo-400 hover:bg-indigo-900/50 border border-indigo-800 text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Sparkles className="w-4 h-4 animate-bounce text-indigo-400" />
                  Audit Keuangan maki AI
                </button>
              </div>
            </div>

            {/* Custom SVG Financial Statement Bar chart */}
            <div className="bg-[#151c2c] border border-slate-800/80 rounded-xl p-4 shadow-inner">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono mb-4 text-center">
                Grafik Omset vs Pengeluaran (6 Bulan Terakhir)
              </h4>

              <div className="h-[200px] w-full relative flex items-end justify-between px-6 font-mono">
                {/* Y Axes markers */}
                <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-between text-[8px] text-slate-500 pointer-events-none select-none">
                  <span>Rp 3,5jt</span>
                  <span>Rp 2,5jt</span>
                  <span>Rp 1,5jt</span>
                  <span>Rp 500rb</span>
                </div>

                {financeRecords.map((rec, i) => {
                  const totalIn = rec.salesVouchers + rec.salesFixedSubs;
                  const maxVal = 3500000; // max scale 3.5 Million IDR
                  const incomeHeight = Math.min(160, (totalIn / maxVal) * 160);
                  const expenseHeight = Math.min(160, (rec.operationalExpense / maxVal) * 160);

                  return (
                    <div key={i} className="flex flex-col items-center flex-1 group z-10">
                      {/* Hover stats label popup */}
                      <div className="absolute top-[10px] bg-indigo-950/90 border border-slate-700 text-[10px] p-2 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl max-w-[200px]">
                        <p className="font-bold text-white mb-1 uppercase font-mono">{rec.month}</p>
                        <p className="text-emerald-400">Fixed Subs: {formatRupiah(rec.salesFixedSubs)}</p>
                        <p className="text-cyan-400">Voucher: {formatRupiah(rec.salesVouchers)}</p>
                        <p className="text-rose-400">Expense: {formatRupiah(rec.operationalExpense)}</p>
                        <p className="text-slate-200 border-t border-slate-800 mt-1 pt-1 font-extrabold text-[10px]">
                          Laba Bersih: {formatRupiah(totalIn - rec.operationalExpense)}
                        </p>
                      </div>

                      {/* Bar Containers */}
                      <div className="flex gap-2 items-end h-[160px] pb-1 w-full justify-center">
                        {/* Income Bar (Fixed + Voucher stacked) */}
                        <div
                          className="w-5 sm:w-8 bg-gradient-to-t from-indigo-700 to-emerald-500 rounded-t-md relative hover:opacity-80 transition-opacity flex items-end"
                          style={{ height: `${incomeHeight}px` }}
                        ></div>

                        {/* Expense Bar */}
                        <div
                          className="w-3 sm:w-4 bg-gradient-to-t from-rose-800 to-pink-500 rounded-t-sm relative hover:opacity-80 transition-opacity"
                          style={{ height: `${expenseHeight}px` }}
                        ></div>
                      </div>

                      {/* X axis labels */}
                      <span className="text-[9px] text-slate-400 mt-2 font-mono text-center truncate w-full">
                        {rec.month.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legends */}
              <div className="flex justify-center gap-6 text-[10px] mt-4 pt-3 border-t border-slate-800/60 font-mono">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-gradient-to-tr from-indigo-700 to-emerald-500 rounded"></div>
                  <span className="text-slate-300">Total Omset Pendapatan (Langganan + Voucher)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-gradient-to-tr from-rose-800 to-pink-500 rounded"></div>
                  <span className="text-slate-300">Biaya Pengeluaran Operasional (ISP Fiber + Listrik)</span>
                </div>
              </div>
            </div>

            {/* Financial Ledger Table Log */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest pb-1.5">
                    <th className="pb-2">Bulan Periode</th>
                    <th className="pb-2 text-right">Penjualan Voucher</th>
                    <th className="pb-2 text-right">Langganan Tetap</th>
                    <th className="pb-2 text-right text-rose-400">Operational Cost</th>
                    <th className="pb-2 text-right text-emerald-400">Total Profit</th>
                    <th className="pb-2 text-right">Status Kas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-xs">
                  {financeRecords.map((r, index) => {
                    const gross = r.salesVouchers + r.salesFixedSubs;
                    const net = gross - r.operationalExpense;
                    return (
                      <tr key={index} className="hover:bg-slate-800/10 transition-colors">
                        <td className="py-2.5 font-bold text-slate-300">{r.month}</td>
                        <td className="py-2.5 text-right text-slate-400">{formatRupiah(r.salesVouchers)}</td>
                        <td className="py-2.5 text-right text-slate-400">{formatRupiah(r.salesFixedSubs)}</td>
                        <td className="py-2.5 text-right text-rose-500">-{formatRupiah(r.operationalExpense)}</td>
                        <td className="py-2.5 text-right text-emerald-400 font-extrabold">{formatRupiah(net)}</td>
                        <td className="py-2.5 text-right">
                          <span className="bg-emerald-950/30 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            RECONCILED
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================= TAB 3: WIRELESS HOTSPOT VOUCHER TICKET GENERATOR ======================= */}
        {subTab === "voucherGen" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Form controls (5 cols) */}
              <div className="lg:col-span-5 bg-[#171f30] border border-slate-850 p-4 rounded-xl">
                <h3 className="font-bold text-xs text-indigo-400 uppercase tracking-widest font-mono mb-3">
                  Hotspot Ticket Configurator
                </h3>

                <form onSubmit={handleGenerateVouchers} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Pilih Tarif Paket Hotspot:
                    </label>
                    <select
                      value={voucherPrice}
                      onChange={(e) => setVoucherPrice(parseInt(e.target.value))}
                      className="w-full bg-[#111827] border border-slate-700 rounded p-2 text-slate-200"
                    >
                      <option value={2000}>Voucher Hore - Rp 2.000 (2 Jam / Speed 2 Mbps)</option>
                      <option value={5000}>Voucher Hemat - Rp 5.000 (24 Jam / Speed 3 Mbps)</option>
                      <option value={10000}>Voucher Premium - Rp 10.000 (3 Hari / Speed 5 Mbps)</option>
                      <option value={15000}>Voucher Sultan - Rp 15.000 (7 Hari / Speed 10 Mbps)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Jumlah Cetak Voucher:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={voucherQty}
                      onChange={(e) => setVoucherQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#111827] border border-slate-700 rounded p-2 text-slate-200"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95 text-xs shadow-lg shadow-indigo-900/35"
                  >
                    <Ticket className="w-4 h-4" />
                    Cetak Voucher MikroTik
                  </button>
                </form>

                {/* MikroTik Terminal Command Output block */}
                {generatedVouchers.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider mb-1.5 font-mono">
                      Terminal RouterOS CLI Script (V7 Hotspot):
                    </span>
                    <div className="bg-black/90 text-[10px] text-teal-400 p-2.5 rounded-lg font-mono overflow-x-auto max-h-[140px]">
                      {generatedVouchers.map((v) => (
                        <p key={v.code} className="whitespace-nowrap">
                          /ip hotspot user add name="{v.code}" password="{v.code}" profile="default" comment="Voucher-Rp{v.price}"
                        </p>
                      ))}
                    </div>
                    <span className="text-[9px] text-slate-400 italic block mt-1">
                      *Salin teks hitam di atas dan paste ke New Terminal Winbox untuk mendaftarkan voucher ke router MikroTik asli Anda secara massal!
                    </span>
                  </div>
                )}
              </div>

              {/* Right Printable Voucher mockup lists (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <span className="text-xs text-slate-400 font-mono block">
                  Pratinjau Tiket Voucher Siap Cetak & Gunting (Potongan 3D):
                </span>

                {generatedVouchers.length === 0 ? (
                  <div className="border border-dashed border-slate-800 rounded-xl py-12 text-center text-slate-500 text-xs italic font-mono bg-slate-950/20">
                    Belum ada voucher yang dibuat. Tekan tombol cetak di sisi kiri.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1 select-text custom-scrollbar">
                    {generatedVouchers.map((v, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-br from-[#121824] via-[#1a2334] to-[#121824] border border-dashed border-indigo-700/60 rounded-xl p-3.5 relative overflow-hidden group shadow-md hover:translate-y-[-1px] transition-transform"
                      >
                        {/* Decorative ticket notch left and right */}
                        <div className="absolute left-[-6px] top-1/2 -mt-1.5 w-3 h-3 bg-[#121824] rounded-full border-r border-[#1a2334]"></div>
                        <div className="absolute right-[-6px] top-1/2 -mt-1.5 w-3 h-3 bg-[#121824] rounded-full border-l border-[#1a2334]"></div>

                        <div className="flex justify-between items-start border-b border-dashed border-slate-850 pb-2 mb-2">
                          <div>
                            <span className="text-[8px] bg-indigo-950 text-indigo-400 font-bold px-1 py-0.5 rounded uppercase tracking-wide">
                              MEMBER TIKET
                            </span>
                            <h4 className="font-extrabold text-slate-200 text-xs tracking-wider mt-1 font-mono">
                              Voucher RT-RW Net
                            </h4>
                          </div>
                          <span className="text-[11px] font-black font-mono text-emerald-400">
                            {formatRupiah(v.price)}
                          </span>
                        </div>

                        {/* Login Creds */}
                        <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-slate-800 text-center font-mono my-2.5">
                          <p className="text-[8px] text-slate-400 uppercase tracking-widest">Username & Password</p>
                          <h3 className="text-md font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 tracking-widest">
                            {v.code}
                          </h3>
                        </div>

                        {/* Validity info */}
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 leading-none pb-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            Durasi: <b>{v.limit}</b>
                          </span>
                          <span className="text-[8px] font-bold text-slate-500">
                            No: #{idx+104}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 4. MODAL DETAILED ADD SUBSCRIPTION POPUP */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl relative animate-fade-in text-slate-200">
            <h3 className="font-bold text-base text-white mb-3 flex items-center gap-1.5">
              <Plus className="w-5 h-5 text-indigo-400" />
              Tambah Kontrak Berlangganan WiFi
            </h3>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3 text-xs leading-normal">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nama Pelanggan:</label>
                <input
                  type="text"
                  required
                  value={newUser.clientName}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Bpk. Bambang Pamungkas"
                  className="w-full bg-[#1b2336] border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">No Rumah/Blok:</label>
                  <input
                    type="text"
                    required
                    value={newUser.addressNum}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, addressNum: e.target.value }))}
                    placeholder="Blok C-15"
                    className="w-full bg-[#1b2336] border border-slate-700 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">No Whatsapp (62):</label>
                  <input
                    type="text"
                    required
                    value={newUser.phone}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="0812-4433-2211"
                    className="w-full bg-[#1b2336] border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Nama Tarif Jaringan:</label>
                  <select
                    value={newUser.packageName}
                    onChange={(e) => {
                      const tariffsMap: Record<string, number> = {
                        "Hotspot Ultra 5 Mbps": 95000,
                        "Hotspot Ultra 10 Mbps": 150000,
                        "Hotspot Ultra 20 Mbps": 250000,
                        "Hotspot Ultra 30 Mbps": 350000,
                        "Dedicated Bisnis 50 Mbps": 850000
                      };
                      const limitMap: Record<string, string> = {
                        "Hotspot Ultra 5 Mbps": "5M/5M",
                        "Hotspot Ultra 10 Mbps": "10M/10M",
                        "Hotspot Ultra 20 Mbps": "20M/20M",
                        "Hotspot Ultra 30 Mbps": "30M/30M",
                        "Dedicated Bisnis 50 Mbps": "50M/50M"
                      };

                      const priceVal = tariffsMap[e.target.value] || 150000;
                      const limitVal = limitMap[e.target.value] || "10M/10M";

                      setNewUser((prev) => ({
                        ...prev,
                        packageName: e.target.value,
                        price: priceVal,
                        bandwidthLimit: limitVal
                      }));
                    }}
                    className="w-full bg-[#1b2336] border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="Hotspot Ultra 5 Mbps">Home Lite 5 Mbps - Rp 95.000</option>
                    <option value="Hotspot Ultra 10 Mbps">Home Standard 10 Mbps - Rp 150.000</option>
                    <option value="Hotspot Ultra 20 Mbps">Home Super 20 Mbps - Rp 250.000</option>
                    <option value="Hotspot Ultra 30 Mbps">Home Pro 30 Mbps - Rp 350.000</option>
                    <option value="Dedicated Bisnis 50 Mbps">Dedicated 50 Mbps - Rp 850.000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">MAC Address Perangkat:</label>
                  <input
                    type="text"
                    required
                    value={newUser.macAddress}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, macAddress: e.target.value }))}
                    placeholder="E4:C2:1D:99:88:77"
                    className="w-full bg-[#1b2336] border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tanggal Jatuh Tempo:</label>
                  <input
                    type="date"
                    required
                    value={newUser.dueDate}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full bg-[#1b2336] border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Status Pembayaran:</label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, status: e.target.value as any }))}
                    className="w-full bg-[#1b2336] border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="Pending">Pending (Belum Bayar)</option>
                    <option value="Lunas">Lunas (Sudah Bayar)</option>
                    <option value="Isolasi">Isolasi (Blokir)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 font-semibold py-2 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
export default WifiBillingDashboard;
export {};
