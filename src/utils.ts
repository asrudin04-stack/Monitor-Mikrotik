import { NetworkInterface, DhcpLease, LogEntry, NatRule, RouterResource, WifiBillingUser, FinanceSummary, MonthlyFinancialRecord } from "./types";

// Format bits-per-second to Mbps, Kbps, or Gbps
export function formatBandwidth(bps: number): string {
  if (bps < 1000) return `${bps.toFixed(1)} bps`;
  const kbps = bps / 1000;
  if (kbps < 1000) return `${kbps.toFixed(1)} Kbps`;
  const mbps = kbps / 1000;
  if (mbps < 1000) return `${mbps.toFixed(1)} Mbps`;
  const gbps = mbps / 1000;
  return `${gbps.toFixed(1)} Gbps`;
}

// Format IDR currency
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}


// Format byte sizes to readable string MB, GB, etc.
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

// Convert RouterOS uptime (e.g., 2w3d5h12m10s) into an indonesian-friendly uptime or keep as is
export function formatUptime(uptime: string): string {
  if (!uptime) return "-";
  // Replace w with 'mgg', d with 'hr', h with 'j', m with 'm', s with 'd' for Indonesian look, or keep clean
  return uptime
    .replace("w", "mgg ")
    .replace("d", "h ")
    .replace("h", "j ")
    .replace("m", "m ")
    .replace("s", "d");
}

// INITIAL SEED SIMULATED DATA
export const INITIAL_INTERFACES: NetworkInterface[] = [
  { name: "ether1-WAN (Indihome)", type: "ether", rxBytes: 1548293710834, txBytes: 429381023910, rxSpeed: 45200000, txSpeed: 8700000, status: "up" },
  { name: "ether2-LAN-Bawah", type: "ether", rxBytes: 312984719234, txBytes: 1238910239108, rxSpeed: 7400000, txSpeed: 38200000, status: "up" },
  { name: "ether3-Server-Lokal", type: "ether", rxBytes: 4129841029, txBytes: 38192347101, rxSpeed: 120000, txSpeed: 24700000, status: "up" },
  { name: "ether4-unpopulated", type: "ether", rxBytes: 0, txBytes: 0, rxSpeed: 0, txSpeed: 0, status: "down" },
  { name: "bridge-Local", type: "bridge", rxBytes: 317114560263, txBytes: 1277102586209, rxSpeed: 7520000, txSpeed: 62900000, status: "up" },
  { name: "wlan1-WiFi-Personal", type: "wlan", rxBytes: 94102934101, txBytes: 432891023945, rxSpeed: 4100000, txSpeed: 21500000, status: "up" },
  { name: "wlan2-WiFi-Hotspot", type: "wlan", rxBytes: 218938102391, txBytes: 812981024842, rxSpeed: 3200000, txSpeed: 16400000, status: "up" },
];

export const INITIAL_CLIENTS: DhcpLease[] = [
  { id: "c1", address: "192.168.88.254", mac: "D4:AD:FC:3A:91:02", hostname: "Samsung-Galaxy-S23-Ultra", status: "bound", activeRate: "4.5 Mbps", speedLimit: "None", blocked: false },
  { id: "c2", address: "192.168.88.150", mac: "A4:C3:F0:8A:23:44", hostname: "MacBook-Pro-Asrudin", status: "bound", activeRate: "18.2 Mbps", speedLimit: "30M/30M", blocked: false },
  { id: "c3", address: "192.168.88.102", mac: "70:8B:CD:4E:91:10", hostname: "SmartTV-4K-RuangTamu", status: "bound", activeRate: "22.1 Mbps", speedLimit: "None", blocked: false },
  { id: "c4", address: "192.168.88.89", mac: "18:65:90:E3:A4:4E", hostname: "iPhone15-Pro-Max", status: "bound", activeRate: "1.2 Mbps", speedLimit: "10M/10M", blocked: false },
  { id: "c5", address: "192.168.88.33", mac: "00:1A:2B:3C:4D:5E", hostname: "CCTV-TerasDepan", status: "bound", activeRate: "768.4 Kbps", speedLimit: "2M/2M", blocked: false },
  { id: "c6", address: "192.168.88.45", mac: "44:D9:E7:F4:01:A2", hostname: "PlayStation5-Room", status: "bound", activeRate: "42.1 Mbps", speedLimit: "None", blocked: false },
  { id: "c7", address: "192.168.88.75", mac: "90:F6:52:12:3C:99", hostname: "Alat-Print-Epson", status: "bound", activeRate: "0 bps", speedLimit: "None", blocked: false },
];

