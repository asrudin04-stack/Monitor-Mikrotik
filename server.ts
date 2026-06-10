import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dns from "dns";

// Initialize Gemini AI Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in environment variables.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Test MikroTik Connection
app.post("/api/mikrotik/test", async (req, res) => {
  const { host, port, username, password, protocol } = req.body;

  if (!host || !username) {
    return res.status(400).json({
      success: false,
      message: "Host dan Username harus diisi.",
    });
  }

  const cleanHost = host.replace(/^(https?:\/\/)/, "");
  const basePort = port || (protocol === "https" ? "443" : "80");
  const url = `${protocol}://${cleanHost}:${basePort}/rest/system/resource`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const authString = Buffer.from(`${username}:${password || ""}`).toString("base64");
    
    // In node 18+, native fetch is available
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Accept": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return res.json({
        success: true,
        message: "Hubungan ke MikroTik berhasil!",
        data: data,
      });
    } else {
      const textErr = await response.text();
      return res.status(response.status).json({
        success: false,
        message: `Koneksi gagal. HTTP Status: ${response.status}. Detail: ${textErr}`,
      });
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    let errorDetail = err.message || "Unknown error";
    if (err.name === "AbortError") {
      errorDetail = "Koneksi timeout (router tidak merespons dalam 6 detik). Pastikan port REST API terbuka dan IP/Domain dapat diakses dari internet.";
    }
    return res.status(500).json({
      success: false,
      message: `Terjadi kesalahan saat menghubungkan: ${errorDetail}`,
    });
  }
});

// API: Proxy MikroTik commands (System resources, Interfaces, DHCP leases, Active Hotspot)
app.post("/api/mikrotik/query", async (req, res) => {
  const { host, port, username, password, protocol, endpoint } = req.body;

  if (!host || !username) {
    return res.status(400).json({ success: false, message: "Kredensial tidak lengkap." });
  }

  const cleanHost = host.replace(/^(https?:\/\/)/, "");
  const basePort = port || (protocol === "https" ? "443" : "80");
  // Clean custom endpoint path (e.g. "system/resource" -> "/rest/system/resource")
  const pathPart = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${protocol}://${cleanHost}:${basePort}/rest${pathPart}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const authString = Buffer.from(`${username}:${password || ""}`).toString("base64");
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Accept": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return res.json({ success: true, data });
    } else {
      const textErr = await response.text();
      return res.status(response.status).json({
        success: false,
        message: `HTTP ${response.status}: ${textErr}`,
      });
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    return res.status(500).json({
      success: false,
      message: err.message || "Timeout / Gagal menghubungkan ke router",
    });
  }
});

// API: Gemini Network diagnostics & AI assistant
app.post("/api/gemini/analyze", async (req, res) => {
  const { question, context } = req.body;

  if (!question) {
    return res.status(400).json({ success: false, message: "Pertanyaan tidak boleh kosong." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(200).json({
      success: true,
      answer: "Halo! Saya adalah Asisten AI MikroTik Anda. Saat ini **GEMINI_API_KEY** belum terkonfigurasi pada panel Secrets. \n\nSilakan konfigurasikan key Anda di menu **Settings > Secrets** untuk mengaktifkan kecerdasan penuh. Namun, jika Anda ada pertanyaan dasar, silakan ajukan! (Saat ini berjalan dalam mode offline fallback).",
    });
  }

  try {
    const formattedPrompt = `You are an expert Network Engineer and certified MikroTik Consultant (MTCNA, MTCRE, MTCINE).
Your job is to assist the user who is monitoring their MikroTik router through this web dashboard.
Please answer user inquiries or analyze network logs in Indonesian language.

User Router context right now:
- Model: ${context?.model || "MikroTik Router Board SIMULATED"}
- OS Version: ${context?.version || "RouterOS v7.11"}
- CPU Current: ${context?.cpu || "15%"}
- Active Interfaces: ${context?.interfaces || "ether1-WAN, ether2-LAN, bridge-Local"}
- Issues or client count: ${context?.clientCount || "6 devices connected"}

User Question or Action Requested:
"${question}"

Please provide highly professional, helpful, accurate, and easy-to-understand assistance in Indonesian. Use clear layout, formatting, and markdown list/tables if relevant. If they ask for scripting help, write clean, executable RouterOS CLI scripting commands inside markdown code blocks. Keep instructions actionable. Give background information briefly only. Avoid repeating code chunks excessively.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedPrompt,
    });

    const reply = response.text || "Mohon maaf, saya tidak menerima respons dari model.";
    return res.json({ success: true, answer: reply });
  } catch (error: any) {
    console.error("Gemini Assistant Error: ", error);
    return res.status(500).json({
      success: false,
      message: `Asisten AI mengalami gangguan: ${error.message}`,
    });
  }
});

// Setup Vite & static assets routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite development middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Production static files serving enabled...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
