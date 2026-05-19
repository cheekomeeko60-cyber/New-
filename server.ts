import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Router
  const apiRouter = express.Router();

  // AI Analysis Endpoint
  const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "missing-key",
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });

  apiRouter.post("/ai/analyze", async (req, res) => {
    console.log("[API] AI request received");
    try {
      const { prompt } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({ error: "GEMINI_API_KEY not configured" });
      }
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("[API] AI Error:", error);
      res.status(500).json({ error: "AI processing failed" });
    }
  });

  // Market Data Cache
  let marketCache: any = null;
  let lastCacheTime = 0;
  const CACHE_TTL = 60000; // Increased to 60 seconds

  // Market Data Endpoint (Live from Yahoo Finance)
  apiRouter.get("/market/prices", async (req, res) => {
    const now = Date.now();
    if (marketCache && (now - lastCacheTime < CACHE_TTL)) {
      return res.json(marketCache);
    }

    console.log("[API] Fetching real-time market prices");
    
    try {
      // Yahoo Finance Symbols: GC=F (Gold), SI=F (Silver), CL=F (WTI Oil)
      const symbols: Record<string, string> = {
        "GOLD": "GC=F",
        "SILVER": "SI=F",
        "OIL": "CL=F"
      };

      const fetchPrice = async (symbol: string) => {
        const yfSymbol = symbols[symbol];
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yfSymbol}?interval=1m&range=1d`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

        try {
          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json'
            }
          });

          clearTimeout(timeoutId);

          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const data = await response.json() as any;
          if (!data?.chart?.result?.[0]) throw new Error("Invalid data structure");

          const result = data.chart.result[0];
          const price = result.meta.regularMarketPrice;
          const prevClose = result.meta.previousClose;
          const change24h = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

          return {
            symbol,
            price: price || 0,
            change24h: parseFloat(change24h.toFixed(2)),
            lastUpdated: new Date().toISOString()
          };
        } catch (err) {
          clearTimeout(timeoutId);
          console.error(`[API] Failed to fetch ${symbol}:`, err instanceof Error ? err.message : String(err));
          // Return a sensible default for this symbol instead of crashing the whole request
          const defaults: Record<string, number> = { "GOLD": 2350, "SILVER": 28.5, "OIL": 79.2 };
          return {
            symbol,
            price: defaults[symbol] || 0,
            change24h: 0,
            lastUpdated: new Date().toISOString(),
            isFallback: true
          };
        }
      };

      const results = await Promise.all([
        fetchPrice("GOLD"),
        fetchPrice("SILVER"),
        fetchPrice("OIL")
      ]);

      const finalData = [
        ...results,
        { symbol: "INFLATION", price: 3.42, change24h: 0.02, lastUpdated: new Date().toISOString() }
      ];

      marketCache = finalData;
      lastCacheTime = Date.now();
      res.json(finalData);
    } catch (error) {
      console.error("[API] Market Data Critical Error:", error);
      // Even if everything fails, return the last cache or at least some data
      if (marketCache) return res.json(marketCache);
      
      const nowTime = new Date();
      const fallbackData = [
        { symbol: "GOLD", price: 2342.45, change24h: 1.25, lastUpdated: nowTime.toISOString(), isSimulated: true },
        { symbol: "SILVER", price: 28.12, change24h: -0.45, lastUpdated: nowTime.toISOString(), isSimulated: true },
        { symbol: "OIL", price: 78.54, change24h: 2.15, lastUpdated: nowTime.toISOString(), isSimulated: true },
        { symbol: "INFLATION", price: 3.42, change24h: 0.02, lastUpdated: nowTime.toISOString() }
      ];
      res.json(fallbackData);
    }
  });

  apiRouter.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api", apiRouter);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
