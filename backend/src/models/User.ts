import { DataTypes, Model } from "sequelize";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from "sequelize";
import { DatabaseConnection } from "../database/DatabaseConnection.ts";
import type { Role } from "./Role.ts";

// Modelo User: representa la tabla "users"
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare password: string; // guarda el HASH de la contraseña, nunca la contraseña real
  declare roleId: number; // a qué rol pertenece el usuario
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // El rol del usuario. Solo se carga cuando se pide con "include"
  declare role?: NonAttribute<Role>;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    roleId: { type: DataTypes.INTEGER, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize: DatabaseConnection.getInstance().sequelize,
    tableName: "users",
  },
);
