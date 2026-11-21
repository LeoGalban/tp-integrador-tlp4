import { Role } from "./Role.ts";
import { Permission } from "./Permission.ts";
import { User } from "./User.ts";
import { Product } from "./Product.ts";
import { Subscription } from "./Subscription.ts";

// Relaciones entre tablas

// Un rol tiene muchos permisos y un permiso puede estar en muchos roles.
// Sequelize crea sola la tabla intermedia "role_permissions"
Role.belongsToMany(Permission, { through: "role_permissions", as: "permissions" });

// Cada usuario pertenece a un rol
User.belongsTo(Role, { foreignKey: "roleId", as: "role" });

// Cada suscripción une un usuario con un producto.
// CASCADE: si se borra el producto o el usuario, se borran sus suscripciones.
Subscription.belongsTo(User, { foreignKey: "userId", as: "user", onDelete: "CASCADE" });
Subscription.belongsTo(Product, { foreignKey: "productId", as: "product", onDelete: "CASCADE" });

export { Role, Permission, User, Product, Subscription };
