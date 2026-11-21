import { DataTypes, Model } from "sequelize";
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { DatabaseConnection } from "../database/DatabaseConnection.ts";
import { PRODUCT_STATUSES } from "../types/product.ts";
import type { ProductStatus } from "../types/product.ts";

// Modelo de la tabla "notifications": la bandeja in-app de cada usuario.
// Se llama NotificationModel para no confundirlo con el objeto Notification
// que reciben los canales (notifications/Notification.ts).
export class NotificationModel extends Model<
  InferAttributes<NotificationModel>,
  InferCreationAttributes<NotificationModel>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  // Se guardan id y nombre del producto (sin clave foránea) para que la
  // notificación siga en la bandeja aunque el producto se borre después
  declare productId: number;
  declare productName: string;
  declare previousStatus: ProductStatus;
  declare newStatus: ProductStatus;
  declare message: string;
  declare read: CreationOptional<boolean>; // leída / no leída
  declare createdAt: CreationOptional<Date>;
}

NotificationModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    productName: { type: DataTypes.STRING, allowNull: false },
    previousStatus: { type: DataTypes.ENUM(...PRODUCT_STATUSES), allowNull: false },
    newStatus: { type: DataTypes.ENUM(...PRODUCT_STATUSES), allowNull: false },
    message: { type: DataTypes.STRING, allowNull: false },
    read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize: DatabaseConnection.getInstance().sequelize,
    tableName: "notifications",
    updatedAt: false,
  },
);
