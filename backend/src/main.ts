import { env } from "./config/env.ts";
import { DatabaseConnection } from "./database/DatabaseConnection.ts";
import { createApp } from "./app.ts";
// Importar los modelos los registra en Sequelize (y define sus relaciones)
import "./models/index.ts";

// Composition root: acá se crean todos los objetos de la aplicación y se conectan entre sí
async function main() {
  // 1. Conectarse a la base de datos (usando el Singleton)
  const db = DatabaseConnection.getInstance();
  await db.sequelize.authenticate();
  console.log("Conectado a PostgreSQL");

  // Crea las tablas que falten a partir de los modelos
  await db.sequelize.sync();

  // 2. Crear el servidor y ponerlo a escuchar
  const app = createApp();
  app.listen(env.apiPort, () => {
    console.log(`API escuchando en http://localhost:${env.apiPort}/api`);
  });
}

main();
