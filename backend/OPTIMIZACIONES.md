# Optimizaciones aplicadas al backend de Perrubi

Este documento resume la revisión y optimización del código del backend (Express + Prisma):
bugs corregidos, código eliminado, endpoints agregados, y una lista de cosas marcadas como
innecesarias o pendientes a nivel de estructura de proyecto (sin tocar).

El frontend (`frontend/`) **no fue modificado** — es la plantilla de arranque de Expo intacta,
ver la sección correspondiente más abajo.

## Resumen

- **6 bugs bloqueantes** corregidos (impedían registrarse/loguearse como paseador, rompían
  el cálculo de rutas con paradas intermedias, o impedían levantar el servidor).
- **3 problemas de seguridad** corregidos (contraseñas hasheadas expuestas en respuestas y logs,
  falta de chequeo de propiedad sobre los perros, colisión de identidad entre `User` y `Walker`).
- **~15 bloques de `try/catch` repetidos** eliminados via un `asyncHandler` + middleware de error central.
- **2 dominios nuevos** construidos por completo: `walks` (pedir/aceptar/seguir un paseo) y `addresses`.
- **1 cambio de schema**: `Walk.walkerId` pasa a ser opcional (con su migración).

---

## 1. Bugs corregidos

| Archivo | Qué estaba roto | Síntoma | Corrección |
|---|---|---|---|
| `src/controllers/auth.controller.js` | `walkerRegister` validaba `walker.name`, campo que no existe en el modelo `Walker` (tiene `firstName`/`lastName`) | **Todo registro de paseador devolvía 400**, siempre | Validar `walker.firstName` |
| `src/controllers/auth.controller.js` | `walkerLogin` comparaba `bcrypt.compare(data.password, walker.password)`, pero el campo en la DB es `passwordHash` | **Todo login de paseador devolvía 401** (`walker.password` es `undefined`) | Comparar contra `walker.passwordHash` |
| `src/controllers/auth.controller.js` | El payload del JWT de `walkerLogin` usaba `walker.name` (inexistente) | El token de un paseador nunca llevaba su nombre | Usar `firstName`/`lastName` |
| `src/controllers/maps.controller.js` + `src/services/maps.service.js` | El controller leía `waypoints` del body y se lo pasaba al service; el service desestructuraba `intermediates` | `intermediates` siempre era `undefined` → `[]`. **Las paradas intermedias se descartaban en silencio**, sin error visible | Unificar en `intermediates` en controller y service |
| `backend/package.json` | `"dev": "nodemon src/server.js"`, archivo que no existe | `npm run dev` fallaba siempre | `"dev": "nodemon app.js"` (+ agregado `"start": "node app.js"`) |
| `backend/package.json` | `@prisma/client` en `devDependencies` | Un `npm ci --omit=dev` en producción no instala el cliente y el server no arranca | Movido a `dependencies` |
| `src/services/maps.service.js` | `getDirection` accedía a `place_info.data.places[0].id` sin chequear que hubiera resultados | Una dirección sin resultados de Google tiraba un `TypeError` no controlado → 500 genérico | Se devuelve 404 "Dirección no encontrada" |
| `src/middlewares/auth.middlewares.js` | `authHeader.split(' ')[1]` sin validar el esquema `Bearer` | Un header mal formado (`Authorization: <token>` sin `Bearer`) rompía `jwt.verify` con un error críptico | Se valida el esquema antes y se responde 401 claro |
| `src/controllers/dogs.controller.js` | `createDog` convertía la edad/peso con `parseInt(x) || null` | Un cachorro con **edad 0** (meses) se guardaba como `null` | Helpers `toIntOrNull`/`toFloatOrNull` que solo devuelven `null` si el valor está ausente o no es numérico |

## 2. Seguridad

- **Contraseñas hasheadas expuestas al cliente**: las 4 respuestas de `auth` (`userRegister`, `userLogin`,
  `walkerRegister`, `walkerLogin`) devolvían la entidad completa de Prisma, `passwordHash` incluido.
  Se agregó `stripPassword()` (`src/utils/sanitize.js`) y se aplica en todas las respuestas de auth.
