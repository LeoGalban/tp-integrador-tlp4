import { Router } from "express";
import type { RequestHandler } from "express";
import type { AuthController } from "../controllers/AuthController.ts";

// Rutas de autenticación. Se montan en /api/auth desde app.ts
export function authRoutes(controller: AuthController, authenticate: RequestHandler): Router {
  const router = Router();

  // Públicas (no requieren token)
  router.post("/register", controller.register);
  router.post("/login", controller.login);

  // Requiere token: devuelve el usuario logueado con sus permisos
  router.get("/me", authenticate, controller.me);

  return router;
}
