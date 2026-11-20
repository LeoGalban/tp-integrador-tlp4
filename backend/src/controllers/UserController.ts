import type { Request, Response } from "express";
import type { UserService } from "../services/UserService.ts";
import { getBody, parseId } from "../utils/validation.ts";

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
    const body = getBody(req.body);
    const roleId = parseId(body.roleId, "roleId");

    // req.user existe porque la ruta pasa antes por authenticate
    const currentUserId = req.user?.id ?? 0;

    const updated = await this.userService.assignRole(currentUserId, userId, roleId);
    res.json(updated);
  };
}
