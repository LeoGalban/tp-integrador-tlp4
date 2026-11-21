import type { ISubject } from "./ISubject.ts";
import type { IObserver } from "./IObserver.ts";
import type { ProductStatusChangedEvent } from "./ProductStatusChangedEvent.ts";

// Patrón Observer — Subject concreto (implementación propia, sin EventEmitter de Node).
// ProductService lo usa para publicar los cambios de estado, sin saber quién escucha.
export class EventPublisher implements ISubject {
  // Lista de observers registrados (se cargan desde main.ts)
  private readonly observers: IObserver[] = [];

  attach(observer: IObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  detach(observer: IObserver): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  // Avisa a cada observer, uno por uno.
  // Si uno falla, se registra el error y se sigue con los demás:
  // el cambio de estado ya se guardó y no debe deshacerse por una notificación.
  async notify(event: ProductStatusChangedEvent): Promise<void> {
    for (const observer of this.observers) {
      try {
        await observer.update(event);
      } catch (error) {
        console.error("Error en un observer al procesar el evento:", error);
      }
    }
  }
}
