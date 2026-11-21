import type { ProductStatusChangedEvent } from "./ProductStatusChangedEvent.ts";

// Patrón Observer — Observer: cualquier objeto que quiera enterarse
// de los cambios de estado implementa esta interfaz.
export interface IObserver {
  update(event: ProductStatusChangedEvent): Promise<void>;
}
