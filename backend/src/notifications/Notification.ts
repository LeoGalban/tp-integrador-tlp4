import type { ProductStatus } from "../types/product.ts";

// Una notificación para UN usuario sobre UN cambio de estado.
// Es el objeto que reciben todos los canales (INotifier.send).
export interface Notification {
  userId: number;
  userEmail: string;
  productId: number;
  productName: string;
  previousStatus: ProductStatus;
  newStatus: ProductStatus;
  message: string; // texto legible, ej: "Mouse cambió de DISPONIBLE a SIN_STOCK"
  createdAt: Date;
}
