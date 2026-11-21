import { Router } from "express";
import type { RequestHandler } from "express";
import type { SubscriptionController } from "../controllers/SubscriptionController.ts";
import { authorize } from "../middlewares/authorize.ts";

// Rutas de suscripciones (RF4). Se montan en /api/products desde app.ts,
// porque un usuario se suscribe A UN PRODUCTO: /api/products/:id/subscription
export function subscriptionRoutes(
  controller: SubscriptionController,
  authenticate: RequestHandler,
): Router {
  const router = Router();

  router.get("/:id/subscription", authenticate, authorize("producto:read"), controller.status);
  router.post("/:id/subscription", authenticate, authorize("subscription:create"), controller.subscribe);
  router.delete("/:id/subscription", authenticate, authorize("subscription:delete"), controller.unsubscribe);

  return router;
}
