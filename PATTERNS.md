# Patrones de diseño y principios SOLID

Este documento indica, para cada patrón y cada principio SOLID, **dónde** está aplicado, **qué problema resuelve** en este proyecto y un **fragmento de código** que lo muestra. Todas las rutas son relativas a la raíz del repositorio.

## Flujo donde participan los cuatro patrones

Los cuatro patrones intervienen en un mismo flujo: el cambio de estado de un producto.

```
PATCH /api/products/:id/status
 └─> ProductService.changeStatus()
       └─> EventPublisher.notify(evento)                  ← Observer (Subject)
             └─> NotificationService.update(evento)       ← Observer (Observer)
                   ├─ subscriptionRepository.findSubscribersByProduct()
                   │     └─ modelos Sequelize → DatabaseConnection  ← Singleton
                   └─ canales creados con NotifierFactory          ← Factory
                         ├─ InAppNotifier         → guarda en la tabla notifications
                         └─ ConsoleNotifierAdapter → console.log   ← Adapter
```

Todos los objetos se crean y se conectan en un único lugar: `backend/src/main.ts` (*composition root*).

---

# Patrones de diseño

## Singleton — `DatabaseConnection`

**Archivos:**
- `backend/src/database/DatabaseConnection.ts`: la clase Singleton.
- `backend/src/models/*.ts` y `backend/src/main.ts`: la usan con `getInstance()`.

**Problema que resuelve:** toda la aplicación tiene que usar **una sola** conexión a PostgreSQL. Si cada modelo o repositorio creara su propia instancia de `Sequelize`, se abrirían varios pools de conexiones, y los modelos quedarían registrados en instancias distintas, sin poder relacionarse entre sí. Con el constructor privado es imposible hacer `new DatabaseConnection()` desde afuera: la única forma de obtenerla es `getInstance()`, que siempre devuelve la misma.

```ts
export class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;
  readonly sequelize: Sequelize;

  private constructor() {
    this.sequelize = new Sequelize(env.dbName, env.dbUser, env.dbPassword, {
      host: env.dbHost,
      port: env.dbPort,
      dialect: "postgres",
      logging: false,
    });
  }

  static getInstance(): DatabaseConnection {
    if (DatabaseConnection.instance === null) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
}
```

Uso, por ejemplo en `backend/src/models/Product.ts`:
```ts
sequelize: DatabaseConnection.getInstance().sequelize,
```

---

## Observer — `ISubject`, `IObserver`, `EventPublisher`, `NotificationService`

**Archivos:**
- `backend/src/observer/ISubject.ts`: interfaz del Subject (`attach`, `detach`, `notify`).
- `backend/src/observer/IObserver.ts`: interfaz del Observer (`update`).
- `backend/src/observer/ProductStatusChangedEvent.ts`: datos del evento.
- `backend/src/observer/EventPublisher.ts`: Subject concreto, con implementación propia y sin `EventEmitter`.
- `backend/src/services/NotificationService.ts`: Observer concreto.
- `backend/src/services/ProductService.ts`: publica el evento en `changeStatus()`.
- `backend/src/main.ts`: registra el observer con `attach`.

**Problema que resuelve:** cuando un producto cambia de estado hay que hacer cosas que no son responsabilidad de `ProductService`: avisar a los suscriptores por varios canales. Con Observer, `ProductService` solo publica "cambió el estado" y no sabe quién escucha. Así se pueden agregar o quitar reacciones al evento sin modificar el servicio de productos.

> **Observers no son lo mismo que suscripciones.** Los *observers* son objetos del backend que reaccionan al evento (hoy, `NotificationService`). Las *suscripciones* son datos guardados en la tabla `subscriptions` que dicen qué usuario sigue qué producto. El observer consulta las suscripciones para saber a quién notificar.

`EventPublisher` (Subject):
```ts
export class EventPublisher implements ISubject {
  private readonly observers: IObserver[] = [];

  attach(observer: IObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  detach(observer: IObserver): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  async notify(event: ProductStatusChangedEvent): Promise<void> {
    for (const observer of this.observers) {
      try {
        await observer.update(event);
      } catch (error) {
        console.error("Error en un observer al procesar el evento:", error);
      }
    }
  }
}
```

`ProductService` recibe el Subject por constructor y lo invoca al cambiar el estado:
```ts
await this.eventPublisher.notify({
  productId: updated.id,
  productName: updated.name,
  previousStatus,
  newStatus: updated.status,
  changedAt: updated.updatedAt,
});
```

Registro del observer en `main.ts`:
```ts
const eventPublisher = new EventPublisher();
eventPublisher.attach(notificationService); // registrar el observer
const productService = new ProductService(productRepository, eventPublisher);
```

---

## Factory — `NotifierFactory`

**Archivos:**
- `backend/src/notifications/INotifier.ts`: interfaz común de los canales.
- `backend/src/notifications/NotifierFactory.ts`: la fábrica.
- `backend/src/notifications/InAppNotifier.ts` y `ConsoleNotifierAdapter.ts`: los productos que crea.
- `backend/src/services/NotificationService.ts`: el cliente que la usa.

