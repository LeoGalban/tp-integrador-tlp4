import type { ProductStatus } from "../../types/product.ts";
import type { Notification } from "../../notifications/Notification.ts";

// Una notificación tal como se muestra en la bandeja del usuario
export interface NotificationData {
  id: number;
  productId: number;
  productName: string;
  previousStatus: ProductStatus;
  newStatus: ProductStatus;
  message: string;
  read: boolean;
  createdAt: Date;
}

// Contrato del repositorio de notificaciones (bandeja in-app)
export interface INotificationRepository {
  create(notification: Notification): Promise<NotificationData>;
  findByUser(userId: number): Promise<NotificationData[]>;
  // Solo marca si la notificación es de ese usuario; si no, devuelve null
  markAsRead(id: number, userId: number): Promise<NotificationData | null>;
  countUnread(userId: number): Promise<number>;
}
