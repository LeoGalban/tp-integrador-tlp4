import { DataTypes, Model } from "sequelize";
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { DatabaseConnection } from "../database/DatabaseConnection.ts";
import { PRODUCT_STATUSES } from "../types/product.ts";
import type { ProductStatus } from "../types/product.ts";

// Modelo Product: el recurso principal de la aplicación (tabla "products")
export class Product extends Model<InferAttributes<Product>, InferCreationAttributes<Product>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string;
  declare price: number;
  declare status: CreationOptional<ProductStatus>; // si no se indica, arranca DISPONIBLE
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Product.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    // DECIMAL guarda el precio exacto (sin errores de redondeo).
    // El getter lo devuelve como number, porque Postgres lo entrega como texto.
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      get() {
        return Number(this.getDataValue("price"));
      },
    },
    status: {
      type: DataTypes.ENUM(...PRODUCT_STATUSES),
      allowNull: false,
      defaultValue: "DISPONIBLE",
    },
    // Sequelize completa solas estas fechas al crear y al modificar
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize: DatabaseConnection.getInstance().sequelize,
    tableName: "products",
  },
);