**Problema que resuelve:** `NotificationService` necesita enviar por varios canales, pero no debe depender de las clases concretas ni de cómo se construye cada una. Por ejemplo, `InAppNotifier` necesita un repositorio y el de consola no necesita nada. La fábrica recibe el tipo de canal (`'inapp' | 'console'`) y devuelve un `INotifier` listo para usar. Así, la creación de canales está en un único lugar y el servicio nunca hace `new` de un canal.

```ts
export type NotifierType = "inapp" | "console";

export class NotifierFactory {
  private readonly notificationRepository: INotificationRepository;

  constructor(notificationRepository: INotificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  create(type: NotifierType): INotifier {
    switch (type) {
      case "inapp":
        return new InAppNotifier(this.notificationRepository);
      case "console":
        return new ConsoleNotifierAdapter();
      default:
        throw new Error(`Tipo de canal desconocido: ${String(type)}`);
    }
  }
}
```

Uso en `NotificationService` (constructor):
```ts
this.notifiers = channels.map((channel) => notifierFactory.create(channel));
```

---

## Adapter — `ConsoleNotifierAdapter`

**Archivos:**
- `backend/src/notifications/ConsoleNotifierAdapter.ts`: el adapter.
- `backend/src/notifications/INotifier.ts`: la interfaz que la aplicación espera (*target*).

**Problema que resuelve:** la aplicación espera que todo canal cumpla `INotifier`, es decir, que reciba un objeto `Notification` y devuelva una `Promise<void>`. `console.log`, en cambio, recibe **texto** y no devuelve nada. Las dos interfaces son incompatibles. El adapter implementa `INotifier`, transforma el objeto en una línea legible y delega en `console.log`. Gracias a eso, `NotificationService` nunca llama a `console.log`: trata a la consola como un canal más.