export const INITIAL_NAT_RULES: NatRule[] = [
  { id: "n1", chain: "srcnat", action: "masquerade", outInterface: "ether1-WAN (Indihome)", comment: "Default NAT Out internet", disabled: false, bytes: 481923485102, packets: 512948291 },
  { id: "n2", chain: "dstnat", action: "dst-nat", srcAddress: "0.0.0.0/0", toAddresses: "192.168.88.100", toPorts: "80", comment: "Port forwarding WebServer Local (8080->80)", disabled: false, bytes: 129482903, packets: 184920 },
  { id: "n3", chain: "dstnat", action: "dst-nat", srcAddress: "0.0.0.0/0", toAddresses: "192.168.88.200", toPorts: "37777", comment: "Port forwarding DVR CCTV", disabled: false, bytes: 298471203, packets: 341029 },
  { id: "n4", chain: "srcnat", action: "masquerade", outInterface: "bridge-Local", comment: "Hairpin NAT rule", disabled: true, bytes: 0, packets: 0 },
];

export const INITIAL_LOGS: LogEntry[] = [
  { id: "l1", time: "09:55:12", topics: "system,info,account", message: "user admin logged in via local winbox from 192.168.88.150", severity: "info" },
  { id: "l2", time: "09:56:01", topics: "dhcp,info", message: "dhcp-server assigned IP 192.168.88.254 to Samsung-Galaxy-S23-Ultra", severity: "info" },
  { id: "l3", time: "09:58:30", topics: "firewall,info", message: "defense-drop input src: 185.120.34.12:54890 -> dst: WAN:53, UDP proto, flood blocked", severity: "warning" },
  { id: "l4", time: "10:00:04", topics: "interface,info", message: "ether1-WAN (Indihome) link up (speed 1000M, full duplex)", severity: "info" },
  { id: "l5", time: "10:01:22", topics: "dhcp,warning", message: "dhcp-server received discover on wlan2-WiFi-Hotspot with invalid MAC", severity: "warning" },
  { id: "l6", time: "10:03:45", topics: "dns,packet,error", message: "failed to resolve google.com, upstream ISP DNS 8.8.8.8 timed out", severity: "critical" },
];

