import type { Request, Response } from "express";
import { HttpError } from "../errors/HttpError.ts";
import type { AuthService } from "../services/AuthService.ts";
import { getBody, requireString } from "../utils/validation.ts";

// Controller: recibe la request, valida la entrada y devuelve la respuesta.
// No tiene lógica de negocio: eso lo hace AuthService.
export class AuthController {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  // Se definen como arrow functions para que "this" funcione al pasarlas a las rutas
  register = async (req: Request, res: Response) => {
    const body = getBody(req.body);
    const name = requireString(body, "name");
    const email = requireString(body, "email");
    const password = requireString(body, "password");

    if (!email.includes("@")) {
      throw new HttpError(400, "El email no es válido");
    }
    if (password.length < 6) {
      throw new HttpError(400, "La contraseña debe tener al menos 6 caracteres");
    }

    const result = await this.authService.register({ name, email, password });
    res.status(201).json(result);
  };

  login = async (req: Request, res: Response) => {
    const body = getBody(req.body);
    const email = requireString(body, "email");
    const password = requireString(body, "password");

    const result = await this.authService.login({ email, password });
    res.json(result);
  };

  // Devuelve el usuario logueado (lo cargó el middleware authenticate)
  me = async (req: Request, res: Response) => {
    res.json(req.user);
  };
}
