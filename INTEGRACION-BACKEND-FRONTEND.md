# Integración Backend ↔ Frontend — bitácora

Este documento es la bitácora de **lo que se conectó, lo que quedó afuera y por qué, y cómo quedó
armada la capa `api/` del frontend**. Los cambios de backend en sí — el bug de `dogIds`, la
migración, los hardenings — están documentados con más detalle en `backend/CAMBIOS-BACKEND.md`;
acá se resume el resultado y se documenta el lado frontend completo.

Hay dos pasadas de integración registradas acá: la primera (2026-08-17) conectó auth, dogs y el
flujo de creación de paseo. Entre esa fecha y la segunda pasada (2026-08-18/19) el frontend sumó
~88 KB de pantallas nuevas maquetadas (`chat`, `paseo_en_curso`, `perfil`, `mis_perros`,
`detalles_del_paseo`, `paseo_finalizado`, `estado_paseador`…) que quedaron sin cablear; la segunda
pasada las conecta.

## Qué se conectó

| Endpoint | Pantalla | Notas |
|---|---|---|
| `POST /auth/userRegister` | `app/registro.tsx` | payload `{firstName, lastName?, email, password}` |
| `POST /auth/userLogin` | `app/login-form.tsx` | ver "login-form.tsx ahora es login real" abajo |
| `GET /auth/me` | `app/(tabs)/perfil.tsx` | refresca el perfil en cada focus |
| `POST /dogs` | `app/(tabs)/agregar-perro.tsx` | botón "Guardar Mascota", que antes no tenía `onPress` |
| `GET /dogs/user` | `index.tsx`, `crear-paseo.tsx`, `mis_perros.tsx` | "Tu perro" en Inicio, selector en Crear Paseo, listado completo en Mis Perros |
| `POST /addresses` | `app/(tabs)/crear-paseo.tsx` | se manda el texto libre de `ubicacion` como `street`; el back geocodifica |
| `POST /walks` | `app/(tabs)/crear-paseo.tsx` | botón "Continuar" |
| `GET /walks/me` | `index.tsx`, `mis-paseos.tsx`, `chat.tsx` | "Paseos recientes", listado agrupado por fecha, resolución de qué chat abrir |
| `GET /walks/:id` | `buscando_paseador`, `paseo_en_curso`, `paseo_finalizado`, `detalles_del_paseo`, `estado_paseador` | `buscando_paseador` y `paseo_en_curso` hacen polling cada 5s (`hooks/use-walk-polling.ts`); el resto carga una vez |
| `PATCH /walks/:id/status` | `app/(tabs)/buscando_paseador.tsx` | botón "Cancelar viaje" → `canceled` |
| `GET /walks/:id/chat` | `app/(tabs)/chat.tsx` | vía `hooks/use-chat.ts`; 404 = "todavía no tiene chat" (el paseo no fue aceptado) |
| `POST /walks/:id/chat/messages` | `app/(tabs)/chat.tsx` | único camino de escritura — los sockets del backend son read-only |
| `PATCH /walks/:id/chat/read` | `app/(tabs)/chat.tsx` | al abrir el chat y al recibir un mensaje ajeno |
| Socket.IO (`chat:join`/`leave`, `chat:message`/`read`/`closed`) | `app/(tabs)/chat.tsx` | vía `api/socket.ts` + `hooks/use-chat.ts`; si el socket no conecta, cae a poll de 5s sobre `GET /walks/:id/chat` |

## Qué quedó explícitamente afuera (y por qué)

Sin pantalla real que lo justifique, o sin modelo/endpoint de backend que lo respalde, estos casos
**no se conectaron**:

- **`calificacion.tsx`, `mis_reseñas.tsx`, `metodos_de_pago.tsx`, `notificaciones.tsx`**: tienen UI
  completa pero no hay modelo `Review`, `PaymentMethod` ni `Notification` en el schema, ni
  endpoints. Conectarlas es trabajo de backend nuevo (modelo + migración + dominio), no de cableado.
  No se navega hacia ellas desde ninguna pantalla — mandar al usuario a una pantalla de datos falsos
  es peor que dejarla inalcanzable.
