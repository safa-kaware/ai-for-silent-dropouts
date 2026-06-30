import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import twilio from "twilio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Twilio SMS Proxy Endpoint
  app.post("/api/send-sms", async (req, res) => {
    const { sid, token, from, to, body } = req.body;

    if (!sid || !token || !from || !to || !body) {
      return res.status(400).json({ error: "Missing required Twilio parameters" });
    }

    try {
      const client = twilio(sid, token);
      const message = await client.messages.create({
        body,
        from,
        to,
      });
      res.json({ success: true, messageSid: message.sid });
    } catch (error: any) {
      console.error("Twilio Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
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
