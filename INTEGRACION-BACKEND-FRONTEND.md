# Integración Backend ↔ Frontend — bitácora

Este documento reemplaza a la versión anterior (que era un análisis de "qué está roto y qué falta"
previo a la integración). Ahora es la bitácora de **lo que se conectó, lo que quedó afuera y por
qué, y cómo quedó armada la capa `api/` del frontend**. Los cambios de backend en sí — el bug de
`dogIds`, la migración, los hardenings — están documentados con más detalle en
`backend/CAMBIOS-BACKEND.md`; acá se resume el resultado y se documenta el lado frontend completo.

Fecha: 2026-08-17.

## Qué se conectó

| Endpoint | Pantalla | Notas |
|---|---|---|
| `POST /auth/userRegister` | `app/registro.tsx` | payload `{firstName, lastName?, email, password}` |
| `POST /auth/userLogin` | `app/login-form.tsx` | ver "login-form.tsx ahora es login real" abajo |
| `GET /auth/me` | — | expuesto en `api/auth.ts` (`getMe`), no consumido por ninguna pantalla todavía; el hero de `index.tsx` usa el `user` que ya vive en el contexto de sesión |
| `POST /dogs` | `app/(tabs)/agregar-perro.tsx` | botón "Guardar Mascota", que antes no tenía `onPress` |
| `GET /dogs/user` | `app/(tabs)/index.tsx`, `crear-paseo.tsx` | "Tu perro" en Inicio + selector de perros en Crear Paseo |
| `POST /addresses` | `app/(tabs)/crear-paseo.tsx` | se manda el texto libre de `ubicacion` como `street`; el back geocodifica |
| `POST /walks` | `app/(tabs)/crear-paseo.tsx` | botón "Continuar" |
| `GET /walks/me` | `app/(tabs)/index.tsx` | "Paseos recientes" |
| `GET /walks/:id` | `app/(tabs)/buscando_paseador.tsx` | polling cada 5s |
| `PATCH /walks/:id/status` | `app/(tabs)/buscando_paseador.tsx` | botón "Cancelar viaje" → `canceled` |

## Qué quedó explícitamente afuera (y por qué)

No se construyó UI nueva — solo se cableó lo que ya existía maquetado. Sin pantalla real que lo
justifique, estos endpoints **no se conectaron**:

- **Chat** (`GET/POST/PATCH /walks/:id/chat*` + Socket.IO): `app/(tabs)/chat.tsx` sigue siendo el
  stub de 20 líneas "Próximamente...". No se tocó.
- **Rol Walker** (`walkerRegister`, `walkerLogin`, `GET /walks/available`,
  `PATCH /walks/:id/accept`): el frontend no tiene ningún selector de rol dueño/paseador ni
  pantallas para un paseador. Solo se conectó la identidad `User`.
- **`PUT`/`DELETE /dogs`**: no hay pantalla de edición ni borrado de perros.
- **`PUT /auth/me`, `PUT /auth/me/password`**: `app/(tabs)/perfil.tsx` sigue siendo el stub.
  `getMe()` está listo en `api/auth.ts` para cuando se construya esa pantalla.
- **`GET/PUT/DELETE /addresses`**: no hay pantalla de gestión de direcciones; `crear-paseo.tsx` solo
  crea una dirección nueva en cada paseo (ver "Pendiente" más abajo).
- **`POST /maps/route`**: sin pantalla de mapa/ruta en el frontend.
- **Endpoints admin** (`GET /dogs`, `GET /dogs/:id`, `GET /walks`): no hay panel de administración.

Archivos **no tocados**, tal como se pidió: `app/(tabs)/mis-paseos.tsx`, `perfil.tsx`, `chat.tsx`
(stubs), `app/(tabs)/paseo_en_curso.tsx` (0 bytes — ver "Sobre paseo_en_curso.tsx" abajo).

## La capa `api/` del frontend, de cero

Antes de esta integración, `frontend/api/` tenía solo `client.ts` y `auth.ts`, y `auth.ts` apuntaba
a endpoints que no existían (`/auth/register` en vez de `/auth/userRegister`, payload `{name}` en
vez de `{firstName}`). Quedó así:

