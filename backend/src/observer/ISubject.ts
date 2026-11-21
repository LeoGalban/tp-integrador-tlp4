import type { IObserver } from "./IObserver.ts";
import type { ProductStatusChangedEvent } from "./ProductStatusChangedEvent.ts";

// Patrón Observer — Subject: el objeto observado.
// Mantiene una lista de observers y les avisa cuando ocurre un evento.
export interface ISubject {
  attach(observer: IObserver): void; // agregar un observer a la lista
  detach(observer: IObserver): void; // quitarlo de la lista
  notify(event: ProductStatusChangedEvent): Promise<void>; // avisarles a todos
}