- **Rol Walker** (`walkerRegister`, `walkerLogin`, `GET /walks/available`,
  `PATCH /walks/:id/accept`): el frontend no tiene ningún selector de rol dueño/paseador ni
  pantallas para un paseador. Solo se conectó la identidad `User`. Verificar cualquier flujo que
  dependa de un paseador (aceptar un paseo, el chat, el ciclo de vida completo) requiere usar
  `backend/requests.http` con un token de walker — no hay forma de hacerlo desde la app.
- **`PUT`/`DELETE /dogs`**: no hay pantalla de edición ni borrado de perros; la tarjeta de perro en
  `mis_perros.tsx` no tiene `onPress`.
- **`PUT /auth/me`, `PUT /auth/me/password`**: no hay pantalla de edición de perfil. En
  `perfil.tsx`, el ítem "Mis datos" queda deshabilitado con un badge "Próximamente".
- **`GET/PUT/DELETE /addresses`**: no hay pantalla de gestión de direcciones; `crear-paseo.tsx` solo
  crea una dirección nueva en cada paseo (ver "Pendiente" más abajo). "Direcciones guardadas" en
  `perfil.tsx` queda deshabilitado.
- **`POST /maps/route`**: sin pantalla de mapa/ruta real en el frontend — los mapas de
  `paseo_en_curso.tsx`/`detalles_del_paseo.tsx` siguen siendo ilustraciones dibujadas a mano.
- **Endpoints admin** (`GET /dogs`, `GET /dogs/:id`, `GET /walks`): no hay panel de administración.
- **Cámara/ubicación**: el botón de cámara en `agregar-perro.tsx` (`expo-image-picker`, y el backend
  tampoco tiene endpoint de upload), "Usar mi ubicación actual" en `crear-paseo.tsx` y "Ver
  ubicación" en `chat.tsx` (ambos `expo-location`) siguen sin `onPress` — ninguna de esas
  dependencias nativas está instalada.
- **Teléfono del paseador**: el botón "Llamar" de `paseo_en_curso.tsx` queda deshabilitado. El
  backend no expone `Walker.phone` en `WALK_INCLUDE` — es una decisión de privacidad de producto,
  no un descuido de cableado (ver `backend/CAMBIOS-BACKEND.md`, punto 4).

## La capa `api/` del frontend, de cero

Antes de esta integración, `frontend/api/` tenía solo `client.ts` y `auth.ts`, y `auth.ts` apuntaba
a endpoints que no existían (`/auth/register` en vez de `/auth/userRegister`, payload `{name}` en
vez de `{firstName}`). Quedó así:

```
api/
  types.ts       — tipos compartidos (User, Dog, Address, Walk, Chat, ChatMessage, ...), calcados
                   de las respuestas REALES del backend, no de una suposición
  session.ts     — AsyncStorage (token + user), extraído de auth.ts para poder romper
                   un ciclo de imports con client.ts
  client.ts       — apiRequest(), BASE_URL resuelta en runtime, manejo de 401 centralizado
  socket.ts      — singleton de Socket.IO (getSocket/disconnectSocket/joinWalkChat/leaveWalkChat),
                   mismo estilo sin-React que client.ts
  auth.ts        — register/login/getMe contra los endpoints reales + splitNombre()
  dogs.ts        — getMyDogs/createDog
  addresses.ts   — getMyAddresses/createAddress
  walks.ts       — createWalk/getMyWalks/getWalk/changeWalkStatus + helper dogsOf()
  chat.ts        — getChat/sendMessage/markRead — escritura siempre por acá (REST),
                   nunca por el socket (sockets/index.js es read-only del lado del backend)

lib/
  paseos.ts      — helpers de PRESENTACIÓN (no HTTP): agrupar por fecha, formatear estado,
                   decidir a qué pantalla navegar según el status de un Walk, y qué chat
                   abrir en chat.tsx (elegirPaseoDeChat/hayPaseoBuscando)

hooks/
  use-walk-polling.ts — boilerplate compartido de "traer un Walk por id, opcionalmente
                   pollear cada 5s", usado por las 5 pantallas del ciclo de vida del paseo
  use-chat.ts    — ciclo de vida completo del chat: carga REST inicial, join por socket con
                   fallback a poll si no conecta, envío siempre por REST, dedupe por id
```

