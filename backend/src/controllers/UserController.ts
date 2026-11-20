import type { Request, Response } from "express";
import { HttpError } from "../errors/HttpError.ts";
import type { UserService } from "../services/UserService.ts";

// Convierte un valor (de la URL o del body) en un id entero positivo, o lanza un 400
function parseId(value: unknown, field: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, `El campo "${field}" debe ser un número entero positivo`);
  }
  return id;
}

// Controller de administración de usuarios: valida la entrada y responde
export class UserController {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  list = async (req: Request, res: Response) => {
    res.json(await this.userService.listUsers());
  };

  listRoles = async (req: Request, res: Response) => {
    res.json(await this.userService.listRoles());
  };

  // PATCH /api/users/:id/role   body: { "roleId": 2 }
  assignRole = async (req: Request, res: Response) => {
    const userId = parseId(req.params.id, "id");
    const body = (req.body ?? {}) as Record<string, unknown>;
    const roleId = parseId(body.roleId, "roleId");

    // req.user existe porque la ruta pasa antes por authenticate
    const currentUserId = req.user?.id ?? 0;

    const updated = await this.userService.assignRole(currentUserId, userId, roleId);
    res.json(updated);
  };
}
