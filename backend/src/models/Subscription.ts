import { DataTypes, Model } from "sequelize";
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from "sequelize";
import { DatabaseConnection } from "../database/DatabaseConnection.ts";
import type { User } from "./User.ts";

// Modelo Subscription: indica que un usuario SIGUE a un producto (tabla "subscriptions").
// Es un dato guardado en la base; no confundir con los observers del patrón Observer.
export class Subscription extends Model<
  InferAttributes<Subscription>,
  InferCreationAttributes<Subscription>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare productId: number;
  declare createdAt: CreationOptional<Date>;

  // El usuario suscripto. Solo se carga cuando se pide con "include"
  declare user?: NonAttribute<User>;
}

Subscription.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize: DatabaseConnection.getInstance().sequelize,
    tableName: "subscriptions",
    updatedAt: false, // una suscripción no se modifica: se crea o se borra
    // Un usuario no puede suscribirse dos veces al mismo producto
    indexes: [{ unique: true, fields: ["userId", "productId"] }],
  },
);
