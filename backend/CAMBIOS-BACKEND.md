# Cambios estructurales del backend — integración con el frontend

Este documento registra los cambios que se hicieron en `backend/` como parte de la integración con
el frontend (ver `../INTEGRACION-BACKEND-FRONTEND.md` para la bitácora completa del proceso). Son
cambios de **código y schema**, no solo de documentación — este archivo explica el porqué de cada
uno para quien audite el diff más adelante.

## 1. Fix: `POST /walks` no vinculaba los perros al paseo

**Archivo**: `src/controllers/walks.controller.js`

`WalksController.createWalk` validaba la propiedad de `dogIds` (`WalksService.userOwnsAllDogs`) y
después llamaba a `WalksService.createWalk(req.user.id, { walkType, startTime, duration })` —
**sin pasar `dogIds`**. El service sí soportaba `data.dogIds` (arma `dogs: { create: [...] }`), así
que el bug era exclusivamente esa omisión. Resultado: todo paseo creado por la API quedaba con
`dogs: []` para siempre, sin forma de repararlo (`updateWalk` tampoco toca la relación `dogs`).

Fix de una línea: pasar `dogIds` (junto con los nuevos `notes`/`addressId`, ver punto 2) al service.

## 2. Migración: `Walk.notes` y `Walk.addressId`

**Archivos**: `prisma/schema.prisma`, `prisma/migrations/20260817220000_add_walk_notes_and_address/`

La pantalla `crear-paseo.tsx` del frontend ya tenía campos de ubicación (texto libre) y notas, pero
el modelo `Walk` no tenía dónde guardarlos. Se agregó:

```prisma
model Walk {
  // ...
  notes     String?
  addressId Int?     @map("address_id")
  address   Address? @relation(fields: [addressId], references: [id], onDelete: SetNull)
}

model Address {
  // ...
  walks     Walk[]
}
```

`onDelete: SetNull` explícito: `Address` cascadea desde `User` (`onDelete: Cascade` en la relación
`User → Address`), así que sin `SetNull` acá, borrar un usuario fallaría en cuanto alguno de sus
paseos apuntara a una de sus direcciones.

### Sobre la migración: no se pudo correr `prisma migrate dev`

`backend/.env` no existe en este repo (solo `.env.example`), y sin `DATABASE_URL` no hay forma de
conectarse a la base de Neon para que Prisma genere y aplique la migración de la manera normal. En
su lugar:

1. Se escribió el SQL de la migración **a mano**, siguiendo exactamente el mismo patrón que las 5
   migraciones anteriores del repo (mismo estilo de `ALTER TABLE` / `ADD CONSTRAINT`, mismo
   `ON DELETE SET NULL ON UPDATE CASCADE` que ya usa `walk_walker_id_fkey`).
2. Se validó el `schema.prisma` resultante con `npx prisma validate` y `npx prisma generate` usando
   una `DATABASE_URL` temporal descartable (no se tocó ningún dato real; el archivo temporal se
   borró después). El schema es válido y el cliente generado incluye los campos nuevos.

**Antes de correr esto contra la base real, hace falta**:

```bash
cp .env.example .env        # completar DATABASE_URL, PORT, JWT_SECRET, API_KEY_MAPS
npx prisma migrate status   # tiene que decir "Database schema is up to date"
```

Si `migrate status` confirma que no hay drift, la migración ya escrita se aplica sola la próxima vez
que se corra `npx prisma migrate dev` (Prisma la va a encontrar en el directorio de migraciones y
la va a marcar como pendiente) — no hace falta volver a generarla.

**Si `migrate status` reporta drift, NO usar `migrate dev` directamente**: puede ofrecer un reset
que borra todos los datos de la base. En ese caso, aplicar el SQL a mano:

```bash
npx prisma db execute --file prisma/migrations/20260817220000_add_walk_notes_and_address/migration.sql --schema prisma/schema.prisma
npx prisma migrate resolve --applied 20260817220000_add_walk_notes_and_address
```

El DDL en sí es de bajo riesgo (dos columnas nullable sin default + una FK sobre una columna que
va a estar vacía en todas las filas existentes) — el riesgo está en el comando `migrate dev`, no en
el SQL. Si Neon no da permisos para crear la shadow database que usa `migrate dev`, agregar
`shadowDatabaseUrl` a `prisma.config.ts` apuntando a otra branch/base de Neon.

