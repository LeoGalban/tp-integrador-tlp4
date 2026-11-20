import { Sequelize } from "sequelize";
import { env } from "../config/env.ts";

// Patrón Singleton: una sola conexión a la base de datos para toda la aplicación
export class DatabaseConnection {
  // Acá se guarda la única instancia. Empieza vacía (null)
  private static instance: DatabaseConnection | null = null;

  // La conexión real de Sequelize (readonly: no se puede reemplazar)
  readonly sequelize: Sequelize;

  // Constructor privado: nadie puede hacer "new DatabaseConnection()" desde afuera
  private constructor() {
    this.sequelize = new Sequelize(env.dbName, env.dbUser, env.dbPassword, {
      host: env.dbHost,
      port: env.dbPort,
      dialect: "postgres",
      logging: false,
    });
  }

  // Única forma de obtener la conexión:
  // la primera vez la crea, y después devuelve siempre la misma
  static getInstance(): DatabaseConnection {
    if (DatabaseConnection.instance === null) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
}
