import type { Notification } from "./Notification.ts";

// Un canal de notificación (in-app, consola, ...).
// Todos los canales cumplen este contrato, así que se pueden intercambiar.
export interface INotifier {
  send(notification: Notification): Promise<void>;
}