### `walks.service.js` y `walks.controller.js`

- `WALK_INCLUDE` ahora incluye `address: true`, así que `GET /walks/me`, `GET /walks/:id`, etc.
  devuelven la dirección completa del paseo.
- `createWalk`/`updateWalk` aceptan `notes` y `addressId` (mismo patrón `undefined`-no-toca que ya
  usaba el archivo para los demás campos opcionales).
- **Chequeo de propiedad nuevo**: `WalksService.userOwnsAddress(userId, addressId)` (mismo patrón
  que el ya existente `userOwnsAllDogs`), usado en `createWalk` y `updateWalk`. Sin esto, la
  funcionalidad recién agregada abría un agujero de seguridad: `addressId` viene del cliente, y con
  `address` ahora incluido en la respuesta, un usuario podía adjuntar el `addressId` de otra persona
  a su propio paseo y leerle la calle y las coordenadas de su casa vía `GET /walks/:id`. Sin el
  chequeo, la petición responde `403 { error: "Esa dirección no te pertenece" }`.

## 3. Dos hardenings de una línea, encontrados en el camino

No estaban en el pedido original pero son fixes triviales en archivos que ya se estaban tocando:

- **`addresses.service.js`**: `createAddress`/`updateAddress` pasaban `latitude`/`longitude` crudos
  a un campo `Float?` de Prisma. Si el cliente los manda como string (fácil de hacer sin querer
  desde JSON), la consulta tira un error de validación de Prisma sin `.code`, que cae al 500
  genérico. Se envolvieron con el `toFloatOrNull` que `dogs.service.js` ya usaba para el mismo
  propósito.
- **`dogs.service.js`**: `DogsService.getAllDogs` (ruta admin `GET /dogs`) hacía
  `users: { include: { user: true } }`, que devuelve el `User` completo — **incluido
  `passwordHash`**. El resto del código usa `stripPassword` para sacar el hash antes de responder,
  pero acá no se aplicaba. Se cambió a un `select` explícito de
  `{id, firstName, lastName, email}`. Es una ruta admin y hoy no la usa ningún frontend, pero es
  un hash de contraseña viajando por HTTP.

## 4. `WALK_INCLUDE`: `description`/`reviewCount` en el `select` de `walker`

**Archivo**: `src/services/walks.service.js`

Parte de la segunda pasada de integración (conectar `chat.tsx`, `paseo_en_curso.tsx`,
`estado_paseador.tsx`, etc. — ver `../INTEGRACION-BACKEND-FRONTEND.md`). `estado_paseador.tsx`
necesitaba la bio y la cantidad de reseñas del paseador para no mostrar datos inventados; ambos
campos ya existían en el modelo `Walker`, solo no estaban en el `select` de `WALK_INCLUDE.walker`.
Se agregaron `description: true, reviewCount: true`. No es un cambio de schema ni requiere
migración — son dos claves más en un objeto que ya se serializa en `GET /walks/*`. No expone nada
sensible (no es `passwordHash` ni `email`), y esa query ya está detrás de `verifyToken` + el chequeo
de participación en el paseo.

Se evaluó también sumar `phone` (para habilitar un botón de "Llamar" en `paseo_en_curso.tsx`) y se
decidió que no: exponer el teléfono del paseador es una decisión de privacidad de producto, no una
que corresponda tomar en una tarea de cableado. El botón queda sin `onPress`.

Verificado end-to-end contra la base real con `requests.http`: `GET /walks/:id` después de
`PATCH /walks/:id/accept` devuelve `walker.description` y `walker.reviewCount` (`null` si el
paseador no cargó bio/reseñas todavía, que es el caso esperado para una cuenta nueva).

## 5. Ubicación en tiempo real del paseador

**Archivos**: `prisma/schema.prisma`,
`prisma/migrations/20260916112314_add_walk_location/`, `src/services/walks.service.js`,
`src/controllers/walks.controller.js`, `src/routes/walks.router.js`,
`src/sockets/index.js`, `src/services/maps.service.js`,
`src/controllers/maps.controller.js`, `src/routes/maps.router.js`,
`src/middlewares/auth.middlewares.js`.

