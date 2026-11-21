import type { INotifier } from "./INotifier.ts";
import type { Notification } from "./Notification.ts";
import type { INotificationRepository } from "../repositories/interfaces/INotificationRepository.ts";

// Canal in-app: guarda la notificación en la base de datos (bandeja del usuario).
// Arranca como "no leída".
export class InAppNotifier implements INotifier {
  private readonly notificationRepository: INotificationRepository;

  constructor(notificationRepository: INotificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async send(notification: Notification): Promise<void> {
    await this.notificationRepository.create(notification);
  }
}
