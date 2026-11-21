import type { Request, Response } from "express";
import { HttpError } from "../errors/HttpError.ts";
import type { SubscriptionService } from "../services/SubscriptionService.ts";
import { parseId } from "../utils/validation.ts";

// Id del usuario logueado (lo carga el middleware authenticate)
function currentUserId(req: Request): number {
  if (!req.user) {
    throw new HttpError(401, "No autenticado");
  }
  return req.user.id;
}

// Controller de suscripciones. Las rutas son /api/products/:id/subscription
export class SubscriptionController {
  private readonly subscriptionService: SubscriptionService;

  constructor(subscriptionService: SubscriptionService) {
    this.subscriptionService = subscriptionService;
  }

  // GET: ¿el usuario logueado está suscripto a este producto?
  status = async (req: Request, res: Response) => {
    const productId = parseId(req.params.id, "id");
    const subscribed = await this.subscriptionService.isSubscribed(currentUserId(req), productId);
    res.json({ subscribed });
  };

  // POST: suscribirse
  subscribe = async (req: Request, res: Response) => {
    const productId = parseId(req.params.id, "id");
    await this.subscriptionService.subscribe(currentUserId(req), productId);
    res.status(201).json({ subscribed: true });
  };

  // DELETE: desuscribirse
  unsubscribe = async (req: Request, res: Response) => {
    const productId = parseId(req.params.id, "id");
    await this.subscriptionService.unsubscribe(currentUserId(req), productId);
    res.json({ subscribed: false });
  };
}
