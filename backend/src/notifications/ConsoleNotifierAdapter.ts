import type { INotifier } from "./INotifier.ts";
import type { Notification } from "./Notification.ts";

// Patrón Adapter.
// La aplicación espera que todo canal cumpla INotifier: recibe un objeto
// Notification y devuelve una Promise. console.log, en cambio, recibe TEXTO
// y no devuelve nada. Este adapter hace de intermediario entre las dos formas.
export class ConsoleNotifierAdapter implements INotifier {
  async send(notification: Notification): Promise<void> {
    // 1. Adaptar: el objeto Notification se transforma en una línea de texto
    const text = this.format(notification);
    // 2. Delegar en la "interfaz incompatible": console.log
    console.log(text);
  }

  // Ej: [NOTIFICACIÓN] Para: usuario@tp.com | Producto #12 | Estado: DISPONIBLE → SIN_STOCK
  private format(notification: Notification): string {
    return (
      `[NOTIFICACIÓN] Para: ${notification.userEmail}` +
      ` | Producto #${notification.productId}` +
      ` | Estado: ${notification.previousStatus} → ${notification.newStatus}`
    );
  }
}
