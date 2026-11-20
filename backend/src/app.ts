import express from "express";
import type { Router } from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.ts";

// Los routers ya armados que recibe la app (se crean en main.ts)
export interface AppRouters {
  authRouter: Router;
}

// Crea y configura el servidor Express
export function createApp(routers: AppRouters) {
  const app = express();

  app.use(cors()); // permite que el frontend (otro puerto) llame a la API
  app.use(express.json()); // permite leer el JSON que llega en las requests

  // Ruta de prueba para saber si el servidor responde
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", routers.authRouter);

  // Siempre al final: atrapa los errores de todas las rutas anteriores
  app.use(errorHandler);

  return app;
}