// Mutate simulated data to simulate real-time dynamic behavior
export function updateSimulatedResources(current: RouterResource): RouterResource {
  const deltaCpu = (Math.random() - 0.5) * 8; // Change cpu by +/-4%
  let nextCpu = current.cpuLoad + deltaCpu;
  if (nextCpu < 3) nextCpu = 3;
  if (nextCpu > 95) nextCpu = 65; // reduce spike

  const randomChangeMemory = Math.floor((Math.random() - 0.5) * 10 * 1024 * 1024); // +/-5MB
  let nextFreeMemory = current.freeMemory + randomChangeMemory;
  if (nextFreeMemory < 100 * 1024 * 1024) nextFreeMemory = 312 * 1024 * 1024;
  if (nextFreeMemory > current.totalMemory) nextFreeMemory = current.totalMemory - 150*1024*1024;

  // Add 1 sec to uptime
  const uptimeParts = current.uptime.split("s")[0].split("m");
  let sec = 0;
  let min = 0;
  let hr = 2;
  let day = 1;

  // Simple increment mock logic
  const match = current.uptime.match(/(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
  if (match) {
    day = match[1] ? parseInt(match[1]) : 0;
    hr = match[2] ? parseInt(match[2]) : 0;
    min = match[3] ? parseInt(match[3]) : 0;
    sec = match[4] ? parseInt(match[4]) : 0;
  }

  sec += 1;
  if (sec >= 60) {
    sec = 0;
    min += 1;
  }
  if (min >= 60) {
    min = 0;
    hr += 1;
  }
  if (hr >= 24) {
    hr = 0;
    day += 1;
  }

  const cleanUptime = `${day > 0 ? day + "d" : ""}${hr > 0 ? hr + "h" : ""}${min}m${sec}s`;

  return {
    ...current,
    cpuLoad: parseFloat(nextCpu.toFixed(1)),
    freeMemory: nextFreeMemory,
    uptime: cleanUptime,
  };
}

export function updateSimulatedInterfaces(interfaces: NetworkInterface[]): NetworkInterface[] {
  return interfaces.map((inter) => {
    if (inter.status === "down") return inter;

    // Introduce random bandwidth spikes and drops
    let speedFactor = 0.9;
    if (inter.name.includes("WAN")) {
      // WAN speed high
      const isSpike = Math.random() > 0.85;
      const targetSpeedRx = isSpike 
        ? Math.random() * 120000000 + 40000000 // spike 40-160 Mbps
        : Math.random() * 30000000 + 5000000;    // normal 5-35 Mbps
      const targetSpeedTx = isSpike 
        ? Math.random() * 20000000 + 10000000  // spike 10-30 Mbps
        : Math.random() * 5000000 + 1000000;     // normal 1-6 Mbps

      const rxDiff = (targetSpeedRx - inter.rxSpeed) * 0.45;
      const txDiff = (targetSpeedTx - inter.txSpeed) * 0.45;

      const nRx = Math.max(100000, inter.rxSpeed + rxDiff);
      const nTx = Math.max(50000, inter.txSpeed + txDiff);

      return {
        ...inter,
        rxSpeed: Math.round(nRx),
        txSpeed: Math.round(nTx),
        rxBytes: inter.rxBytes + Math.round(nRx / 8),
        txBytes: inter.txBytes + Math.round(nTx / 8),
      };
    } else {
      // Local interfaces mirroring WAN and local traffic
      const isSpike = Math.random() > 0.82;
      const rxBase = inter.name.includes("Server") 
        ? (Math.random() * 10000000) 
        : (Math.random() * 15000000 + 200000);
      const txBase = inter.name.includes("Server") 
        ? (Math.random() * 45000000 + 1000000) 
        : (Math.random() * 8000000 + 100000);

      const rxDiff = (rxBase - inter.rxSpeed) * 0.5;
      const txDiff = (txBase - inter.txSpeed) * 0.5;

      const nRx = Math.max(0, inter.rxSpeed + rxDiff);
      const nTx = Math.max(0, inter.txSpeed + txDiff);

      return {
        ...inter,
        rxSpeed: Math.round(nRx),
        txSpeed: Math.round(nTx),
        rxBytes: inter.rxBytes + Math.round(nRx / 8),
        txBytes: inter.txBytes + Math.round(nTx / 8),
      };
    }
  });
}

const LOG_MESSAGES_POOL = [
  { topic: "dhcp,info", msg: "dhcp-server assigned IP 192.168.88.89 to iPhone15-Pro-Max", severity: "info" },
  { topic: "system,info,account", msg: "user admin changed firewall address-list via API", severity: "info" },
  { topic: "firewall,info", msg: "drop forward rule: dst 104.244.42.1 (twitter) on user-blocked rule", severity: "warning" },
  { topic: "web-proxy,warning", msg: "hotspot user 'Aris_WiFi' redirected to landing-page (insufficient balance)", severity: "warning" },
  { topic: "hotspot,info,debug", msg: "hotspot-server: client Mac 70:8B:CD:4E:91:10 connected (host 192.168.88.102)", severity: "info" },
  { topic: "system,info,dns", msg: "DNS dynamic cache flushed successfully", severity: "info" },
  { topic: "system,error,critical", msg: "IP Firewall filter modified: invalid NAT loopback action detected!", severity: "critical" }
];

export function addNewSimulatedLog(logs: LogEntry[]): LogEntry[] {
  const lucky = Math.floor(Math.random() * LOG_MESSAGES_POOL.length);
  const selected = LOG_MESSAGES_POOL[lucky];

  const now = new Date();
  const timeStr = now.toTimeString().split(" ")[0]; // "HH:MM:SS"

  const newLog: LogEntry = {
    id: `l-new-${Date.now()}`,
    time: timeStr,
    topics: selected.topic,
    message: selected.msg,
    severity: selected.severity as any,
  };

  // Keep max 15 logs
  return [newLog, ...logs].slice(0, 15);
}

export const INITIAL_BILLING_USERS: WifiBillingUser[] = [
  {
    id: "bill-1",
    clientName: "Bpk. Aris Widodo",
    addressNum: "Perum Blok C-12",
    packageName: "Hotspot Ultra 20 Mbps",
    bandwidthLimit: "20M/20M",
    price: 250000,
    dueDate: "2026-06-15",
    status: "Lunas",
    uptimeSeconds: 154820,
    phone: "0812-3456-7890",
    macAddress: "FC:FB:FB:12:34:56"
  },
  {
    id: "bill-2",
    clientName: "Warnet Jaya Mandiri (Roni)",
    addressNum: "Ruko Jl. Ahmad Yani No. 15",
    packageName: "Dedicated Bisnis 50 Mbps",
    bandwidthLimit: "50M/50M",
    price: 850000,
    dueDate: "2026-06-08",
    status: "Isolasi",
    uptimeSeconds: 0,
    phone: "0819-3221-5544",
    macAddress: "00:15:5D:12:AF:02"
  },
  {
    id: "bill-4",
    clientName: "Ibu Siti Rahayu (Kost Kamar 03)",
    addressNum: "Kost Harmoni Kamar 03",
    packageName: "Wifi Kos Standar 10 Mbps",
    bandwidthLimit: "10M/10M",
    price: 150000,
    dueDate: "2026-06-12",
    status: "Pending",
    uptimeSeconds: 84920,
    phone: "0857-4433-2211",
    macAddress: "D4:AD:FC:88:99:99"
  },
  {
    id: "bill-5",
    clientName: "Cafe Kopi Toebroek",
    addressNum: "Jl. Veteran No. 8",
    packageName: "Sponsor Hotspot Bisnis 30 Mbps",
    bandwidthLimit: "30M/30M",
    price: 450000,
    dueDate: "2026-06-25",
    status: "Lunas",
    uptimeSeconds: 251900,
    phone: "0821-9988-7766",
    macAddress: "E4:F2:1D:C4:B8:33"
  },
  {
    id: "bill-6",
    clientName: "Bpk. Heru Sasongko",
    addressNum: "Perum Blok A-02",
    packageName: "Home Lite 5 Mbps",
    bandwidthLimit: "5M/5M",
    price: 950000,
    dueDate: "2026-06-05",
    status: "Jatuh Tempo",
    uptimeSeconds: 15920,
    phone: "0813-2244-6688",
    macAddress: "80:2A:A8:11:00:2B"
  },
  {
    id: "bill-7",
    clientName: "Kost Putri Melati (Kost Kamar A)",
    addressNum: "Kost Melati Room A",
    packageName: "Wifi Kos Standar 10 Mbps",
    bandwidthLimit: "10M/10M",
    price: 150000,
    dueDate: "2026-06-18",
    status: "Pending",
    uptimeSeconds: 312000,
    phone: "0896-1234-5678",
    macAddress: "CC:3A:4C:5E:6F:70"
  }
];

export const INITIAL_FINANCE_SUMMARY: FinanceSummary = {
  incomeThisMonth: 1800000, // Rp 1.800.000 from paid users
  expenseThisMonth: 450000,  // Rp 450.000 (ISP fiber fee + electricity)
  pendingReceivables: 1150000, // Rp 1.150.000 (Siti, Warnet Jaya, Heru)
  activeSubscriberCount: 6,
  hotspotVouchersSoldCount: 312, // Rp 5.000 or Rp 2.000 hotspot passes
};

export const INITIAL_FINANCE_RECORDS: MonthlyFinancialRecord[] = [
  { month: "Januari", salesVouchers: 852000, salesFixedSubs: 1350000, operationalExpense: 450000 },
  { month: "Februari", salesVouchers: 914000, salesFixedSubs: 1500000, operationalExpense: 450000 },
  { month: "Maret", salesVouchers: 1120000, salesFixedSubs: 1650000, operationalExpense: 480000 },
  { month: "April", salesVouchers: 1040000, salesFixedSubs: 1650000, operationalExpense: 450000 },
  { month: "Mei", salesVouchers: 1250000, salesFixedSubs: 1800000, operationalExpense: 450000 },
  { month: "Juni (Berjalan)", salesVouchers: 780000, salesFixedSubs: 1800000, operationalExpense: 450000 },
];

