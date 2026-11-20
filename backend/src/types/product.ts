// Estados posibles de un producto (dominio D — Tienda).
// "as const" hace que TypeScript conozca los valores exactos.
export const PRODUCT_STATUSES = ["DISPONIBLE", "SIN_STOCK", "DISCONTINUADO"] as const;

// Tipo: "DISPONIBLE" | "SIN_STOCK" | "DISCONTINUADO"
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

// Dice si un valor cualquiera es un estado válido
export function isProductStatus(value: unknown): value is ProductStatus {
  return typeof value === "string" && (PRODUCT_STATUSES as readonly string[]).includes(value);
}
