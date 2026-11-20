import { env } from "./config/env.ts";
import { DatabaseConnection } from "./database/DatabaseConnection.ts";
import { seed } from "./database/seed.ts";
import { createApp } from "./app.ts";
// Importar los modelos los registra en Sequelize (y define sus relaciones)
import "./models/index.ts";
import { UserRepository } from "./repositories/UserRepository.ts";
import { RoleRepository } from "./repositories/RoleRepository.ts";
import { AuthService } from "./services/AuthService.ts";
import { AuthController } from "./controllers/AuthController.ts";
import { authRoutes } from "./routes/auth.routes.ts";
import { createAuthenticate } from "./middlewares/authenticate.ts";
import { UserService } from "./services/UserService.ts";
import { UserController } from "./controllers/UserController.ts";
import { userRoutes } from "./routes/user.routes.ts";
import { ProductRepository } from "./repositories/ProductRepository.ts";
import { ProductService } from "./services/ProductService.ts";
import { ProductController } from "./controllers/ProductController.ts";
import { productRoutes } from "./routes/product.routes.ts";

// Composition root: acá se crean todos los objetos de la aplicación y se conectan entre sí
async function main() {
  // 1. Conectarse a la base de datos (usando el Singleton)
  const db = DatabaseConnection.getInstance();
  await db.sequelize.authenticate();
  console.log("Conectado a PostgreSQL");

  // Crea las tablas que falten a partir de los modelos, y carga los datos iniciales
  await db.sequelize.sync();
  await seed();

  // 2. Repositorios (único acceso a la base)
  const userRepository = new UserRepository();
  const roleRepository = new RoleRepository();
  const productRepository = new ProductRepository();

  // 3. Services: reciben los repositorios por constructor (inyección de dependencias)
  const authService = new AuthService(userRepository, roleRepository, env.jwtSecret);
  const userService = new UserService(userRepository, roleRepository);
  const productService = new ProductService(productRepository);

  // 4. Middleware de autenticación (usa el AuthService para validar el token)
  const authenticate = createAuthenticate(authService);

  // 5. Controllers: reciben los services
  const authController = new AuthController(authService);
  const userController = new UserController(userService);
  const productController = new ProductController(productService);

  // 6. Crear el servidor con sus rutas y ponerlo a escuchar
  const app = createApp({
    authRouter: authRoutes(authController, authenticate),
    userRouter: userRoutes(userController, authenticate),
    productRouter: productRoutes(productController, authenticate),
  });
  app.listen(env.apiPort, () => {
    console.log(`API escuchando en http://localhost:${env.apiPort}/api`);
  });
}

main();
