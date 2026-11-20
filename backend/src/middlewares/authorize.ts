import type { NextFunction, Request, RequestHandler, Response } from "express";
import { HttpError } from "../errors/HttpError.ts";

// Crea un middleware que exige un permiso, ej: authorize("producto:delete").
// Siempre se usa DESPUÉS de authenticate (necesita req.user).
export function authorize(permission: string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new HttpError(401, "No autenticado");
    }
    if (!req.user.permissions.includes(permission)) {
      throw new HttpError(403, `No tenés permiso para esta acción (${permission})`);
    }
    next();
  };
}
