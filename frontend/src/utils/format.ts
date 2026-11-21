// Formatea un número como precio en pesos: 8999.5 → "$ 8.999,50"
export function formatPrice(price: number): string {
  return price.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

// Formatea una fecha ISO (como llega del backend) en formato local
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-AR");
}
