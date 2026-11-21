// Un usuario suscripto a un producto (lo que necesita saber quien notifica)
export interface Subscriber {
  userId: number;
  email: string;
}

// Contrato del repositorio de suscripciones
export interface ISubscriptionRepository {
  exists(userId: number, productId: number): Promise<boolean>;
  create(userId: number, productId: number): Promise<void>;
  // Devuelve true si había una suscripción y se borró
  delete(userId: number, productId: number): Promise<boolean>;
  // Todos los suscriptores de un producto (lo usa el NotificationService)
  findSubscribersByProduct(productId: number): Promise<Subscriber[]>;
}
