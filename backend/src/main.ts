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
import { SubscriptionRepository } from "./repositories/SubscriptionRepository.ts";
import { SubscriptionService } from "./services/SubscriptionService.ts";
import { SubscriptionController } from "./controllers/SubscriptionController.ts";
import { subscriptionRoutes } from "./routes/subscription.routes.ts";
import { EventPublisher } from "./observer/EventPublisher.ts";
import { NotificationRepository } from "./repositories/NotificationRepository.ts";
import { NotifierFactory } from "./notifications/NotifierFactory.ts";
import { NotificationService } from "./services/NotificationService.ts";
import { NotificationController } from "./controllers/NotificationController.ts";
import { notificationRoutes } from "./routes/notification.routes.ts";

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
  const subscriptionRepository = new SubscriptionRepository();
  const notificationRepository = new NotificationRepository();

  // 3. Services: reciben los repositorios por constructor (inyección de dependencias)
  const authService = new AuthService(userRepository, roleRepository, env.jwtSecret);
  const userService = new UserService(userRepository, roleRepository);
  const subscriptionService = new SubscriptionService(subscriptionRepository, productRepository);

  // Notificaciones: los 4 patrones participan del cambio de estado
  //   ProductService.changeStatus() → EventPublisher.notify()   (Observer - Subject)
  //   → NotificationService.update()                            (Observer - Observer)
  //   → canales creados por NotifierFactory                     (Factory)
  //   → "console" es el ConsoleNotifierAdapter                  (Adapter)
  const notifierFactory = new NotifierFactory(notificationRepository);
  const notificationService = new NotificationService(
    subscriptionRepository,
    notificationRepository,
    notifierFactory,
    ["inapp", "console"], // canales por los que se notifica
  );
  const eventPublisher = new EventPublisher();
  eventPublisher.attach(notificationService); // registrar el observer
  const productService = new ProductService(productRepository, eventPublisher);

  // 4. Middleware de autenticación (usa el AuthService para validar el token)
  const authenticate = createAuthenticate(authService);

  // 5. Controllers: reciben los services
  const authController = new AuthController(authService);
  const userController = new UserController(userService);
  const productController = new ProductController(productService);
  const subscriptionController = new SubscriptionController(subscriptionService);
  const notificationController = new NotificationController(notificationService);

  // 6. Crear el servidor con sus rutas y ponerlo a escuchar
  const app = createApp({
    authRouter: authRoutes(authController, authenticate),
    userRouter: userRoutes(userController, authenticate),
    productRouter: productRoutes(productController, authenticate),
    subscriptionRouter: subscriptionRoutes(subscriptionController, authenticate),
    notificationRouter: notificationRoutes(notificationController, authenticate),
  });
  app.listen(env.apiPort, () => {
    console.log(`API escuchando en http://localhost:${env.apiPort}/api`);
  });
}

main();