**No se creó `api/maps.ts`**: `POST /addresses` ya geocodifica del lado del servidor
(`addresses.controller.js` arma el `textQuery` a partir de `street`/`number`/`city` y llama a
`MapsService`). Mandar el texto libre de `ubicacion` como `street` produce el mismo resultado que
llamar primero a `/maps/directions` desde el frontend, en una sola llamada a Google en vez de dos.

### Sorpresas de shape que hay que tener presentes

Documentadas como comentarios en `api/types.ts`, pero vale repetirlas acá porque son la fuente más
común de bugs silenciosos si alguien las pasa por alto:

- **`weight`, `price`, `averageRating` son `string`, no `number`** (son `Decimal?` en Prisma, que
  Express serializa como string en el JSON). No hacer aritmética sin `Number(...)` primero.
- **`walk.dogs` y `walk.users` son filas de join** (`WalkDog[]`/`WalkUser[]`), no arrays planos de
  `Dog`/`User`. `walk.dogs[0].name` es `undefined`; hay que hacer `walk.dogs.map(wd => wd.dog)`
  (o usar el helper `dogsOf(walk)` de `api/walks.ts`).
- El error del backend **siempre** viene en la clave `error`, nunca `message`
  (`error.middleware.js`). `apiRequest` ya lo maneja — no hay que releer esto en cada pantalla.

### `client.ts`: BASE_URL resuelta en runtime

Antes estaba hardcodeada a `http://localhost:3000`, que no llega desde un celular físico ni desde
el emulador de Android (ahí `localhost` apunta al propio dispositivo). Ahora:

1. `process.env.EXPO_PUBLIC_API_URL` (si se define en `frontend/.env`) siempre gana.
2. Si no, se deriva del `hostUri` que usa Metro para servir la app (la IP LAN de la PC que corre
   `expo start`).
3. Si no hay nada de eso: `10.0.2.2` en el emulador de Android, `localhost` en cualquier otro caso.

**`EXPO_PUBLIC_*` se inlinea en build time** — después de crear o editar `frontend/.env` hace falta
reiniciar con `npx expo start -c` para que tome el valor nuevo.

### Sesión: `context/session.tsx` + guard en `(tabs)/_layout.tsx`

`SessionProvider` (nuevo, `frontend/context/session.tsx`) hidrata `{token, user}` desde AsyncStorage
al montar y expone `entrar()`/`salir()`. Envuelve todo en `app/_layout.tsx`.

El guard de sesión vive en `app/(tabs)/_layout.tsx`, no en el root: `(tabs)/index.tsx` es la ruta
`/`, así que ahí es donde la app arranca en frío y donde hace falta chequear el token de entrada.
Usa `<Redirect href="/login" />` (declarativo) en vez de un `router.replace()` imperativo durante el
primer render, que tira un error de navegación.

**Política de expiración**: el JWT dura 1 hora y el backend no tiene endpoint de refresh. La única
política implementada es reactiva: `client.ts` detecta un 401, limpia AsyncStorage y notifica al
`SessionProvider` (sin que `client.ts` tenga que importar el router), lo que dispara el `<Redirect>`
del guard. No hay renovación automática de token.

## `login-form.tsx` ahora es un login real

Antes de esta integración, `app/login-form.tsx` y `app/registro.tsx` eran el mismo formulario de
alta con diferencias puramente cosméticas (confirmado con `diff`: 5 hunks, todos de estilo). Los dos
llamaban a `handleRegistrar`. **No existía ninguna forma de iniciar sesión en la app** — con un JWT
de 1 hora, la app se volvía inusable a la hora de haberse registrado.

`login-form.tsx` se reescribió como pantalla de login (`handleIngresar` → `login()` → `entrar()` →
`/(tabs)`), sacando los campos de "Nombre completo" y "Confirmar contraseña". `registro.tsx` sigue
siendo la única pantalla de alta; su botón "Iniciar sesión" ahora navega a `/login-form` (antes hacía
`router.back()`, que volvía a la landing).

## Ciclo de vida del paseo (segunda pasada)

