import { NotificationModel } from "../models/index.ts";
import type { Notification } from "../notifications/Notification.ts";
import type {
  INotificationRepository,
  NotificationData,
} from "./interfaces/INotificationRepository.ts";

// Implementación del repositorio de notificaciones usando Sequelize.
// Es el único lugar que toca el modelo NotificationModel.
export class NotificationRepository implements INotificationRepository {
  async create(notification: Notification): Promise<NotificationData> {
    const record = await NotificationModel.create({
      userId: notification.userId,
      productId: notification.productId,
      productName: notification.productName,
      previousStatus: notification.previousStatus,
      newStatus: notification.newStatus,
      message: notification.message,
      createdAt: notification.createdAt,
    });
    return this.toNotificationData(record);
  }

  async findByUser(userId: number): Promise<NotificationData[]> {
    const records = await NotificationModel.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]], // las más nuevas primero
    });
    return records.map((record) => this.toNotificationData(record));
  }

  async markAsRead(id: number, userId: number): Promise<NotificationData | null> {
    // Se busca por id Y por usuario: nadie puede marcar notificaciones ajenas
    const record = await NotificationModel.findOne({ where: { id, userId } });
    if (!record) {
      return null;
    }
    await record.update({ read: true });
    return this.toNotificationData(record);
  }

  countUnread(userId: number): Promise<number> {
    return NotificationModel.count({ where: { userId, read: false } });
  }

  // Convierte el modelo de Sequelize en un objeto simple
  private toNotificationData(record: NotificationModel): NotificationData {
    return {
      id: record.id,
      productId: record.productId,
      productName: record.productName,
      previousStatus: record.previousStatus,
      newStatus: record.newStatus,
      message: record.message,
      read: record.read,
      createdAt: record.createdAt,
    };
  }
}
