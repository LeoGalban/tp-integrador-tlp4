import { Router } from "express";
import type { AuthController } from "../controllers/AuthController.ts";

// Rutas públicas de autenticación (no requieren token).
// Se montan en /api/auth desde app.ts
export function authRoutes(controller: AuthController): Router {
  const router = Router();

  router.post("/register", controller.register);
  router.post("/login", controller.login);

  return router;
}
