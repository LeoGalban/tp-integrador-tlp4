import { Subscription, User } from "../models/index.ts";
import type { ISubscriptionRepository, Subscriber } from "./interfaces/ISubscriptionRepository.ts";

// Implementación del repositorio de suscripciones usando Sequelize.
// Es el único lugar que toca el modelo Subscription.
export class SubscriptionRepository implements ISubscriptionRepository {
  async exists(userId: number, productId: number): Promise<boolean> {
    const count = await Subscription.count({ where: { userId, productId } });
    return count > 0;
  }

  async create(userId: number, productId: number): Promise<void> {
    await Subscription.create({ userId, productId });
  }

  async delete(userId: number, productId: number): Promise<boolean> {
    const deletedRows = await Subscription.destroy({ where: { userId, productId } });
    return deletedRows > 0;
  }

  async findSubscribersByProduct(productId: number): Promise<Subscriber[]> {
    const subscriptions = await Subscription.findAll({
      where: { productId },
      include: [{ model: User, as: "user", attributes: ["id", "email"] }],
    });
    return subscriptions.map((subscription) => ({
      userId: subscription.userId,
      email: subscription.user?.email ?? "",
    }));
  }
}
