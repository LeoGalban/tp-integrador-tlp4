import { HttpError } from "../errors/HttpError.ts";
import type { ISubscriptionRepository } from "../repositories/interfaces/ISubscriptionRepository.ts";
import type { IProductRepository } from "../repositories/interfaces/IProductRepository.ts";

// Lógica de negocio de las suscripciones (RF4)
export class SubscriptionService {
  private readonly subscriptionRepository: ISubscriptionRepository;
  private readonly productRepository: IProductRepository;

  constructor(subscriptionRepository: ISubscriptionRepository, productRepository: IProductRepository) {
    this.subscriptionRepository = subscriptionRepository;
    this.productRepository = productRepository;
  }

  async isSubscribed(userId: number, productId: number): Promise<boolean> {
    await this.ensureProductExists(productId);
    return this.subscriptionRepository.exists(userId, productId);
  }

  async subscribe(userId: number, productId: number): Promise<void> {
    await this.ensureProductExists(productId);
    if (await this.subscriptionRepository.exists(userId, productId)) {
      throw new HttpError(409, "Ya estás suscripto a este producto");
    }
    await this.subscriptionRepository.create(userId, productId);
  }

  async unsubscribe(userId: number, productId: number): Promise<void> {
    const deleted = await this.subscriptionRepository.delete(userId, productId);
    if (!deleted) {
      throw new HttpError(404, "No estás suscripto a este producto");
    }
  }

  private async ensureProductExists(productId: number): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new HttpError(404, "El producto no existe");
    }
  }
}
