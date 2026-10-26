# Recorrido guardado, mapa interactivo, destino y ruta de acercamiento

Este documento cubre cuatro cambios hechos juntos y la investigación que hay detrás:

1. **Guardar el recorrido del paseo** y mostrarlo al final (antes era un placeholder).
2. **Mostrar el destino** (casa del perro) en el mapa mientras el paseador va en camino.
3. **Mapa movible** (arrastrar / zoom) en lugar de una imagen fija.
4. **Ruta de acercamiento**: camino entre la primera ubicación del paseador y la casa del perro, visible para el dueño.

> Estado: **implementado**, verificado con `tsc --noEmit` y `expo lint` (frontend), `node --check` y
> arranque del servidor (backend), y lectura de la base real. **No se probó el mapa en pantalla**: falta
> la key `API_KEY_MAPS_JS` (ver "Antes de probarlo"). Los pasos para probarlo están al final.

---

## 1. Investigación: cómo se guarda y se traza un camino con Google Maps

### Cómo se guarda un camino

Google no "graba" el camino de nadie: el recorrido es **una lista de coordenadas que la app misma
junta** (el GPS del paseador) y que el backend persiste. Para dibujarlo se unen los puntos en orden.
Decisiones de diseño:

| Tema | Opciones | Lo elegido |
|---|---|---|
| Dónde guardar | (a) una fila por punto; (b) un único campo con una *encoded polyline* (string comprimido de Google); (c) un JSON | **(a) una fila por punto** (`walk_location_point`). Permite filtrar por fase, calcular distancia, ordenar por tiempo y no reescribe un blob entero en cada tick. La polyline codificada se usa solo para la ruta de acercamiento, que Google ya devuelve en ese formato. |
| Cuánto muestrear | Por tiempo, por distancia, o ambos | Ya lo hace la app del paseador: `watchPositionAsync` con `timeInterval: 5000` y `distanceInterval: 5`, y un mínimo de 4 s entre envíos (`context/ubicacion-paseador.tsx`). El backend suma un filtro propio: **no guarda un punto a menos de 5 m del anterior** (el GPS parado "tiembla" y llenaría la tabla de ruido). |
| Volumen | Paseo de 1 h ≈ 700 puntos como máximo | Chico. Por eso `GET /walks/:id` **no** incluye los puntos: hay un endpoint aparte (`/walks/:id/route`). Si algún día crece, se simplifica con Douglas-Peucker o se guarda como polyline. |
| Precisión | El GPS "salta" entre calles | Opción descartada por ahora: **Roads API – snap to roads** (ajusta los puntos a la calle más cercana, ~USD 10 / 1000 requests; hasta 100 puntos por llamada). Mejoraría el dibujo pero cuesta plata y no hace falta para un MVP. Queda como mejora. |
| Fase | Un paseo tiene un tramo "yendo a buscar al perro" y otro "paseando" | Cada punto lleva `phase`: `approach` (status `accepted`) o `walk` (`in_progress`). El recorrido final muestra **solo `walk`** (decisión tomada con el usuario). |

### Cómo se traza un camino

- **Maps JavaScript API** – `new google.maps.Polyline({ path: [{lat,lng}, ...] })`. Si el camino viene
  como string codificado de Google, `google.maps.geometry.encoding.decodePath(str)` lo convierte en el
  array. Acepta estilos (color, grosor, punteado con `icons`). **Es lo que se usa.**
- **Maps Static API** (lo que usaba la app antes) – una imagen PNG; permite dibujar `path=enc:...` pero
  el resultado es una foto: no se mueve ni se hace zoom. Sirve solo para miniaturas.
- **react-native-maps** – `<Polyline coordinates={...} />`. Descartado: obliga a un dev build (se pierde
  Expo Go) y no funciona en web.
- **Routes API** (`computeRoutes`) – dado origen y destino devuelve `polyline.encodedPolyline`,
  `distanceMeters` y `duration`. Ya lo usaba `maps.service.js`; se reutiliza para la ruta de acercamiento.

### Por qué el mapa interactivo es un WebView con Maps JS

