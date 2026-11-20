import { Router } from "express";
import type { RequestHandler } from "express";
import type { ProductController } from "../controllers/ProductController.ts";
import { authorize } from "../middlewares/authorize.ts";

// Rutas de productos (RF3). Se montan en /api/products desde app.ts
// Cada ruta exige el permiso de la tabla RF2.
export function productRoutes(controller: ProductController, authenticate: RequestHandler): Router {
  const router = Router();

  // Todas las rutas requieren estar logueado
  router.use(authenticate);

  router.get("/", authorize("producto:read"), controller.list);
  router.get("/:id", authorize("producto:read"), controller.getById);
  router.post("/", authorize("producto:create"), controller.create);
  router.put("/:id", authorize("producto:update"), controller.update);
  router.patch("/:id/status", authorize("producto:change-status"), controller.changeStatus);
  router.delete("/:id", authorize("producto:delete"), controller.delete);

  return router;
}
