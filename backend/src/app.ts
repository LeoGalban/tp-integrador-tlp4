import express from "express";
import cors from "cors";

// Crea y configura el servidor Express
export function createApp() {
  const app = express();

  app.use(cors()); // permite que el frontend (otro puerto) llame a la API
  app.use(express.json()); // permite leer el JSON que llega en las requests

  // Ruta de prueba para saber si el servidor responde
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}
