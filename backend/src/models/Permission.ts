import { DataTypes, Model } from "sequelize";
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { DatabaseConnection } from "../database/DatabaseConnection.ts";

// Modelo Permission: representa la tabla "permissions" (ej: "producto:create")
export class Permission extends Model<InferAttributes<Permission>, InferCreationAttributes<Permission>> {
  declare id: CreationOptional<number>;
  declare name: string;
}

Permission.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  {
    sequelize: DatabaseConnection.getInstance().sequelize,
    tableName: "permissions",
    timestamps: false,
  },
);
