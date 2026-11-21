import type { ProductStatus } from "../types/product.ts";

// Datos del evento que se publica cuando un producto cambia de estado.
// Es lo que reciben todos los observers en update().
export interface ProductStatusChangedEvent {
  productId: number;
  productName: string;
  previousStatus: ProductStatus;
  newStatus: ProductStatus;
  changedAt: Date;
}
