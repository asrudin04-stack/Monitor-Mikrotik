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
