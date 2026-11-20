import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/HttpError.ts";

// Middleware de errores: Express lo reconoce porque recibe 4 parámetros.
// Todos los errores (lanzados en controllers o services) terminan acá.
export function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
  // Errores "esperados" que lanzamos nosotros (400, 401, 403, 404, 409...)
  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message });
    return;
  }

  // JSON mal formado en el body de la request
  if (error instanceof SyntaxError) {
    res.status(400).json({ message: "El cuerpo de la petición no es un JSON válido" });
    return;
  }

  // Cualquier otro error es un problema nuestro: se registra y se responde 500
  console.error(error);
  res.status(500).json({ message: "Error interno del servidor" });
}