`buscando_paseador.tsx` ya no se queda en la misma pantalla al detectar `accepted`/`in_progress`:
`paseo_en_curso.tsx` existe y tiene UI completa (17.925 bytes — la afirmación anterior de este
documento de que estaba vacío quedó desactualizada apenas creció el frontend). Ahora
`router.replace({pathname:'/paseo_en_curso', params:{walkId}})`. El resto del ciclo:
`paseo_en_curso` → (`finished`) → `paseo_finalizado` → "Ver detalle" → `detalles_del_paseo`. Cada
pantalla usa `hooks/use-walk-polling.ts` y redirige sola si el status no es el que sabe mostrar
(entrar directo a `/paseo_en_curso` con un walkId `searching` manda a `/buscando_paseador`, etc.) —
así un deep link a la pantalla "equivocada" nunca muestra datos que no correspondan.

`chat.tsx` deja de ser el stub de 20 líneas: carga el chat del paseo activo (`accepted`/
`in_progress`) resuelto contra `GET /walks/me`, en tiempo real por Socket.IO con fallback a poll de
5s si el socket no conecta, y maneja los tres estados que importan — sin paseo activo, 404 (paseo
sin chat todavía), y chat cerrado (paseo en estado final).

## Pendientes conocidos (fuera de alcance de esta pasada)

- **Reseñas, pagos, notificaciones** — `calificacion.tsx`, `mis_reseñas.tsx`,
  `metodos_de_pago.tsx`, `notificaciones.tsx` necesitan modelos de backend nuevos (`Review`,
  `PaymentMethod`, `Notification`) antes de poder cablearse; hoy no existe ni el schema ni los
  endpoints.
- **Rol Walker** — si se agrega una vista de paseador, ya están los endpoints
  (`walkerRegister`/`walkerLogin`/`GET /walks/available`/`PATCH /:id/accept`) y el middleware
  (`verifyWalker`) del lado del backend; falta toda la UI y la decisión de cómo el login distingue
  entre los dos tipos de cuenta. Mientras tanto, cualquier verificación que necesite un paseo en
  `accepted`/`in_progress`/`finished` se hace con `backend/requests.http` y un token de walker.
- **"Usar mi ubicación actual"** en `crear-paseo.tsx` y **"Ver ubicación"** en `chat.tsx` siguen sin
  `onPress` (no-op). Implementarlo requiere `npx expo install expo-location`, permisos nativos
  (`app.json`) y usar el path de `POST /addresses` con `{latitude, longitude}` en vez de `street`.
- **Foto de perfil de mascota** — el botón de cámara en `agregar-perro.tsx` sigue sin `onPress`; no
  hay endpoint de upload de archivos en el backend (`Dog.photo` es un `String?` que hoy nadie llena).
- **"Llamar" al paseador** — botón deshabilitado en `paseo_en_curso.tsx`; el backend no expone
  `Walker.phone` en `WALK_INCLUDE` a propósito (decisión de privacidad, no técnica).
- **Mapas reales** — `paseo_en_curso.tsx` y `detalles_del_paseo.tsx` siguen mostrando una
  ilustración dibujada a mano (`View`s posicionadas), no una ruta real. Requiere
  `react-native-maps` + `POST /maps/route` + guardar la polyline en algún lado (el schema no tiene
  dónde hoy).
- **Editar/eliminar perro** — `PUT`/`DELETE /dogs/:id` existen pero no hay UI; la tarjeta de perro
  en `mis_perros.tsx` no es clicable.
- **Direcciones huérfanas** — cada `POST /walks` desde `crear-paseo.tsx` crea una fila nueva en
  `Address` (etiquetada `"Zona de paseo"`); no hay reuso ni limpieza. Va a acumular filas con el
  tiempo.

## Otros hallazgos, no relacionados con la integración en sí

- **Conflicto de peer-dependencies preexistente**: `npm install` en `frontend/` falla con
  `ERESOLVE` (`react-native@0.86.0` pide `react@^19.2.3`, `package.json` fija `react@19.1.0`). No es
  algo introducido por esta integración — ya estaba en el `package.json` del repo. Para instalar
  localmente hace falta `npm install --legacy-peer-deps`; conviene resolver el mismatch de versión
  de React en algún momento aparte.
