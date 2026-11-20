import bcrypt from "bcrypt";
import { Role, Permission, User } from "../models/index.ts";

// Permisos de cada rol (tabla de la sección RF2 de la consigna)
const permissionsByRole: Record<string, string[]> = {
  admin: [
    "producto:read",
    "producto:create",
    "producto:update",
    "producto:change-status",
    "producto:delete",
    "subscription:create",
    "subscription:delete",
    "notification:read",
    "user:read",
    "user:assign-role",
  ],
  operador: [
    "producto:read",
    "producto:create",
    "producto:update",
    "producto:change-status",
    "subscription:create",
    "subscription:delete",
    "notification:read",
  ],
  usuario: [
    "producto:read",
    "subscription:create",
    "subscription:delete",
    "notification:read",
  ],
};

// Carga los datos iniciales: permisos, roles y un usuario de prueba por rol
export async function seed() {
  // Si ya hay roles cargados, el seed ya se ejecutó antes: no hacer nada
  const roleCount = await Role.count();
  if (roleCount > 0) {
    return;
  }

  // 1. Crear todos los permisos (el admin tiene todos)
  for (const name of permissionsByRole.admin) {
    await Permission.create({ name });
  }

  // 2. Crear cada rol, asignarle sus permisos y crear su usuario de prueba
  const password = await bcrypt.hash("123456", 10);

  for (const roleName of Object.keys(permissionsByRole)) {
    const role = await Role.create({ name: roleName });

    const permissions = await Permission.findAll({
      where: { name: permissionsByRole[roleName] },
    });
    await role.setPermissions(permissions);

    await User.create({
      name: roleName,
      email: `${roleName}@tp.com`,
      password: password,
      roleId: role.id,
    });
  }

  console.log("Seed ejecutado: roles, permisos y usuarios de prueba creados");
}
