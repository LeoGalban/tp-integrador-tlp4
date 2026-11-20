import type { NextFunction, Request, RequestHandler, Response } from "express";
import { HttpError } from "../errors/HttpError.ts";
import type { AuthService } from "../services/AuthService.ts";

// Crea el middleware que exige estar logueado.
// Recibe el AuthService por parámetro (se arma en main.ts).
export function createAuthenticate(authService: AuthService): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    // El token llega en el header:  Authorization: Bearer <token>
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new HttpError(401, "Falta el token de autenticación");
    }

    const token = header.slice("Bearer ".length);
    // Si el token es inválido, getUserFromToken lanza un 401
    req.user = await authService.getUserFromToken(token);
    next();
  };
}
