import { Router } from "express";
import type { RequestHandler } from "express";
import type { NotificationController } from "../controllers/NotificationController.ts";
import { authorize } from "../middlewares/authorize.ts";

// Rutas de la bandeja de notificaciones (RF5). Se montan en /api/notifications
export function notificationRoutes(
  controller: NotificationController,
  authenticate: RequestHandler,
): Router {
  const router = Router();

  // Todas requieren estar logueado y tener el permiso notification:read
  router.use(authenticate, authorize("notification:read"));

  router.get("/", controller.list);
  router.get("/unread-count", controller.unreadCount);
  router.patch("/:id/read", controller.markAsRead);

  return router;
}