```ts
export class ConsoleNotifierAdapter implements INotifier {
  async send(notification: Notification): Promise<void> {
    // 1. Adaptar: el objeto Notification se transforma en una línea de texto
    const text = this.format(notification);
    // 2. Delegar en la "interfaz incompatible": console.log
    console.log(text);
  }

  private format(notification: Notification): string {
    return (
      `[NOTIFICACIÓN] Para: ${notification.userEmail}` +
      ` | Producto #${notification.productId}` +
      ` | Estado: ${notification.previousStatus} → ${notification.newStatus}`
    );
  }
}
```

Salida en `docker compose logs backend`:
```
[NOTIFICACIÓN] Para: usuario@tp.com | Producto #1 | Estado: DISPONIBLE → SIN_STOCK
```

---

# Principios SOLID

## S — Responsabilidad única

**Archivos:** la separación en capas del backend.
- `backend/src/routes/product.routes.ts`: qué URL y qué permiso.
- `backend/src/controllers/ProductController.ts`: validar la entrada y armar la respuesta HTTP.
- `backend/src/services/ProductService.ts`: reglas de negocio.
- `backend/src/repositories/ProductRepository.ts`: acceso a la base.
- Middlewares de una sola tarea: `authenticate.ts` (quién sos), `authorize.ts` (qué podés hacer) y `errorHandler.ts` (convertir errores en respuestas).

**Problema que resuelve:** cada clase tiene **un solo motivo para cambiar**. Si cambia la base de datos, solo se toca el repositorio. Si cambia una regla de negocio, solo el service. Si cambia el formato de la API, solo el controller. Eso hace que el código sea fácil de ubicar, de explicar y de modificar sin romper otras partes.

```ts
// Controller: solo valida y responde (no tiene lógica de negocio)
changeStatus = async (req: Request, res: Response) => {
  const id = parseId(req.params.id, "id");
  const { status } = getBody(req.body);
  if (!isProductStatus(status)) {
    throw new HttpError(400, `El estado debe ser uno de: ${PRODUCT_STATUSES.join(", ")}`);
  }
  res.json(await this.productService.changeStatus(id, status));
};
```
```ts
// Service: solo reglas de negocio (no conoce Express ni Sequelize)
if (previousStatus === newStatus) {
  throw new HttpError(400, `El producto ya está en estado ${newStatus}`);
}
```

## O — Abierto/cerrado

**Archivos:**
- `backend/src/services/NotificationService.ts`: cerrado a modificaciones.
- `backend/src/notifications/NotifierFactory.ts` y `backend/src/main.ts`: puntos de extensión.
- `backend/src/middlewares/authorize.ts`: sirve para cualquier permiso nuevo sin cambios.

**Problema que resuelve:** para agregar un canal de notificación nuevo (por ejemplo, email) **no se modifica `NotificationService`**. Se crea una clase que implemente `INotifier`, se agrega un `case` en la fábrica y el nombre del canal en `main.ts`. El servicio está *cerrado* a modificaciones y la aplicación está *abierta* a extensiones. Lo mismo pasa con los permisos: un permiso nuevo se agrega en el seed y se usa con `authorize("nuevo:permiso")`, sin tocar el middleware.

```ts
// NotificationService recorre los canales sin saber cuáles son:
for (const notifier of this.notifiers) {
  await notifier.send(notification);
}
```
```ts
// main.ts: agregar un canal = agregar su nombre a esta lista (y su case en la fábrica)
const notificationService = new NotificationService(
  subscriptionRepository,
  notificationRepository,
  notifierFactory,
  ["inapp", "console"], // canales por los que se notifica
);
```

## L — Sustitución de Liskov

**Archivos:**
- `backend/src/notifications/InAppNotifier.ts` y `backend/src/notifications/ConsoleNotifierAdapter.ts`: implementaciones intercambiables de `INotifier`.
- `backend/src/repositories/*Repository.ts`: implementaciones de sus interfaces.

**Problema que resuelve:** cualquier `INotifier` puede reemplazar a otro sin que `NotificationService` lo note ni se rompa. Los dos canales reciben el mismo `Notification`, devuelven `Promise<void>` y no exigen nada extra a quien los llama. Por eso el servicio los trata a todos igual dentro del mismo `for`. Lo mismo vale para los repositorios: cualquier clase que cumpla `IProductRepository` (por ejemplo, una en memoria para pruebas) puede reemplazar a la de Sequelize.

```ts
// (fragmentos resumidos de los tres archivos)
export interface INotifier {
  send(notification: Notification): Promise<void>;
}

export class InAppNotifier implements INotifier {
  async send(notification: Notification): Promise<void> {
    await this.notificationRepository.create(notification);
  }
}

export class ConsoleNotifierAdapter implements INotifier {
  async send(notification: Notification): Promise<void> {
    console.log(this.format(notification));
  }
}
```

## I — Segregación de interfaces

**Archivos:** `backend/src/repositories/interfaces/`
- `IUserRepository.ts`
- `IRoleRepository.ts`
- `IProductRepository.ts`
- `ISubscriptionRepository.ts`
- `INotificationRepository.ts`

También `backend/src/observer/IObserver.ts`, que tiene un solo método.

**Problema que resuelve:** en lugar de un único "repositorio genérico" enorme, cada entidad tiene una interfaz chica y específica con solo los métodos que se usan. Por ejemplo, `IRoleRepository` tiene 3 métodos de lectura porque los roles no se editan (no se pide ABM de roles). Ninguna clase está obligada a implementar métodos que no necesita, y cada service depende solo de lo que realmente usa.

```ts
export interface IRoleRepository {
  findById(id: number): Promise<RoleData | null>;
  findByName(name: string): Promise<RoleData | null>;
  findAll(): Promise<RoleData[]>;
}

export interface IObserver {
  update(event: ProductStatusChangedEvent): Promise<void>;
}
```

## D — Inversión de dependencias

**Archivos:**
- Los services de `backend/src/services/` dependen de interfaces, que reciben por constructor.
- `backend/src/main.ts` crea las implementaciones concretas y las inyecta (*composition root*).

**Problema que resuelve:** los services (la lógica de alto nivel) no dependen de Sequelize ni de clases concretas (los detalles de bajo nivel), sino de **abstracciones**: `IProductRepository`, `ISubject`, `INotifier`. Las implementaciones se crean en un solo lugar, `main.ts`, y se pasan por constructor. Así se puede cambiar la base de datos o el mecanismo de eventos sin tocar la lógica de negocio. No se usa ningún contenedor de inyección de dependencias: se conecta todo a mano.

```ts
// ProductService depende de interfaces, no de clases concretas
export class ProductService {
  private readonly productRepository: IProductRepository;
  private readonly eventPublisher: ISubject;

  constructor(productRepository: IProductRepository, eventPublisher: ISubject) {
    this.productRepository = productRepository;
    this.eventPublisher = eventPublisher;
  }
}
```
```ts
// main.ts (composition root): acá se eligen las implementaciones
const productRepository = new ProductRepository();
const eventPublisher = new EventPublisher();
const productService = new ProductService(productRepository, eventPublisher);
```

---

## Guía rápida para modificaciones en vivo

**Agregar un canal de notificación nuevo** (por ejemplo, `"email"`):
1. Crear `backend/src/notifications/EmailNotifier.ts` con `class EmailNotifier implements INotifier { async send(n) { ... } }`.
2. En `NotifierFactory.ts`: agregar `"email"` al tipo `NotifierType` y un `case "email": return new EmailNotifier();`.
3. En `main.ts`: agregar `"email"` a la lista de canales: `["inapp", "console", "email"]`.

`NotificationService` no se modifica.

**Agregar un permiso nuevo** (por ejemplo, `producto:export`):
1. En `backend/src/database/seed.ts`: agregarlo a la lista de los roles que corresponda. El seed solo corre con la base vacía, así que hay que volver a crearla con `docker compose down -v` y `docker compose up --build`.
2. En la ruta: `router.get("/export", authorize("producto:export"), controller.export);`.
3. En el frontend, si hace falta: `<Can permission="producto:export">…</Can>`.
