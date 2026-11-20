// Error con código HTTP. Los services lo lanzan (ej: 409 "email ya registrado")
// y el middleware errorHandler lo convierte en la respuesta JSON.
// Así los services no necesitan conocer Express.
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}
