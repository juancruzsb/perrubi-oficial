# Ubicación en tiempo real del paseador — análisis y plan

## Resumen

Hoy el "mapa" de `paseo_en_curso.tsx` es 100% decorativo: un `View` con
bloques, calles y un pin dibujados a mano con `StyleSheet` (ver
`frontend/app/(tabs)/paseo_en_curso.tsx:112-151`). No hay ningún componente de
mapa real, ni modelo de ubicación en la base de datos, ni endpoint ni evento
de socket que transporte una coordenada. Para mostrar la ubicación real del
paseador actualizándose sola hace falta trabajo en **las dos puntas**:
backend (persistir/transmitir la posición) y frontend (pedir permisos,
enviar la posición propia si sos el paseador, y renderizar un mapa real si
sos el dueño).

No hace falta que el **frontend** llame a la API de Google Maps con `fetch`
directamente para esto — para pintar un mapa con un marcador que se mueve,
lo que se necesita es un componente de mapa nativo (`react-native-maps`) que
ya sabe pedir los tiles a Google; la "llamada a la API de Google" real que
mencionás pasa a ser configuración (una API key de Maps SDK for Android/iOS),
no un `fetch` manual. El `fetch` a la Routes API que ya existe en el backend
(`maps.service.js`) sigue siendo útil pero para otra cosa: calcular/dibujar
la ruta caminable, no para la posición en vivo.

## Por qué en ambas partes, y qué hace cada una

| Parte | Qué necesita | Por qué |
|---|---|---|
| Backend | Guardar la última posición del paseador por paseo, y avisar en tiempo real a quien esté mirando ese paseo | Es la única fuente de verdad compartida entre el celular del paseador y el del dueño — no se puede mandar la ubicación del paseador directo de un celular a otro |
| Frontend (paseador) | Leer el GPS del dispositivo cada cierto intervalo y mandarlo al backend | Es quien físicamente tiene la ubicación real |
| Frontend (dueño) | Suscribirse a esas actualizaciones y pintarlas sobre un mapa real | Es quien necesita verlas |

Sin el backend, el celular del dueño no tiene ningún canal para enterarse de
dónde está el paseador. Sin cambios en el frontend del paseador, no hay
ubicación que transmitir. Sin cambios en el frontend del dueño, no hay dónde
mostrarla. Es un feature de punta a punta.

## 1. Backend

### 1.1 Modelo de datos

Agregar a `backend/prisma/schema.prisma` un modelo para la última posición
conocida (no un historial completo — con guardar solo la última alcanza para
"mapa en vivo"; un historial de puntos serviría para reconstruir el
recorrido después, que es una feature separada):

```prisma
model WalkLocation {
  id        Int      @id @default(autoincrement())
  walkId    Int      @unique @map("walk_id")
  walk      Walk     @relation(fields: [walkId], references: [id], onDelete: Cascade)
  latitude  Float
  longitude Float
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("walk_location")
}
```

`@unique` en `walkId`: un solo registro por paseo, se actualiza (`upsert`)
en cada tick del GPS en vez de acumular filas. Requiere migración
(`npx prisma migrate dev --name add_walk_location`) y agregar la relación
inversa `location WalkLocation?` en el modelo `Walk`.

### 1.2 Endpoint REST para publicar la posición

Nuevo domain o extensión de `walks`, siguiendo el patrón
router→controller→service ya establecido:

- `PATCH /walks/:id/location` — solo el paseador asignado a ese walk
  (`verifyToken` + chequeo `walk.walkerId === req.user.id`, mismo patrón que
  `changeStatus` en `walks.controller.js:114`). Body: `{ latitude, longitude }`.
- Solo debería aceptarse si `walk.status === 'in_progress'` (o `accepted`,
  si querés mostrar el trayecto de acercamiento) — igual que
  `updateWalk` valida `status !== 'searching'`.
- El service hace el `upsert` en `WalkLocation` y después llama a
  `emitToWalk(walkId, 'walk:location', { latitude, longitude, updatedAt })`
  (la función ya existe en `backend/src/sockets/index.js:58`, hoy sin usar
  fuera del propio módulo de sockets).

### 1.3 Emisión en tiempo real — reusar Socket.IO, no polling

El backend ya tiene toda la infraestructura de rooms por paseo
(`backend/src/sockets/index.js`): `chat:join` mete el socket en
`walk:<id>`, y `emitToWalk` ya sabe emitir a esa room. Para ubicación:

- No hace falta un evento de socket entrante nuevo para *escribir* la
  posición — eso entra por el REST endpoint de arriba (mismo criterio que
  ya se usa para el chat: "Escribir siempre pasa por acá (REST), nunca por
  el socket", según `frontend/CLAUDE.md:32`). Mantiene la escritura
  autenticada y validada por HTTP igual que el resto de la API, y el socket
  solo se usa para *difundir*.
- Sí hace falta que el dueño se una a la room del paseo para *recibir* la
  ubicación — puede reusar el mismo `chat:join`/`chat:leave` si ya te unís
  a esa room al entrar al chat, o agregar `walk:join`/`walk:leave`
  genéricos si querés desacoplarlo del chat (recomendado: la pantalla
  `paseo_en_curso` no siempre tiene el chat abierto).
- Alternativa sin tocar sockets: el dueño hace polling de
  `GET /walks/:id` cada 5-10s como ya hace `use-walk-polling.ts`, y se
  agrega `location` al include de `WalksService` (`WALK_INCLUDE` en
  `walks.service.js:22`). Es más simple de implementar pero da una
  actualización menos fluida y más carga de requests. Recomendado usar
  socket porque la infraestructura ya está montada y el resultado se ve
  mucho más "en vivo".

### 1.4 maps.service.js

No necesita cambios para la posición en vivo en sí. Sigue siendo el lugar
correcto si más adelante se quiere: (a) recalcular una ruta caminable desde
la posición actual del paseador hasta el punto de encuentro, usando
`MapsService.getRoute`, o (b) hacer geocoding inverso. Ninguna de las dos es
necesaria para el requerimiento pedido ("mostrar la ubicación que se va
actualizando"), solo para features futuras de ETA/ruta óptima.

## 2. Frontend

### 2.1 Dependencia nueva: mapa real

Instalar `react-native-maps` (no está en `package.json` hoy). Requiere:
- Una API key de **Maps SDK for Android** y **Maps SDK for iOS** (distintas
  de `API_KEY_MAPS` del backend, que es para Routes/Places — Google separa
  las keys por producto, aunque pueden vivir en el mismo proyecto de GCP).
- Configuración nativa en `app.json` (plugin de `react-native-maps`,
  `android.config.googleMaps.apiKey`, `ios.config.googleMapsApiKey`) y
  generar un dev build (`expo prebuild` / EAS build) porque este paquete
  requiere código nativo — **no funciona en Expo Go**. Esto es una decisión
  de infraestructura de build que vale la pena confirmar con el equipo antes
  de empezar, ya que cambia el flujo de desarrollo actual (hoy todo corre
  con Expo Go / Metro sin builds nativos).

### 2.2 Lado paseador: emitir la posición

Nueva pantalla o lógica agregada a la vista que ya usa el paseador durante
`in_progress` (hoy el repo no tiene una vista "paseador durante el paseo"
explícita en la lista de rutas de `frontend/CLAUDE.md` — revisar si existe
o si hay que crearla). Necesita:
- `expo-location` (tampoco instalado hoy — mencionado como dependencia no
  instalada en `frontend/CLAUDE.md:65` para otro feature) para pedir
  permiso de ubicación y usar `watchPositionAsync` con un intervalo
  (ej. cada 5-10s o por distancia mínima recorrida) en vez de un polling
  manual del GPS.
- En cada actualización, llamar a un nuevo `api/walks.ts` → `updateWalkLocation(walkId, {latitude, longitude})`
  que golpee el `PATCH /walks/:id/location` del punto 1.2.
- Cortar el tracking cuando el walk deja de estar `in_progress` (mismo
  cuidado que ya tiene `use-walk-polling.ts` con `useFocusEffect` para no
  dejar procesos corriendo en background sobre una pantalla no enfocada).

### 2.3 Lado dueño: mostrar el mapa real

En `paseo_en_curso.tsx`, reemplazar el bloque decorativo
(`styles.mapWrapper` / `styles.map`, líneas 112-151) por un `<MapView>` de
`react-native-maps` con un `<Marker>` en la posición del paseador.

- Estado de la posición: nuevo hook `use-walk-location.ts` (mismo espíritu
  que `use-walk-polling.ts` y `use-chat.ts`) que:
  - se conecta al socket (`api/socket.ts`, mismo singleton que ya usa
    `use-chat.ts`) y hace `join` a la room del walk,
  - escucha `walk:location` y actualiza el estado,
  - como fallback si el socket no conecta, cae a polling de
    `GET /walks/:id` (mismo patrón de fallback que ya documenta
    `use-chat.ts` en `frontend/CLAUDE.md:36`).
- `api/types.ts`: agregar el campo `location` (o `walkLocation`) al tipo
  `Walk`, calcado de lo que devuelva el backend una vez incluido en
  `WALK_INCLUDE`.
- Centrar/animar el `MapView` con `animateToRegion` cada vez que llega una
  posición nueva.

### 2.4 Qué no hace falta

- No hace falta que el frontend llame directo a una API HTTP de Google
  Maps con `fetch` — ni para pintar el mapa (lo resuelve el SDK nativo vía
  `react-native-maps`) ni para la posición en sí (es GPS del dispositivo,
  no un dato que venga de Google). El único lugar del proyecto que golpea
  APIs de Google por HTTP es el backend (`maps.service.js`), y sigue siendo
  así.
- No hace falta un endpoint nuevo de "obtener ubicación" además del que ya
  devuelve el walk completo, si se decide incluir `location` en
  `WALK_INCLUDE` — el polling fallback lo reutiliza gratis.

## 3. Orden sugerido de implementación

1. Backend: migración `WalkLocation`, endpoint `PATCH /walks/:id/location`,
   emitir por socket. (Se puede probar con Postman/`requests.http` sin
   tocar nada del frontend todavía.)
2. Frontend dueño: agregar `location` al tipo `Walk`, hook
   `use-walk-location.ts`, y reemplazar el mapa decorativo por un
   `MapView` estático primero (sin instalar `expo-location` todavía) para
   validar que las coordenadas llegan bien vía socket/polling.
3. Instalar `react-native-maps` + config nativa + dev build.
4. Frontend paseador: `expo-location` + `watchPositionAsync` + llamada al
   endpoint nuevo.
5. Pulir: throttling de escritura (no mandar cada metro), manejo de permiso
   denegado, indicador de "última actualización hace X" si el socket se
   desconecta.