Ver `../UBICACION-TIEMPO-REAL.md` para el análisis completo. Resumen del resultado:

- Modelo nuevo `WalkLocation` (una fila por paseo, `upsert` en cada tick — no es un historial).
- `PATCH /walks/:id/location` (`verifyWalker` + `walk.walkerId === req.user.id`), acepta
  `accepted`/`in_progress` (409 en cualquier otro estado), valida rango de coordenadas y
  emite `walk:location` por Socket.IO a la room `walk:<id>` (`emitToWalk`, ya existía).
- `sockets/index.js` suma `walk:join`/`walk:leave`, separados de `chat:join`/`chat:leave`
  para que el dueño reciba la ubicación sin depender de tener el chat abierto — reusa
  `ChatService.assertParticipant`, que a pesar del nombre solo chequea participación en el
  walk, no en un `Chat`.
- `GET /maps/static` — proxy nuevo a la Maps Static API de Google (no a Routes/Places, que
  son las que ya usaba `maps.service.js`; hubo que habilitar esa API en el proyecto de GCP).
  Reemplaza a `react-native-maps` en esta pasada: el frontend corre en Expo Go y en web, y
  ese paquete necesita dev build y no tiene soporte web. Devuelve un PNG con el pin ya
  renderizado por Google — el frontend solo lo pone en un `<Image>`.
- `verifyTokenFromQuery` (nuevo, en `auth.middlewares.js`) — variante de `verifyToken` que
  también acepta el JWT por `?token=`, porque `<Image>` no manda headers de forma confiable
  (React Native Web los ignora). Solo la usa `/maps/static`.

**La migración tampoco pudo correr con `prisma migrate dev`**, pero por un motivo distinto al
punto 2: acá `.env` sí existe y `migrate status` decía "up to date", pero al ejecutar
`migrate dev` Prisma detectó **drift preexistente y no relacionado** — hay una migración
aplicada directamente contra la base de Neon (`20260827120000_add_review_and_ia_fields`,
tablas `review`/`walker_availability`, columnas nuevas en `user`/`walker`) que no está en
`prisma/migrations/` de este repo. `migrate dev` iba a pedir un `reset` de todo el schema
`public` para resolverlo, así que **no se corrió**: se aplicó el SQL de `walk_location` a mano
(mismo patrón que el punto 2) con `prisma db execute` + `prisma migrate resolve --applied`, sin
tocar el resto del drift. Ese drift preexistente queda sin resolver — es trabajo de quien
escribió `20260827120000` documentar esa migración en el repo, no algo que corresponda arreglar
acá de paso.

Verificado end-to-end contra la base real con `requests.http` (login de user y walker, crear
perro/paseo, aceptar, `PATCH /location` en 200/403/400/409, `GET /walks/:id` con `location`
poblado, `GET /maps/static` devolviendo un PNG real) y con `scripts/simulate-location.js`
mandando coordenadas cada pocos segundos.

## Verificación pendiente (requiere `.env` real)

Una vez completado `backend/.env`, correr contra `backend/requests.http` (ya actualizado a
`http://localhost:3000`, ver más abajo):

1. `userRegister` + `userLogin` → capturar token.
2. `POST /dogs {name:"Toby", weight:15.5}` → 201, `weight` vuelve como **string** `"15.5"`.
3. `POST /addresses {label:"Zona", street:"Av. Cabildo 2000, CABA"}` → 201 con `latitude`/
   `longitude` no nulos.
4. `POST /walks {dogIds:[id], walkType:"group", duration:45, notes:"test", addressId:id}` → 201 con
   **`dogs.length === 1`** y **`address !== null`** — la prueba directa del fix del punto 1 y de la
   migración del punto 2.
5. `POST /walks` con el `addressId` de otro usuario → **403** — prueba del chequeo de propiedad.
6. `PATCH /walks/:id/status {status:"canceled"}` → 200; repetir → 400 con el mensaje de transición.

## Otros cambios de config (no de código)

- `requests.http`: `@baseUrl` estaba en `http://localhost:3002`, contradiciendo el `PORT=3000` de
  `.env.example` y el `BASE_URL` que asume el frontend. Se unificó a `3000`.
