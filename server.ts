import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env.local") });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- BUSINESS LOGIC & SIMULATION STATE ---
  
  // Idempotency check: key -> boolean
  const idempotencyStore = new Set<string>();
  
  // Events Store
  let liveEvents: any[] = [];
  
  // Historical Batch Data (last 4 days)
  let batchReports = [
    { day: "T-4", processed: 1240, expected: 1240, completion: 100 },
    { day: "T-3", processed: 1560, expected: 1560, completion: 100 },
    { day: "T-2", processed: 1890, expected: 1900, completion: 99.4 },
    { day: "T-1", processed: 2100, expected: 2100, completion: 100 },
  ];

  // API ROUTES
  
  // Trigger Live Event (Hot Path)
  app.post("/api/events/trigger", (req, res) => {
    const { id, type, location, urgency, idempotencyKey } = req.body;
    
    if (!idempotencyKey) {
      return res.status(400).json({ error: "Missing idempotencyKey" });
    }

    const isDuplicate = idempotencyStore.has(idempotencyKey);
    
    if (!isDuplicate) {
      idempotencyStore.add(idempotencyKey);
    }

    const newEvent = {
      id: id || Date.now(),
      type: type || "General Incident",
      location: location || "Barcelona - Zona A",
      urgency: urgency || "High",
      timestamp: new Date().toISOString(),
      latency: Math.random() * 1.5 + 0.2, // Simulated latency in seconds
      isDuplicate
    };

    liveEvents.unshift(newEvent);
    if (liveEvents.length > 50) liveEvents.pop(); // Keep manageable size

    res.json(newEvent);
  });

  // Get Events
  app.get("/api/events", (req, res) => {
    res.json(liveEvents);
  });

  // Run Batch Cron (Cold Path)
  app.post("/api/cron/run", (req, res) => {
    const today = new Date().toLocaleDateString();
    
    // Simulate some missing records for the batch if demand is too high
    const expected = Math.floor(Math.random() * 500) + 2000;
    const processed = Math.random() > 0.1 ? expected : expected - Math.floor(Math.random() * 20);
    const completion = parseFloat(((processed / expected) * 100).toFixed(1));

    const newBatch = {
      day: "TODAY",
      processed,
      expected,
      completion
    };

    // Update the "TODAY" report or add new one
    const todayIdx = batchReports.findIndex(r => r.day === "TODAY");
    if (todayIdx > -1) {
      batchReports[todayIdx] = newBatch;
    } else {
      batchReports.push(newBatch);
    }

    res.json(newBatch);
  });

  // Get Batch Reports
  app.get("/api/reports", (req, res) => {
    res.json(batchReports);
  });

   // Gemini AI Proxy Endpoint
   app.post("/api/ai/chat", async (req, res) => {
     const { prompt, model = "gemini-1.5-flash" } = req.body;

     const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

     if (!apiKey) {
       return res.status(500).json({ error: "API key not configured", details: "VITE_GEMINI_API_KEY is missing" });
     }

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      const data = await response.json() as any;

      if (!response.ok) {
        console.error("[API Error]", data);
        return res.status(response.status).json({ error: "API request failed", details: data });
      }

      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      res.json({ success: true, text: generatedText });
    } catch (error) {
      console.error("[Gemini Error]", error);
      res.status(500).json({ error: "Failed to reach Gemini API", details: String(error) });
    }
  });

  // VITE MIDDLEWARE SETUP
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
    console.log(`[GLOVO_SYSTEM] Server running on http://localhost:${PORT}`);
    console.log(`[GLOVO_SYSTEM] Triggers initialized: Event-Driven & Cron-Job`);
  });
}

startServer();
