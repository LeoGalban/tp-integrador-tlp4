import { Role, Permission } from "../models/index.ts";
import type { IRoleRepository, RoleData } from "./interfaces/IRoleRepository.ts";

// Implementación del repositorio de roles usando Sequelize.
// Es el único lugar que toca el modelo Role.
export class RoleRepository implements IRoleRepository {
  // Al buscar un rol, traer también sus permisos (sin las columnas de la tabla intermedia)
  private readonly includePermissions = {
    model: Permission,
    as: "permissions",
    through: { attributes: [] },
  };

  async findById(id: number): Promise<RoleData | null> {
    const role = await Role.findByPk(id, { include: [this.includePermissions] });
    return role ? this.toRoleData(role) : null;
  }

  async findByName(name: string): Promise<RoleData | null> {
    const role = await Role.findOne({ where: { name }, include: [this.includePermissions] });
    return role ? this.toRoleData(role) : null;
  }

  async findAll(): Promise<RoleData[]> {
    const roles = await Role.findAll({ include: [this.includePermissions], order: [["id", "ASC"]] });
    return roles.map((role) => this.toRoleData(role));
  }

  // Convierte el modelo de Sequelize en un objeto simple
  private toRoleData(role: Role): RoleData {
    return {
      id: role.id,
      name: role.name,
      permissions: (role.permissions ?? []).map((permission) => permission.name),
    };
  }
}
