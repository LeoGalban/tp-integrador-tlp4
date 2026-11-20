import dotenv from "dotenv";

// Lee el archivo .env que está en la raíz del proyecto (una carpeta arriba de backend)
dotenv.config({ path: "../.env" });

// Toda la configuración de la aplicación en un solo lugar.
// Si una variable no está en el .env, se usa el valor que está después de "??"
export const env = {
  apiPort: Number(process.env.API_PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET ?? "cambiar-esto",
  dbHost: process.env.DB_HOST ?? "localhost",
  dbPort: Number(process.env.DB_PORT ?? 5432),
  dbUser: process.env.DB_USER ?? "tlp4",
  dbPassword: process.env.DB_PASSWORD ?? "tlp4",
  dbName: process.env.DB_NAME ?? "tp_integrador",
};
