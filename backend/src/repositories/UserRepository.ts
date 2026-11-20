import { User, Role, Permission } from "../models/index.ts";
import type {
  CreateUserData,
  IUserRepository,
  UserData,
  UserWithPassword,
} from "./interfaces/IUserRepository.ts";

// Implementación del repositorio de usuarios usando Sequelize.
// Es el único lugar que toca el modelo User.
export class UserRepository implements IUserRepository {
  // Al buscar un usuario, traer también su rol y los permisos de ese rol
  private readonly includeRole = {
    model: Role,
    as: "role",
    include: [{ model: Permission, as: "permissions", through: { attributes: [] } }],
  };

  async findById(id: number): Promise<UserData | null> {
    const user = await User.findByPk(id, { include: [this.includeRole] });
    return user ? this.toUserData(user) : null;
  }

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const user = await User.findOne({ where: { email }, include: [this.includeRole] });
    if (!user) {
      return null;
    }
    // Es el único método que devuelve el hash de la contraseña (lo necesita el login)
    return { ...this.toUserData(user), password: user.password };
  }

  async findAll(): Promise<UserData[]> {
    const users = await User.findAll({ include: [this.includeRole], order: [["id", "ASC"]] });
    return users.map((user) => this.toUserData(user));
  }

  async create(data: CreateUserData): Promise<UserData> {
    const user = await User.create(data);
    // Se vuelve a buscar para devolverlo con su rol y permisos
    const created = await this.findById(user.id);
    if (!created) {
      throw new Error("No se pudo recuperar el usuario recién creado");
    }
    return created;
  }

  async updateRole(userId: number, roleId: number): Promise<UserData | null> {
    const user = await User.findByPk(userId);
    if (!user) {
      return null;
    }
    user.roleId = roleId;
    await user.save();
    return this.findById(userId);
  }

  // Convierte el modelo de Sequelize en un objeto simple, SIN la contraseña
  private toUserData(user: User): UserData {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name ?? "",
      permissions: (user.role?.permissions ?? []).map((permission) => permission.name),
    };
  }
}
