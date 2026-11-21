# Tienda TLP4 — TP Integrador

**Dominio:** D — Tienda (recurso: Producto)
**Base de datos:** PostgreSQL + Sequelize
**Organización del backend:** Carpeta por tipo de archivo (Forma 1)

## Integrantes
- Galban, Leonel — LeoGalban

## Descripción
Aplicación web full stack en TypeScript para gestionar los productos de una tienda. Los usuarios se registran, ven los productos y pueden suscribirse a ellos; cada vez que un producto cambia de estado (`DISPONIBLE`, `SIN_STOCK`, `DISCONTINUADO`), todos sus suscriptores reciben una notificación en su bandeja y se registra una línea en la consola del backend. El acceso a cada acción depende de los permisos del rol (admin, operador, usuario).

## Requisitos previos
- Docker y Docker Compose
- Git
- (Opcional, para desarrollo local) Node.js 24 o superior — el backend ejecuta los archivos `.ts` directamente con Node, sin compilar

## Cómo ejecutar el proyecto

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/LeoGalban/tp-integrador-tlp4.git
   cd tp-integrador-tlp4
   ```
2. Crear el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```
   (En PowerShell de Windows: `Copy-Item .env.example .env`)
3. Levantar los servicios:
   ```bash
   docker compose up --build
   ```
4. No hace falta ningún paso extra: al arrancar, el backend crea las tablas y ejecuta el **seed** automáticamente (roles, permisos y los 3 usuarios de prueba). Si ya existen, no los duplica.
5. Abrir la aplicación:
   - Frontend: http://localhost:5173
   - API: http://localhost:3000/api (prueba rápida: http://localhost:3000/api/health)

Para detener todo: `docker compose down` (los datos se conservan en el volumen `db_data`). Para borrar también los datos: `docker compose down -v`.

## Ejecución sin Docker (opcional)
Requiere Node.js 24. La base de datos igual se levanta con Docker:

```bash
cp .env.example .env              # si todavía no existe
docker compose up -d db           # solo PostgreSQL

# Terminal 1 — backend
cd backend
npm install
npm run dev                       # http://localhost:3000/api

# Terminal 2 — frontend
cd frontend
npm install
npm run dev                       # http://localhost:5173
```

Ambos proyectos leen el `.env` de la raíz del repositorio. Si los contenedores `backend` o `frontend` están corriendo, detenerlos antes (`docker compose stop backend frontend`) porque usan los mismos puertos.

Verificación de tipos: `npm run typecheck` dentro de `backend/` o de `frontend/`.

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DB_HOST` | Host de la base de datos (en Docker Compose se reemplaza por `db`) | `localhost` |
| `DB_PORT` | Puerto de la base de datos | `5432` |
| `DB_USER` | Usuario | `tlp4` |
| `DB_PASSWORD` | Contraseña | `tlp4` |
| `DB_NAME` | Nombre de la base | `tp_integrador` |
| `JWT_SECRET` | Clave para firmar los tokens | `cambiar-esto` |
| `API_PORT` | Puerto del backend | `3000` |
| `VITE_API_URL` | URL de la API para el frontend (la usa el navegador) | `http://localhost:3000/api` |

## Usuarios de prueba

| Rol | Email | Contraseña |
|---|---|---|
| admin | admin@tp.com | 123456 |
| operador | operador@tp.com | 123456 |
| usuario | usuario@tp.com | 123456 |

Todo usuario nuevo que se registra desde la app recibe el rol `usuario`. El admin puede cambiarle el rol desde **Usuarios**.

## Cómo probar el flujo de notificaciones
1. Ingresar como `usuario` (usuario@tp.com) y suscribirse a un producto desde su detalle. Si no hay productos, crear uno primero como `operador`.
2. En otra ventana (o en incógnito), ingresar como `operador` y cambiar el estado de ese producto (por ejemplo, a `SIN_STOCK`).
3. Volver a la sesión de `usuario`: en pocos segundos la campanita 🔔 muestra el contador de no leídas, y la notificación aparece en la bandeja (**Notificaciones**), donde se puede marcar como leída.
4. Verificar la notificación en la consola del backend:
   ```bash
   docker compose logs backend
   ```
   Se ve una línea como:
   ```
   [NOTIFICACIÓN] Para: usuario@tp.com | Producto #1 | Estado: DISPONIBLE → SIN_STOCK
   ```

## Endpoints principales

Todas las rutas, salvo registro y login, requieren el header `Authorization: Bearer <token>`. Sin token responden `401`; sin el permiso, `403`.

| Método | Ruta | Permiso requerido |
|---|---|---|
| POST | /api/auth/register | — |
| POST | /api/auth/login | — |
| GET | /api/auth/me | (solo sesión) |
| GET | /api/products | producto:read |
| GET | /api/products/:id | producto:read |
| POST | /api/products | producto:create |
| PUT | /api/products/:id | producto:update |
| PATCH | /api/products/:id/status | producto:change-status |
| DELETE | /api/products/:id | producto:delete |
| GET | /api/products/:id/subscription | producto:read |
| POST | /api/products/:id/subscription | subscription:create |
| DELETE | /api/products/:id/subscription | subscription:delete |
| GET | /api/notifications | notification:read |
| GET | /api/notifications/unread-count | notification:read |
| PATCH | /api/notifications/:id/read | notification:read |
| GET | /api/users | user:read |
| GET | /api/users/roles | user:read |
| PATCH | /api/users/:id/role | user:assign-role |

### Permisos por rol

| Permiso | admin | operador | usuario |
|---|:---:|:---:|:---:|
| `producto:read` | ✔ | ✔ | ✔ |
| `producto:create` | ✔ | ✔ | |
| `producto:update` | ✔ | ✔ | |
| `producto:change-status` | ✔ | ✔ | |
| `producto:delete` | ✔ | | |
| `subscription:create` | ✔ | ✔ | ✔ |
| `subscription:delete` | ✔ | ✔ | ✔ |
| `notification:read` | ✔ | ✔ | ✔ |
| `user:read` | ✔ | | |
| `user:assign-role` | ✔ | | |

## Patrones y principios SOLID
Ver [PATTERNS.md](./PATTERNS.md).
