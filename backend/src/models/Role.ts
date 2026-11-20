import { DataTypes, Model } from "sequelize";
import type {
  BelongsToManySetAssociationsMixin,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from "sequelize";
import { DatabaseConnection } from "../database/DatabaseConnection.ts";
import type { Permission } from "./Permission.ts";

// Modelo Role: representa la tabla "roles" (admin, operador, usuario)
export class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
  declare id: CreationOptional<number>; // lo genera la base (autoincremental)
  declare name: string;

  // Los permisos del rol. Solo se cargan cuando se piden con "include"
  declare permissions?: NonAttribute<Permission[]>;

  // Método que Sequelize agrega solo, para asignarle permisos al rol
  declare setPermissions: BelongsToManySetAssociationsMixin<Permission, number>;
}

Role.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  {
    sequelize: DatabaseConnection.getInstance().sequelize,
    tableName: "roles",
    timestamps: false,
  },
);
