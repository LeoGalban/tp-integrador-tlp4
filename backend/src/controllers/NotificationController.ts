import type { Request, Response } from "express";
import { HttpError } from "../errors/HttpError.ts";
import type { NotificationService } from "../services/NotificationService.ts";
import { parseId } from "../utils/validation.ts";

// Id del usuario logueado (lo carga el middleware authenticate)
function currentUserId(req: Request): number {
  if (!req.user) {
    throw new HttpError(401, "No autenticado");
  }
  return req.user.id;
}

// Controller de la bandeja de notificaciones del usuario logueado
export class NotificationController {
  private readonly notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  // GET /api/notifications
  list = async (req: Request, res: Response) => {
    res.json(await this.notificationService.getInbox(currentUserId(req)));
  };

  // GET /api/notifications/unread-count
  unreadCount = async (req: Request, res: Response) => {
    const count = await this.notificationService.countUnread(currentUserId(req));
    res.json({ count });
  };

  // PATCH /api/notifications/:id/read
  markAsRead = async (req: Request, res: Response) => {
    const id = parseId(req.params.id, "id");
    res.json(await this.notificationService.markAsRead(id, currentUserId(req)));
  };
}
