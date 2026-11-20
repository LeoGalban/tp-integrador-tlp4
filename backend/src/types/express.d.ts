import type { UserData } from "../repositories/interfaces/IUserRepository.ts";

// Le agrega a la Request de Express el campo "user".
// Lo completa el middleware authenticate con el usuario logueado.
declare global {
  namespace Express {
    interface Request {
      user?: UserData;
    }
  }
}

export {};