El mapa viejo era una imagen, por eso "0 scrolleable". Para que se pueda mover hace falta un mapa de
verdad. Se comparó:

| Opción | Expo Go | Web | Costo |
|---|---|---|---|
| `react-native-maps` | ❌ requiere dev build | ❌ | mantener 2 implementaciones |
| **Maps JS en `WebView` + `<iframe>` en web** (elegida) | ✅ (`react-native-webview` viene en Expo Go) | ✅ | una sola implementación del mapa, un archivo HTML |

Contra: el mapa corre dentro de un WebView (algo más pesado que nativo) y necesita red para cargar la página.

---

## 2. Qué se implementó

### Backend

| Archivo | Cambio |
|---|---|
| `backend/prisma/schema.prisma` | Modelo `WalkLocationPoint` (`walk_location_point`: `walkId`, `latitude`, `longitude`, `phase`, `recordedAt`, índice `[walkId, recordedAt]`). En `Walk`: `approachPolyline`, `approachDistanceMeters`, `approachDuration`. |
| `backend/prisma/migrations/20261025120000_add_walk_route/migration.sql` | SQL escrito a mano. Se aplicó con `prisma db execute --file ...` + `prisma migrate resolve --applied` (hay drift preexistente en Neon; nunca `migrate dev` — ver `backend/CAMBIOS-BACKEND.md` §5). Nota: esta versión de Prisma (7.8) **ya no acepta `--schema`** en `db execute`; la URL sale de `prisma.config.ts`. |
| `backend/src/services/walks.service.js` | `upsertLocation` ahora, en una transacción, hace el upsert de la última posición **y** inserta un `WalkLocationPoint` (salvo que esté a < 5 m del anterior). Nuevo `computeApproachRoute` y `getWalkRoute`. Helper `haversineMeters`. |
| `backend/src/controllers/walks.controller.js`, `routes/walks.router.js` | `GET /walks/:id/route` (mismo control de participación que `GET /walks/:id`: dueño, paseador asignado o admin). |
| `backend/src/controllers/maps.controller.js`, `routes/maps.router.js` | `GET /maps/embed` sirve la página del mapa. Sin auth: es solo HTML, los datos del paseo le llegan por `postMessage`. Responde 503 si falta `API_KEY_MAPS_JS`. |
| `backend/src/views/walk-map.html` | Página con Google Maps JS: markers, polylines, encuadre automático y botón "Recentrar". |
| `backend/.env.example` | `API_KEY_MAPS_JS`. |

**Ruta de acercamiento (punto 4).** En el primer `PATCH /walks/:id/location` con el paseo en `accepted`,
si el paseo tiene dirección con coordenadas y todavía no hay ruta, el backend llama (sin `await`, para no
frenar la respuesta) a `MapsService.getRoute` con origen = esa primera posición del paseador y destino =
`walk.address`. Guarda polyline, distancia y duración en `Walk` y emite `walk:approach-route` por socket.
Se calcula **una sola vez por paseo**; un `Set` en memoria evita llamadas duplicadas en vuelo y, si Google
falla, el siguiente PATCH reintenta. La ruta queda fija (no se recalcula si el paseador se desvía).

**Eventos / endpoints nuevos**

- `GET /walks/:id/route` → `{ points: [{ latitude, longitude, recordedAt }], distanceMeters }` (solo fase `walk`).
- `GET /maps/embed` → HTML.
- Socket `walk:approach-route` → `{ walkId, approachPolyline, approachDistanceMeters, approachDuration }`.
  El frontend todavía **no** lo escucha: alcanza con el polling de 5 s de `paseo_en_curso` (esos campos
  vienen en `GET /walks/:id`). Queda disponible si se quiere inmediatez.

### Frontend