```
api/
  types.ts       — tipos compartidos (User, Dog, Address, Walk, ...), calcados de las
                   respuestas REALES del backend, no de una suposición
  session.ts     — AsyncStorage (token + user), extraído de auth.ts para poder romper
                   un ciclo de imports con client.ts
  client.ts       — apiRequest(), BASE_URL resuelta en runtime, manejo de 401 centralizado
  auth.ts        — register/login/getMe contra los endpoints reales + splitNombre()
  dogs.ts        — getMyDogs/createDog
  addresses.ts   — getMyAddresses/createAddress
  walks.ts       — createWalk/getMyWalks/getWalk/changeWalkStatus + helper dogsOf()
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

## Sobre `paseo_en_curso.tsx`

El archivo tiene **0 bytes** — no exporta ningún componente. Como se pidió no tocar pantallas sin UI
real, no se le agregó contenido. Para no dejar un `router.replace('/paseo_en_curso')` que rompa
(Expo Router tira error de "missing default export" y pantalla en blanco), `buscando_paseador.tsx`
**se queda en la misma pantalla** cuando el paseo pasa a `accepted`/`in_progress`: cambia el título a
"¡Encontramos a {walker.firstName}!", marca el tercer paso como hecho, y cambia el botón de
"Cancelar viaje" a "Ver mis paseos" (→ `/(tabs)`).

## Pendientes conocidos (fuera de alcance de esta integración)

- **Chat** — construir `chat.tsx` con los endpoints REST (`GET/POST/PATCH /walks/:id/chat*`) y
  Socket.IO (`chat:join`/`chat:leave`, eventos `chat:message`/`chat:read`/`chat:closed`). Requiere
  agregar `socket.io-client` al frontend, que hoy no está instalado.
- **Rol Walker** — si se agrega una vista de paseador, ya están los endpoints
  (`walkerRegister`/`walkerLogin`/`GET /walks/available`/`PATCH /:id/accept`) y el middleware
  (`verifyWalker`) del lado del backend; falta toda la UI y la decisión de cómo el login distingue
  entre los dos tipos de cuenta.
- **`paseo_en_curso.tsx`** — si se construye esa pantalla más adelante, `buscando_paseador.tsx` es
  el lugar donde agregar la navegación real (`router.replace('/paseo_en_curso', {walkId})`) en vez
  de quedarse en la misma pantalla.
- **"Usar mi ubicación actual"** en `crear-paseo.tsx` sigue sin `onPress` (no-op). Implementarlo
  requiere `npx expo install expo-location`, permisos nativos (`app.json`) y usar el path de
  `POST /addresses` con `{latitude, longitude}` en vez de `street`.
- **Foto de perfil de mascota** — el botón de cámara en `agregar-perro.tsx` sigue sin `onPress`; no
  hay endpoint de upload de archivos en el backend (`Dog.photo` es un `String?` que hoy nadie llena).
- **Direcciones huérfanas** — cada `POST /walks` desde `crear-paseo.tsx` crea una fila nueva en
  `Address` (etiquetada `"Zona de paseo"`); no hay reuso ni limpieza. Aceptable para esta primera
  integración, pero va a acumular filas con el tiempo.

## Otros hallazgos, no relacionados con la integración en sí

- **Conflicto de peer-dependencies preexistente**: `npm install` en `frontend/` falla con
  `ERESOLVE` (`react-native@0.86.0` pide `react@^19.2.3`, `package.json` fija `react@19.1.0`). No es
  algo introducido por esta integración — ya estaba en el `package.json` del repo. Para instalar
  localmente hace falta `npm install --legacy-peer-deps`; conviene resolver el mismatch de versión
  de React en algún momento aparte.
- **`app.json` referencia assets inexistentes**: `./assets/images/icon.png`, `splash-icon.png`,
  `favicon.png` y los `android-icon-*.png` no existen en el repo (`assets/` solo tiene
  `Logo-Principal.png`). No bloquea el desarrollo con Metro pero sí un build real.
- **`backend/.env` no existe** en el repo (solo `.env.example`) — hace falta completarlo con
  `DATABASE_URL`/`JWT_SECRET`/`API_KEY_MAPS` reales antes de poder correr el backend o aplicar la
  migración nueva contra la base. Ver `backend/CAMBIOS-BACKEND.md` para el procedimiento seguro de
  aplicar la migración contra Neon.

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
