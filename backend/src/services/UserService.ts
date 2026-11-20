import { HttpError } from "../errors/HttpError.ts";
import type { IUserRepository, UserData } from "../repositories/interfaces/IUserRepository.ts";
import type { IRoleRepository, RoleData } from "../repositories/interfaces/IRoleRepository.ts";

// Lógica de negocio de la administración de usuarios (RF6).
// No conoce Express ni Sequelize: solo las interfaces de los repositorios.
export class UserService {
  private readonly userRepository: IUserRepository;
  private readonly roleRepository: IRoleRepository;

  constructor(userRepository: IUserRepository, roleRepository: IRoleRepository) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
  }

  listUsers(): Promise<UserData[]> {
    return this.userRepository.findAll();
  }

  listRoles(): Promise<RoleData[]> {
    return this.roleRepository.findAll();
  }

  // Asigna un rol a un usuario. currentUserId es el admin que hace el cambio.
  async assignRole(currentUserId: number, userId: number, roleId: number): Promise<UserData> {
    // Evita que el admin se saque su propio rol y quede sin acceso a la administración
    if (currentUserId === userId) {
      throw new HttpError(400, "No podés cambiar tu propio rol");
    }

    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new HttpError(404, "El rol no existe");
    }

    const updated = await this.userRepository.updateRole(userId, roleId);
    if (!updated) {
      throw new HttpError(404, "El usuario no existe");
    }
    return updated;
  }
}
