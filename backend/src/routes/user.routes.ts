import { Router } from "express";
import type { RequestHandler } from "express";
import type { UserController } from "../controllers/UserController.ts";
import { authorize } from "../middlewares/authorize.ts";

// Rutas de administración de usuarios (RF6). Se montan en /api/users desde app.ts
export function userRoutes(controller: UserController, authenticate: RequestHandler): Router {
  const router = Router();

  // Todas las rutas de este router requieren estar logueado
  router.use(authenticate);

  router.get("/", authorize("user:read"), controller.list);
  router.get("/roles", authorize("user:read"), controller.listRoles);
  router.patch("/:id/role", authorize("user:assign-role"), controller.assignRole);

  return router;
}