- **`app.json` referencia assets inexistentes**: `./assets/images/icon.png`, `splash-icon.png`,
  `favicon.png` y los `android-icon-*.png` no existen en el repo (`assets/` solo tiene
  `Logo-Principal.png`). No bloquea el desarrollo con Metro pero sí un build real.
- **`backend/.env`** ya existe en el filesystem local con `DATABASE_URL`/`JWT_SECRET`/
  `API_KEY_MAPS` reales (está en `.gitignore`, no se commiteó). La afirmación anterior de este
  documento de que no existía quedó desactualizada.

## Verificación de este cambio

**Backend, con `backend/requests.http`** (ya actualizado a `http://localhost:3000`): ver la sección
de verificación en `backend/CAMBIOS-BACKEND.md`.

**Frontend, en web** (`npx expo start -c`, tecla `w`):
1. Arranque con AsyncStorage vacío → redirige a `/login` (guard).
2. `/registro` con email nuevo → entra a tabs; hero dice `¡Hola, <firstName>!`.
3. Registrar el mismo email otra vez → banner "El usuario ya existe" (409 tal cual).
4. Limpiar AsyncStorage → `/login-form` → iniciar sesión con esas credenciales → entra.
5. "Agregar perro" → guardar → al volver a Inicio el perro aparece listado.
6. Inicio → "Paseo" → Crear Paseo: el perro aparece preseleccionado (si hay uno solo); completar
   duración, ubicación y socialización → Continuar → pasa a "Buscando paseador" con polling visible
   en el log del backend cada ~5s.
7. "Cancelar viaje" → vuelve a Inicio, el paseo figura como cancelado en "Paseos recientes".
8. Typecheck: `cd frontend && npx tsc --noEmit` no debería agregar errores nuevos a los 3
   preexistentes en `components/parallax-scroll-view.tsx` / `hooks/use-theme-color.ts` (tipos de
   `ColorSchemeName` del template de Expo, no relacionados con esta integración) ni al de
   `StyleSheet.absoluteFillObject` en `crear-paseo.tsx` (también preexistente).

## Verificación de la segunda pasada (perfil, mis_perros, mis-paseos, chat, ciclo del paseo)

Hecha de punta a punta contra la base real de Neon (no solo lectura del código), con curls
equivalentes al flujo de `backend/requests.http`:

1. Registro + login de un `User` y un `Walker` de prueba.
2. `POST /dogs`, `POST /addresses` (geocodificó una dirección real de CABA), `POST /walks` con
   `dogIds`/`notes`/`addressId` → confirmado `dogs.length === 1` y `address !== null`.
3. `PATCH /walks/:id/accept` con el token del walker → confirmado que crea el `Chat` (`GET
   /walks/:id/chat` pasa de 404 a `200 {status:'open', messages:[]}`), y que `GET /walks/:id` ahora
   trae `walker.description`/`walker.reviewCount` (el cambio de `WALK_INCLUDE`, Fase 0 de esta
   pasada).
4. Mensajes de ida y vuelta (`POST /chat/messages` con ambos tokens) + `PATCH /chat/read`.
5. `PATCH /walks/:id/status {"in_progress"}` → confirmado `startTime` seteado.
6. `PATCH /walks/:id/status {"finished"}` → confirmado `endTime`/`duration` recalculados y que un
   `POST /chat/messages` posterior devuelve `409 {"error":"El chat de este paseo ya está cerrado"}`
   — el mensaje exacto que `chat.tsx` muestra en el estado "cerrado".
7. Un segundo paseo sin aceptar → `GET /chat` devuelve `404` con el mensaje exacto que `chat.tsx`
   muestra en el estado "sin-chat".

Además: `npx tsc --noEmit` (sin errores nuevos — los 3 preexistentes de arriba siguen igual),
`npm run lint` (0 errores, mismos warnings preexistentes de `unused-vars` en archivos no tocados
por esta pasada), y un boot limpio de `node app.js` tras el cambio de `WALK_INCLUDE`.

**Nota sobre rutas tipadas de Expo Router**: `frontend/.expo/types/router.d.ts` se regenera
automáticamente al levantar Metro (`expo start`); si el typecheck falla con errores de rutas que sí
existen como archivos en `app/`, correr `npx expo start` una vez (aunque sea unos segundos) para que
el typegen se ponga al día antes de volver a tipar.
