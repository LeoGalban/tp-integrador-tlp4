import { HttpError } from "../errors/HttpError.ts";

// Funciones de validación de entrada que comparten los controllers.
// Si el dato no es válido, lanzan un HttpError 400.

// Devuelve el body de la request como objeto (o un objeto vacío si no vino nada)
export function getBody(body: unknown): Record<string, unknown> {
  if (typeof body === "object" && body !== null) {
    return body as Record<string, unknown>;
  }
  return {};
}

// Exige un string no vacío
export function requireString(body: Record<string, unknown>, field: string): string {
  const value = body[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(400, `El campo "${field}" es obligatorio`);
  }
  return value.trim();
}

// String opcional: si no viene devuelve undefined; si viene, debe ser string
export function optionalString(body: Record<string, unknown>, field: string): string | undefined {
  const value = body[field];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new HttpError(400, `El campo "${field}" debe ser texto`);
  }
  return value.trim();
}

// Número opcional mayor o igual a 0 (ej: precio)
export function optionalNonNegativeNumber(
  body: Record<string, unknown>,
  field: string,
): number | undefined {
  const value = body[field];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new HttpError(400, `El campo "${field}" debe ser un número mayor o igual a 0`);
  }
  return value;
}

// Convierte un valor (de la URL o del body) en un id entero positivo
export function parseId(value: unknown, field: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, `El campo "${field}" debe ser un número entero positivo`);
  }
  return id;
}
