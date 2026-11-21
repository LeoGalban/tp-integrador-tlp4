import { HttpError } from "../errors/HttpError.ts";
import type { IObserver } from "../observer/IObserver.ts";
import type { ProductStatusChangedEvent } from "../observer/ProductStatusChangedEvent.ts";
import type { INotifier } from "../notifications/INotifier.ts";
import type { Notification } from "../notifications/Notification.ts";
import type { NotifierFactory, NotifierType } from "../notifications/NotifierFactory.ts";
import type { ISubscriptionRepository } from "../repositories/interfaces/ISubscriptionRepository.ts";
import type {
  INotificationRepository,
  NotificationData,
} from "../repositories/interfaces/INotificationRepository.ts";

// Patrón Observer — Observer concreto.
// Se registra en el EventPublisher (desde main.ts) y, cada vez que un producto
// cambia de estado, notifica a sus suscriptores por todos los canales.
// También atiende la bandeja del usuario (listar, marcar leída, contador).
export class NotificationService implements IObserver {
  private readonly subscriptionRepository: ISubscriptionRepository;
  private readonly notificationRepository: INotificationRepository;
  // Los canales por los que se envía cada notificación.
  // Solo conoce INotifier: no sabe si es la base, la consola u otro.
  private readonly notifiers: INotifier[];

  constructor(
    subscriptionRepository: ISubscriptionRepository,
    notificationRepository: INotificationRepository,
    notifierFactory: NotifierFactory,
    channels: NotifierType[],
  ) {
    this.subscriptionRepository = subscriptionRepository;
    this.notificationRepository = notificationRepository;
    // Patrón Factory: los canales se piden a la fábrica, nunca se hace "new" acá
    this.notifiers = channels.map((channel) => notifierFactory.create(channel));
  }

  // Lo llama el EventPublisher cuando un producto cambia de estado
  async update(event: ProductStatusChangedEvent): Promise<void> {
    // ¿A quién hay que avisar? A los usuarios suscriptos a ese producto
    const subscribers = await this.subscriptionRepository.findSubscribersByProduct(event.productId);

    for (const subscriber of subscribers) {
      const notification: Notification = {
        userId: subscriber.userId,
        userEmail: subscriber.email,
        productId: event.productId,
        productName: event.productName,
        previousStatus: event.previousStatus,
        newStatus: event.newStatus,
        message: `"${event.productName}" cambió de ${event.previousStatus} a ${event.newStatus}`,
        createdAt: event.changedAt,
      };

      // Se envía por cada canal (in-app y consola)
      for (const notifier of this.notifiers) {
        await notifier.send(notification);
      }
    }
  }

  // ---- Bandeja del usuario ----

  getInbox(userId: number): Promise<NotificationData[]> {
    return this.notificationRepository.findByUser(userId);
  }

  countUnread(userId: number): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }

  async markAsRead(notificationId: number, userId: number): Promise<NotificationData> {
    const updated = await this.notificationRepository.markAsRead(notificationId, userId);
    if (!updated) {
      throw new HttpError(404, "La notificación no existe");
    }
    return updated;
  }
}