| Archivo | Cambio |
|---|---|
| `frontend/components/interactive-map.tsx` / `.web.tsx` | `<InteractiveMap data style />`. Nativo: `WebView` (`react-native-webview`, agregado con `expo install`). Web: `<iframe>`. Esperan el mensaje `ready` de la página y le mandan el estado completo con `postMessage`. |
| `frontend/components/interactive-map-types.ts` | Tipo `MapPayload` (contrato con la página). |
| `frontend/components/walk-map.tsx` | Reescrito: usa `InteractiveMap`; dibuja paseador (con badge cuando ya está con el perro), **destino** y ruta de acercamiento. Si todavía no hay ubicación del paseador pero sí destino, igual muestra el mapa. Props nuevas: `destino`, `approachPolyline`, `bottomInset`. |
| `frontend/app/(tabs)/paseo_en_curso.tsx` | Pasa `destino` (de `walk.address`), `approachPolyline` y `bottomInset` (para que el encuadre no deje al paseador debajo de la hoja arrastrable). |
| `frontend/hooks/use-walk-route.ts` | Carga `GET /walks/:id/route` de un paseo finalizado y arma el `MapPayload`; `distanciaLegible()`. |
| `frontend/app/(tabs)/paseo_finalizado.tsx` | El cuadro con la pata (placeholder) ahora es el **mapa del recorrido** real + "Recorrido: X km". Sin puntos o con error muestra un texto en vez de romper. |
| `frontend/app/(tabs)/detalles_del_paseo.tsx` | Se eliminó la ilustración falsa (`ROUTE_DOTS`, parques, agua); "Ruta realizada" muestra el mismo mapa y la distancia. |
| `frontend/api/maps.ts` | Ahora solo `embedMapUrl()`. Se eliminó `staticMapUrl`. |
| `frontend/api/types.ts`, `api/walks.ts` | `Walk.approach*`, `WalkRoute`, `getWalkRoute()`. |

**Lo que se arregló, punto por punto**

- *Destino no aparecía*: el mapa viejo solo ponía un marker en el centro de la imagen (el paseador).
  Ahora hay un marker de casa en `walk.address`.
- *Mapa no movible*: es un mapa de Google real con `gestureHandling: 'greedy'` (un dedo alcanza). Mientras
  el usuario no lo toque, se reencuadra solo para seguir al paseador; apenas lo arrastra o hace zoom deja
  de hacerlo y aparece **Recentrar**.
- *Ruta de acercamiento*: ver arriba; se dibuja punteada entre el paseador y la casa mientras el paseo está
  en `accepted`, y se oculta al arrancar.

**Contrato `postMessage`** (app → página; documentado también en `walk-map.html`). Cada mensaje es el
estado completo; lo que falta se borra:

```json
{
  "walker":  { "lat": -34.6, "lng": -58.4, "conPerro": false },
  "destino": { "lat": -34.6, "lng": -58.4 },
  "approachPolyline": "<encoded polyline>",
  "trail":   [{ "lat": -34.6, "lng": -58.4 }],
  "fit": "auto",
  "padding": { "bottom": 200 }
}
```

La página responde `{"type":"ready"}` cuando Google Maps terminó de cargar.

---

## 3. Antes de probarlo (acciones tuyas)

1. En Google Cloud, habilitar **Maps JavaScript API** en el proyecto.
2. Crear una API key **distinta** de `API_KEY_MAPS` y restringirla a "Maps JavaScript API". Va visible en
   el HTML de `/maps/embed` (no hay forma de ocultarla en un mapa del lado del cliente), por eso no se
   reutiliza la key del backend, que tiene Routes y Places. En producción, restringirla además por HTTP
   referrer al dominio del backend.
3. Agregar `API_KEY_MAPS_JS=...` al `backend/.env`.
4. Para la ruta de acercamiento, la dirección del paseo necesita `latitude`/`longitude`
   (`POST /addresses` ya geocodifica).

## 4. Cómo probarlo

1. `npm run dev` en `backend/`; `npm start` (o `npm run web`) en `frontend/`.
2. Dueño: crear un paseo con dirección. Paseador: aceptarlo.
3. Mandar ubicaciones: la app del paseador (`UbicacionPaseadorProvider`) o
   `node scripts/simulate-location.js --walk-id <id> --email ... --password ...`.
4. Pantalla "Paseo en curso" del dueño: aparecen el paseador, la casa y la ruta punteada; se puede
   arrastrar/zoomear y "Recentrar" vuelve al encuadre.
