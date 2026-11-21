import type { INotifier } from "./INotifier.ts";
import { InAppNotifier } from "./InAppNotifier.ts";
import { ConsoleNotifierAdapter } from "./ConsoleNotifierAdapter.ts";
import type { INotificationRepository } from "../repositories/interfaces/INotificationRepository.ts";

// Tipos de canal que sabe crear la fábrica
export type NotifierType = "inapp" | "console";

// Patrón Factory: recibe un tipo de canal y devuelve el INotifier correspondiente.
// Quien la usa (NotificationService) nunca hace "new" de un canal concreto.
export class NotifierFactory {
  private readonly notificationRepository: INotificationRepository;

  // Recibe lo que necesitan los canales para construirse
  constructor(notificationRepository: INotificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  create(type: NotifierType): INotifier {
    switch (type) {
      case "inapp":
        return new InAppNotifier(this.notificationRepository);
      case "console":
        return new ConsoleNotifierAdapter();
      default:
        throw new Error(`Tipo de canal desconocido: ${String(type)}`);
    }
  }
}
