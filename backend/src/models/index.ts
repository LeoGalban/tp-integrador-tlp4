import { Role } from "./Role.ts";
import { Permission } from "./Permission.ts";
import { User } from "./User.ts";

// Relaciones entre tablas

// Un rol tiene muchos permisos y un permiso puede estar en muchos roles.
// Sequelize crea sola la tabla intermedia "role_permissions"
Role.belongsToMany(Permission, { through: "role_permissions", as: "permissions" });

// Cada usuario pertenece a un rol
User.belongsTo(Role, { foreignKey: "roleId", as: "role" });

export { Role, Permission, User };