- **Contraseñas hasheadas en los logs**: `auth.service.js` hacía `console.log` del usuario/paseador recién
  creado o encontrado — el log incluía el hash de la contraseña. Se eliminaron esos 4 `console.log`.
- **Sin chequeo de propiedad sobre los perros**: `updateDog` y `deleteDog` no verificaban que el perro
  perteneciera al usuario autenticado — cualquier usuario logueado podía editar o borrar el perro de
  otro con solo conocer su `id`. Se agregó `DogsService.userOwnsDog(userId, dogId)`, chequeado en ambos
  endpoints (los admins lo saltean).
- **Colisión de identidad entre `User` y `Walker`**: ambas tablas tienen ids autoincrementales que se
  solapan (usuario #3 y paseador #3 son entidades distintas con el mismo id), y el JWT no distinguía
  de qué tabla venía. Un token de paseador podía usarse donde se esperaba un `userId`. Se agregó el claim
  `type: 'user' | 'walker'` al JWT y los middlewares `verifyUser`/`verifyWalker` para exigir el tipo correcto
  por ruta. Esto era condición necesaria para poder construir el dominio `walks` de forma segura.
- **Mensajes de error internos filtrados al cliente**: varios controllers devolvían `error.message` de
  Prisma directamente en la respuesta (`res.status(500).json({ message: error.message })`). El nuevo
  `error.middleware.js` central devuelve un mensaje genérico en 500 y loguea el detalle solo en el servidor.

## 3. Código eliminado / simplificado

- **~15 bloques de `try/catch` idénticos** en los controllers de `auth`, `dogs` y `maps` → reemplazados por
  `asyncHandler()` (`src/utils/async-handler.js`), que manda cualquier rechazo al middleware de error central.
- **Import duplicado de `dotenv/config`** en `auth.middlewares.js` — ya lo carga `app.js` primero.
- **Validación redundante** en `verifyAdmin`: `!user.role || user.role !== 'admin'` → `user.role !== 'admin'`.
- **`user.lastName ? user.lastName : null`** repetido en controller y service de auth — se resuelve una sola vez.
- **`userLogin` usado para chequear existencia de email** en `userRegister`/`walkerRegister` — se leía al
  revés de lo que hacía. Renombrado a `findUserByEmail`/`findWalkerByEmail`.
- **Mutación de `req.body`** en `createDog` (`dogData.ownerId = user.id`) — ahora se pasa como argumento aparte.
- **Opciones de firma del JWT duplicadas** (`expiresIn`, `issuer`) en `userLogin` y `walkerLogin` — extraídas
  a un único `signToken(payload)`.

## 4. Cambios en el contrato HTTP (para el equipo de frontend)

Nada consume la API todavía, así que se corrigieron estos comportamientos en vez de mantenerlos
retrocompatibles:

- **Respuestas de `auth` ya no incluyen `passwordHash`** en `user`/`walker`.
- **`GET /dogs/user` y `GET /dogs/:id` devuelven `200 []`** en vez de `404` cuando el usuario no tiene
  perros — una lista vacía no es un error.
- **`POST /maps/route` espera `intermediates`**, no `waypoints`, en el body (antes el parámetro se
  ignoraba silenciosamente, así que este es el nombre que hay que usar para que funcione).
- **El JWT ahora incluye `type: 'user' | 'walker'`** — cualquier decodificación manual del token en el
  frontend debe contemplar este campo nuevo.
- **Los errores 4xx/5xx tienen forma uniforme `{ error: string }`** en todos los dominios (antes algunos
  usaban `message`, otros `error`).

## 5. Endpoints nuevos

### Perfil (`src/routes/auth.router.js`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/auth/me` | token | Perfil propio (usuario o paseador según el token) |
| `PUT` | `/auth/me` | token | Actualizar `firstName`/`lastName`/`phone` (+ `description`/`profilePicture` si es paseador). Nunca acepta `email`, `role` ni `passwordHash` |
| `PUT` | `/auth/me/password` | token | Cambiar contraseña (`currentPassword` + `newPassword`) |

### Direcciones (`src/routes/addresses.router.js`, dominio nuevo)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/addresses` | usuario | Direcciones del usuario actual |
| `POST` | `/addresses` | usuario | Crear dirección; si no vienen `latitude`/`longitude` se geocodifican en el servidor reusando `MapsService.getDirection` |
| `PUT` | `/addresses/:id` | usuario dueño | Actualizar (403 si no es dueño) |
| `DELETE` | `/addresses/:id` | usuario dueño | Borrar (403 si no es dueño) |

### Paseos (`src/routes/walks.router.js`, dominio nuevo — el núcleo del producto)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/walks` | usuario | Crea el pedido (`dogIds[]`, `walkType`, `startTime`, `duration`). Nace en `'searching'`, sin paseador asignado. Valida que todos los perros pertenezcan al usuario |
| `GET` | `/walks/me` | usuario o paseador | Paseos propios (como solicitante o como paseador asignado) |
| `GET` | `/walks/available` | paseador | Paseos en `'searching'`, disponibles para aceptar |
| `GET` | `/walks/:id` | participantes / admin | Detalle (403 si no participa) |
| `PATCH` | `/walks/:id/accept` | paseador | Asigna el paseador y pasa a `'accepted'`. 409 si otro paseador ya lo aceptó |
| `PATCH` | `/walks/:id/status` | participantes | Transiciones controladas: `accepted → in_progress → finished`, `canceled` desde `searching`/`accepted`. `finished` calcula `duration` automáticamente |
| `PUT` | `/walks/:id` | usuario dueño | Editar mientras siga en `'searching'` |
| `GET` | `/walks` | admin | Listado completo |

**Cambio de schema necesario**: `Walk.walkerId` era `Int` obligatorio, pero el status `'searching'`
representa justamente un paseo *sin* paseador asignado — antes era imposible crear ese estado.
Se cambió a `walkerId Int?` / `walker Walker?` (migración
`backend/prisma/migrations/20260803113643_walk_optional_walker`), y se agregó `Walk.createdAt`
para poder ordenar el historial de paseos.

### Chat (`src/routes/chat.router.js`, dominio nuevo — montado bajo `/walks`)

Chat temporal, exclusivo del paseo entre el usuario dueño y el paseador asignado. Se crea (`Chat`,
`status: 'open'`) en la misma transacción que `PATCH /walks/:id/accept`, y se cierra en modo
lectura (`status: 'closed'`) en la misma transacción que cualquier transición a un estado final de
`Walk` (`finished`/`canceled`, derivados de `ALLOWED_TRANSITIONS` en `walks.service.js`, no
hardcodeados dos veces). Nunca se hace hard delete: el historial queda como respaldo ante un
reclamo.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/walks/:id/chat` | participantes | Chat + últimos mensajes (`?before=<id>&limit=`). 404 si el paseo aún no tiene chat |
| `POST` | `/walks/:id/chat/messages` | participantes | Enviar mensaje (`{ body }`). 409 si el chat ya está `closed` |
| `PATCH` | `/walks/:id/chat/read` | participantes | Marca como leídos los mensajes del otro participante |

Autorización centralizada en `ChatService.assertParticipant(walk, user)` — la misma función la usa
el middleware `requireWalkParticipant` del router REST y el handler `chat:join` de los sockets, así
que no hay dos implementaciones del mismo chequeo.

**Tiempo real**: se agregó `socket.io` (`src/sockets/index.js`). El handshake se autentica con el
mismo JWT que la API REST; los mensajes solo se persisten vía `POST .../messages` (un único camino
de escritura) y desde ahí se emite `chat:message` al room `walk:<id>`; el cierre del chat emite
`chat:closed`. `app.js` pasó a usar `http.createServer(app)` en vez de `app.listen` directo, para
poder colgar el server de sockets del mismo puerto.

Como `User` y `Walker` son tablas de identidad separadas con ids que se solapan (ver "Colisión de
identidad" más arriba), `ChatMessage.senderId` no tiene FK: es un `(senderType, senderId)`
polimórfico, igual al par `{ id, type }` que ya viaja en el JWT.

---

## 6. Marcado como innecesario o pendiente (no se tocó)

### Frontend (`frontend/`)

Es la plantilla de `create-expo-app` sin modificar — cero código de Perrubi, cero llamada al backend.
Se deja íntegra por decisión explícita (la dueña del frontend puede estar por construir sobre ella),
pero queda señalada acá:

- Pantallas demo: `app/(tabs)/explore.tsx`, `app/modal.tsx`, y el contenido de
  `app/(tabs)/index.tsx` ("Welcome! / Step 1: Try it...").
- Componentes demo: `components/hello-wave.tsx`, `components/parallax-scroll-view.tsx`,
  `components/ui/collapsible.tsx`, `components/external-link.tsx`.
- Assets sin uso: `react-logo.png`, `react-logo@2x.png`, `react-logo@3x.png`, `partial-react-logo.png`.
- `scripts/reset-project.js` y el script `"reset-project"` de `package.json` — herramienta de
  arranque de Expo, no del producto.
- `app.json` sigue con `"name": "frontend"` / `"slug": "frontend"` en vez de algo relacionado a Perrubi.
- `frontend/README.md` es el README genérico de Expo.

### Migraciones (`backend/prisma/migrations/`)

Las tres migraciones existentes antes de este trabajo se llaman `init`, lo que hace ilegible el
historial. Las dos primeras (`20260611112534_init`, `20260611114247_init`) crean un esquema
(`User.password`, `Dog.ownerId`, `Walk.dogId` directo) que la tercera (`20260706040201_init`) borra
por completo y reemplaza. Solo tienen sentido si hubo una base productiva que las aplicó en ese
orden; si la base sigue siendo de desarrollo, convendría colapsarlas en una única migración inicial
limpia. **Se deja como decisión del equipo, no se tocó.**

### Estructura del proyecto

- No hay `package.json` en la raíz del repo ni npm workspaces — no se puede instalar ni levantar
  el monorepo (`backend` + `frontend`) con un solo comando.
- `app.js` y `db.js` viven en la raíz del paquete `backend/`, mientras el resto del código vive bajo
  `src/`. Lo prolijo sería `src/app.js` + `src/config/db.js`, pero mover `db.js` implica tocar el
  import `../../db.js` de cada uno de los services existentes — se deja para una pasada aparte.
- `prisma.config.ts` es TypeScript en un paquete que es JavaScript puro (no tiene `typescript`
  instalado). Funciona porque lo carga el propio CLI de Prisma, pero es una inconsistencia menor.
- El backend no tiene ninguna suite de tests (`npm test` es un stub que siempre falla) ni
  configuración de lint, mientras que el frontend sí tiene ESLint configurado.
- `backend/CLAUDE.md` no estaba trackeado en git — hay que decidir si se commitea o se agrega
  al `.gitignore`.
- `Walker.role` y `User.role` son nullable y **ningún endpoint los asigna nunca** — hoy no existe
  forma de crear un admin salvo escribiendo directo en la base. Las rutas que exigen `verifyAdmin`
  (`GET /dogs`, `GET /dogs/:id`, `GET /walks`) son código efectivamente inalcanzable hasta que
  exista un flujo (o un seed) para otorgar ese rol.
- `Dog.review` es un `String?` suelto sin relación a nada, y `Walker.averageRating`/`reviewCount`
  no tienen una tabla de reseñas detrás que los alimente — el sistema de reseñas está a medio
  modelar en el schema.
- No hay tabla de sesiones ni refresh tokens: el JWT vence a la hora y la única forma de renovarlo
  es volver a loguearse.

### Agregado durante esta revisión (no estaba pedido, pero se resolvió por ser bloqueante)

- `backend/.env.example` — no existía ningún archivo de referencia para las variables de entorno
  requeridas (`DATABASE_URL`, `PORT`, `JWT_SECRET`, `API_KEY_MAPS`); sin él, nadie que clona el repo
  sabe qué configurar.