5. Pasar el paseo a `in_progress`, seguir enviando posiciones, finalizarlo: `paseo_finalizado` y
   `detalles_del_paseo` muestran el recorrido y la distancia. `GET /walks/:id/route` debe devolver solo
   puntos de la fase `walk`.
6. Repetir en Expo Go (Android/iOS) para validar el arrastre con un dedo dentro del WebView.

## 5. Qué quedó afuera / para tener en cuenta

- **No se probó visualmente** (falta la key). Lo que sí se comprobó: tipos, lint, sintaxis, que
  `/maps/embed` inyecta la key y devuelve 503 sin ella, que `/walks/:id/route` exige token, y que la tabla
  y columnas nuevas existen y son legibles desde Prisma.
- **Riesgo conocido**: dentro de un `ScrollView` (`paseo_finalizado`, `detalles_del_paseo`) el gesto de
  arrastrar el mapa puede competir con el scroll vertical de la pantalla, sobre todo en iOS. Hay que
  confirmarlo en dispositivo.
- La ruta de acercamiento no se recalcula si el paseador se desvía (una sola llamada a Routes por paseo).
- Sin **snap to roads**: el recorrido sigue los puntos GPS crudos.
- El mapa no está en la vista del paseador (no se pidió).
- Se mantiene `GET /maps/static` en el backend, aunque el frontend ya no lo usa; se puede borrar junto con
  `verifyTokenFromQuery` si se confirma que nada más lo consume.
- Los paseos finalizados **antes** de este cambio no tienen puntos: muestran "No hay recorrido registrado".

---

## 6. Arreglo de navegación (botón "volver")

**Síntoma:** al terminar un paseo y entrar a "Ver detalle", el botón de volver llevaba otra vez al
paseo (en curso / finalizado) en vez de a Inicio; lo mismo con el botón físico de Android.

**Causa:** `app/(tabs)/_layout.tsx` es un navegador de **Tabs** con `backBehavior="history"`. Los Tabs
no tienen pila, así que `router.replace()` se comporta como `navigate()` y todo el flujo
`crear-paseo → buscando_paseador → paseo_en_curso → paseo_finalizado → detalles_del_paseo` queda en el
historial. `router.back()` retrocedía por ese historial y caía en una pantalla del flujo, que (al ver el
paseo terminado) redirigía de nuevo.

**Arreglo** (`frontend/hooks/use-atras.ts`):

- `useAtrasDelFlujo()` — para las pantallas del flujo. Mira en el historial de los Tabs cuál es la pantalla
  anterior: si es una tab raíz (`index`, `mis-paseos`, `perfil`) vuelve ahí con `router.back()`; si es otra
  pantalla del flujo, va a **Inicio**. Devuelve la función `volver` para los botones y registra el botón
  físico de Android (`BackHandler`) con la misma lógica, solo mientras la pantalla tiene el foco.
  Usado en `paseo_en_curso`, `paseo_finalizado`, `detalles_del_paseo` y `buscando_paseador` (esta última sin
  botón en pantalla, solo el físico).
- `useAtrasEnTabRaiz()` — en `index` (Android: sale de la app), `mis-paseos` y `perfil` (van a Inicio), para
  que el botón físico no caiga en pantallas viejas del historial.
- `paseo_finalizado` → "Ver detalle" ahora usa `router.navigate` en vez de `router.replace` (en Tabs eran
  equivalentes; así el código dice lo que hace).

**Resultado esperado:** desde Inicio o Mis paseos, abrir un paseo y volver regresa a donde estabas; al
terminar un paseo, finalizado → detalle → volver lleva a Inicio; ningún "volver" reabre una pantalla del
flujo. Las pantallas de segundo nivel (`estado_paseador`, `chat` desde el paseo, `mis_perros`, etc.)
siguen usando `router.back()` por historial, que ahí es el comportamiento correcto.

**No se probó en dispositivo** (solo `tsc` y `expo lint`). Depende de que `navigation.getState().history`
esté disponible en el navegador de Tabs; si no lo estuviera, el efecto es seguro: cae en Inicio.
