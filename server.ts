import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Model lazy initialization
  let aiModel: any = null;
  const getAiModel = () => {
    if (!aiModel) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in environment variables.");
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
    return aiModel;
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Telegram scraper route
  app.post("/api/scrape/telegram", async (req, res) => {
    const apiId = parseInt(process.env.TELEGRAM_API_ID || "2904138");
    const apiHash = process.env.TELEGRAM_API_HASH || "d180c8b3d200e252c32b29c6546b8c23";
    const session = new StringSession(""); // Should be persisted
    
    try {
      // client initialization would go here
      res.json({ 
        message: "Scraping simulation triggered", 
        channels: ["Lachivadeuraba", "masnoticia", "MedellinyAntioquiayTodoColombia"],
        status: "ready"
      });
    } catch (err) {
      res.status(500).json({ error: "Client failed" });
    }
  });

  // Scraper status route
  app.get("/api/scrapers", (req, res) => {
    res.json({
      telegram: [
        { name: "La Chiva de Urabá", link: "t.me/Lachivadeuraba", status: "online" },
        { name: "Más Noticias", link: "t.me/masnoticia", status: "online" },
        { name: "Medellín y Antioquia", link: "t.me/MedellinyAntioquiayTodoColombia", status: "online" }
      ],
      facebook: [
        { name: "Organis Noticias", link: "https://www.facebook.com/organisnoticiasss", status: "online" },
        { name: "Felix TV", link: "https://www.facebook.com/felixtv15", status: "online" },
        { name: "Mi Región 360", link: "https://www.facebook.com/MiRegion360", status: "online" },
        { name: "Panorama del San Jorge", link: "https://www.facebook.com/panoramadelsanjorge", status: "online" },
        { name: "Cauca Noticias", link: "https://www.facebook.com/CaucaNoticias.co", status: "online" },
        { name: "La Otra Verdad Col", link: "https://www.facebook.com/LaOtraVerdadCol", status: "online" },
        { name: "Montería en Línea", link: "https://www.facebook.com/monteriaenlinea", status: "online" }
      ]
    });
  });

  // AI Strategic Analysis logic
  app.post("/api/strategic-analysis", async (req, res) => {
    const { department, municipality, newsCount, topTypologies } = req.body;

    try {
      const prompt = `Actúa como un experto en seguridad nacional y analista estratégico de riesgos. 
      Genera un INFORME ESTRATÉGICO PERSUASIVO Y COMPLETO para la región de ${department} ${municipality !== 'todos' ? `(Municipio: ${municipality})` : ''}.
      
      CONTEXTO ACTUAL:
      - Volumen de noticias: ${newsCount} reportes detectados en el periodo.
      - Tipologías predominantes: ${topTypologies.join(', ')}.
      
      REQUERIMIENTOS DEL INFORME:
      1. RESUMEN EJECUTIVO: Situación de seguridad y orden público.
      2. ANÁLISIS DE RIESGOS: Amenazas detectadas (GAO, minería ilegal, conflictividad social).
      3. IMPACTO SOCIO-ECONÓMICO: Cómo afecta esto al desarrollo local.
      4. RECOMENDACIONES TÁCTICAS:
         - Para la Fuerza Pública (Ejército, Policía).
         - Para la Comunidad y Entidades Civiles.
      
      Usa un tono profesional, autoritario y persuasivo. Formato Markdown.`;
      
      const result = await getAiModel().generateContent(prompt);
      const output = result.response.text();
      res.json({ analysis: output });
    } catch (error) {
      console.error("Strategic Analysis failed:", error);
      res.status(500).json({ error: "Analysis failed" });
    }
  });

  // AI Classification logic
  app.post("/api/classify", async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    try {
      const prompt = `Analiza esta noticia de Antioquia/Córdoba o Internacional y devuélvela estrictamente en formato JSON.
      Tipologías permitidas: orden_publico, eventos_culturales, sistema_politico, movilidad_tt, desarrollo_economico, sistema_judicial, educacion_salud, medio_ambiente, emergencias, general.
      
      JSON Structure:
      {
        "typology": "string",
        "municipality": "string (o null si es internacional)",
        "department": "Antioquia|Córdoba|Internacional",
        "keywords": ["tag1", "tag2"],
        "title": "un título corto y llamativo"
      }
      
      Texto: ${text}`;
      
      const result = await getAiModel().generateContent(prompt);
      const output = result.response.text();
      const cleanedJson = output.replace(/```json|```/g, "").trim();
      res.json(JSON.parse(cleanedJson));
    } catch (error) {
      console.error("AI Classification failed:", error);
      res.status(500).json({ error: "Classification failed" });
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
