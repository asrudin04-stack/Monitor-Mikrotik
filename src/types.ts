export interface RouterConnection {
  host: string;
  port: string;
  username: string;
  protocol: "http" | "https";
  isSimulated: boolean;
}

export interface RouterResource {
  cpuLoad: number;
  freeMemory: number;
  totalMemory: number;
  freeDisk: number;
  totalDisk: number;
  boardName: string;
  uptime: string;
  version: string;
  cpuCount: number;
}

export interface NetworkInterface {
  name: string;
  type: string;
  rxBytes: number;
  txBytes: number;
  rxSpeed: number; // in bps
  txSpeed: number; // in bps
  status: "up" | "down";
}

export interface DhcpLease {
  id: string;
  address: string;
  mac: string;
  hostname: string;
  status: string;
  activeRate: string; // active live usage (e.g., "5.4 Mbps")
  speedLimit: string; // e.g., "2M/2M" or "None"
  blocked: boolean;
}

export interface LogEntry {
  id: string;
  time: string;
  topics: string;
  message: string;
  severity: "info" | "warning" | "critical";
}

export interface NatRule {
  id: string;
  chain: string;
  action: string;
  srcAddress?: string;
  dstAddress?: string;
  outInterface?: string;
  toAddresses?: string;
  toPorts?: string;
  disabled: boolean;
  comment?: string;
  bytes: number;
  packets: number;
}

export interface WifiBillingUser {
  id: string;
  clientName: string;
  addressNum: string; // e.g., "Blok C-12", "Kamar 04" or "Voucher-RT-012"
  packageName: string; // e.g., "Silver 5 Mbps", "Gold 15 Mbps", "Voucher Harian"
  bandwidthLimit: string; // "5M/5M", "15M/15M" etc
  price: number; // in IDR Rupiah
  dueDate: string; // YYYY-MM-DD
  status: "Lunas" | "Pending" | "Isolasi" | "Jatuh Tempo";
  uptimeSeconds: number;
  phone: string;
  macAddress: string;
}

export interface FinanceSummary {
  incomeThisMonth: number;
  expenseThisMonth: number;
  pendingReceivables: number;
  activeSubscriberCount: number;
  hotspotVouchersSoldCount: number;
}

export interface MonthlyFinancialRecord {
  month: string;
  salesVouchers: number; // income from prepaid vouchers
  salesFixedSubs: number;  // income from fixed monthly wifi
  operationalExpense: number; // cost of ISP fiber, electricity, etc.
}

