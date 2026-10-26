import prisma from "../../db.js";
import HttpError from "../utils/http-error.js";
import ChatService from "./chat.service.js";
import MapsService from "./maps.service.js";
import { toIntOrNull } from "../utils/sanitize.js";
import { emitToWalk } from "../sockets/index.js";

const WalksService = {};

// Máquina de estados: qué transiciones son válidas desde cada status.
const ALLOWED_TRANSITIONS = {
  searching: ['canceled'],
  accepted: ['in_progress', 'canceled'],
  in_progress: ['finished'],
  finished: [],
  canceled: [],
};

// Estados sin transiciones salientes: son los estados finales de un paseo.
const FINAL_STATUSES = Object.keys(ALLOWED_TRANSITIONS).filter(
  (status) => ALLOWED_TRANSITIONS[status].length === 0
);

const WALK_INCLUDE = {
  walker: {
    // description/reviewCount se suman para que estado_paseador.tsx (bio +
    // cantidad de reseñas) tenga de dónde sacar datos reales en vez de
    // mockeados — ambos campos ya existían en el modelo Walker, no son
    // sensibles (no es passwordHash ni email), y esta query ya está detrás
    // de verifyToken + el chequeo de participación en el paseo.
    select: {
      id: true,
      firstName: true,
      lastName: true,
      averageRating: true,
      profilePicture: true,
      description: true,
      reviewCount: true,
    },
  },
  address: true,
  dogs: { include: { dog: true } },
  users: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
  location: true,
};

// Estados en los que tiene sentido que el paseador esté mandando su
// posición: 'accepted' cubre el trayecto de acercamiento a buscar al perro,
// no solo el paseo en sí.
const LOCATION_TRACKABLE_STATUSES = ['accepted', 'in_progress'];

WalksService.userOwnsAllDogs = async (userId, dogIds) => {
  const count = await prisma.userDog.count({
    where: {
      userId: parseInt(userId),
      dogId: { in: dogIds.map((id) => parseInt(id)) },
    },
  });
  return count === dogIds.length;
};

// Mismo patrón que userOwnsAllDogs: evita que un usuario adjunte a su paseo
// el addressId de otro usuario (y se filtre esa dirección vía GET /walks/:id).
WalksService.userOwnsAddress = async (userId, addressId) => {
  const address = await prisma.address.findFirst({
    where: { id: parseInt(addressId), userId: parseInt(userId) },
    select: { id: true },
  });
  return Boolean(address);
};

WalksService.createWalk = async (userId, data) => {
  const dogIds = (data.dogIds || []).map((id) => parseInt(id));

  const newWalk = await prisma.walk.create({
    data: {
      walkType: data.walkType,
      status: 'searching',
      startTime: data.startTime ? new Date(data.startTime) : null,
      duration: data.duration ? parseInt(data.duration) : null,
      notes: data.notes ?? null,
      addressId: data.addressId != null ? parseInt(data.addressId) : null,
      dogs: {
        create: dogIds.map((dogId) => ({ dog: { connect: { id: dogId } } })),
      },
      users: {
        create: { user: { connect: { id: parseInt(userId) } } },
      },
    },
    include: WALK_INCLUDE,
  });

  return newWalk;
};

WalksService.getWalksForUser = async (userId) => {
  const walkUsers = await prisma.walkUser.findMany({
    where: { userId: parseInt(userId) },
    include: { walk: { include: WALK_INCLUDE } },
    orderBy: { walk: { createdAt: 'desc' } },
  });
  return walkUsers.map((wu) => wu.walk);
};

WalksService.getWalksForWalker = async (walkerId) => {
  return prisma.walk.findMany({
    where: { walkerId: parseInt(walkerId) },
    include: WALK_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
};

WalksService.getAvailableWalks = async () => {
  return prisma.walk.findMany({
    where: { status: 'searching' },
    include: WALK_INCLUDE,
    orderBy: { createdAt: 'asc' },
  });
};

WalksService.getAllWalks = async () => {
  return prisma.walk.findMany({
    include: WALK_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
};

WalksService.getWalkById = async (walkId) => {
  return prisma.walk.findUnique({
    where: { id: parseInt(walkId) },
    include: WALK_INCLUDE,
  });
};

WalksService.userParticipatesInWalk = async (walkId, userId) => {
  const walkUser = await prisma.walkUser.findFirst({
    where: { walkId: parseInt(walkId), userId: parseInt(userId) },
  });
  return Boolean(walkUser);
};

WalksService.updateWalk = async (walkId, data) => {
  return prisma.walk.update({
    where: { id: parseInt(walkId) },
    data: {
      walkType: data.walkType,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      duration: data.duration ? parseInt(data.duration) : undefined,
      notes: data.notes !== undefined ? data.notes : undefined,
      addressId: data.addressId !== undefined ? toIntOrNull(data.addressId) : undefined,
    },
    include: WALK_INCLUDE,
  });
};

WalksService.acceptWalk = async (walkId, walkerId) => {
  const id = parseInt(walkId);

  // El update queda condicionado a status: 'searching' para que, si dos
  // paseadores aceptan a la vez, solo uno gane la carrera; el chat se abre
  // en la misma transacción, así que nunca queda un chat sin ganador.
  await prisma.$transaction(async (tx) => {
    const result = await tx.walk.updateMany({
      where: { id, status: 'searching' },
      data: { walkerId: parseInt(walkerId), status: 'accepted' },
    });

    if (result.count === 0) {
      throw new HttpError(409, 'El paseo ya no está disponible para aceptar');
    }

    await ChatService.openForWalk(tx, id);
  });

  return WalksService.getWalkById(id);
};

WalksService.changeStatus = async (walk, newStatus) => {
  const currentStatus = walk.status || 'searching';
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(newStatus)) {
    throw new HttpError(400, `No se puede pasar de '${currentStatus}' a '${newStatus}'`);
  }

  const data = { status: newStatus };

  if (newStatus === 'in_progress') {
    data.startTime = new Date();
  }

  if (newStatus === 'finished') {
    const endTime = new Date();
    data.endTime = endTime;
    if (walk.startTime) {
      data.duration = Math.round((endTime.getTime() - new Date(walk.startTime).getTime()) / 60000);
    }
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.walk.update({
      where: { id: walk.id },
      data,
      include: WALK_INCLUDE,
    });

    // Estados finales (finished/canceled): el chat del paseo se cierra en modo
    // lectura junto con la actualización del paseo. updateMany es idempotente:
    // no falla si el paseo nunca llegó a tener chat (ej. canceled desde searching).
    if (FINAL_STATUSES.includes(newStatus)) {
      await ChatService.closeForWalk(tx, walk.id);
    }

    return updated;
  });
};

// Distancia mínima (m) respecto de la última posición para sumar un punto al
// historial: el GPS parado "tiembla" unos metros y sin esto el recorrido se
// llena de puntos inútiles.
const MIN_POINT_DISTANCE_METERS = 5;

// Distancia en metros entre dos coordenadas (fórmula de haversine).
const haversineMeters = (a, b) => {
  const R = 6371000;
  const rad = (deg) => (deg * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

// walkIds con un cálculo de ruta de acercamiento en vuelo: evita llamar dos
// veces a la Routes API si llegan PATCH seguidos antes de que termine la 1ª.
const approachRouteInFlight = new Set();

// Calcula y guarda la ruta caminable desde la primera ubicación del paseador
// hasta la dirección del paseo (Routes API, vía MapsService.getRoute). Una
// sola vez por paseo. Nunca lanza: si falla queda en null y el siguiente
// PATCH de ubicación reintenta.
WalksService.computeApproachRoute = async (walk, origin) => {
  if (approachRouteInFlight.has(walk.id)) return;
  approachRouteInFlight.add(walk.id);

  try {
    const route = await MapsService.getRoute({
      origin: { location: { latLng: origin } },
      destination: {
        location: { latLng: { latitude: walk.address.latitude, longitude: walk.address.longitude } },
      },
    });

    const best = route.routes?.[0];
    if (!best?.polyline?.encodedPolyline) return;

    const updated = await prisma.walk.update({
      where: { id: walk.id },
      data: {
        approachPolyline: best.polyline.encodedPolyline,
        approachDistanceMeters: best.distanceMeters ?? null,
        approachDuration: best.duration ?? null,
      },
      select: { approachPolyline: true, approachDistanceMeters: true, approachDuration: true },
    });

    emitToWalk(walk.id, 'walk:approach-route', { walkId: walk.id, ...updated });
  } catch (err) {
    console.error(`No se pudo calcular la ruta de acercamiento del paseo ${walk.id}:`, err.message);
  } finally {
    approachRouteInFlight.delete(walk.id);
  }
};

// Guarda la ÚLTIMA posición conocida del paseador (upsert), suma un punto al
// historial para poder dibujar el recorrido después, y avisa por socket a
// quien esté mirando este paseo. Se llama desde el controller ya con el walk
// (evita un segundo findUnique) y las coordenadas ya validadas.
WalksService.upsertLocation = async (walk, { latitude, longitude }) => {
  const currentStatus = walk.status || 'searching';

  if (!LOCATION_TRACKABLE_STATUSES.includes(currentStatus)) {
    throw new HttpError(409, 'El paseo no está en curso');
  }

  const movedEnough =
    !walk.location ||
    haversineMeters(walk.location, { latitude, longitude }) >= MIN_POINT_DISTANCE_METERS;
  const phase = currentStatus === 'in_progress' ? 'walk' : 'approach';

  const [location] = await prisma.$transaction([
    prisma.walkLocation.upsert({
      where: { walkId: walk.id },
      create: { walkId: walk.id, latitude, longitude },
      update: { latitude, longitude },
    }),
    ...(movedEnough
      ? [prisma.walkLocationPoint.create({ data: { walkId: walk.id, latitude, longitude, phase } })]
      : []),
  ]);

  // Sin await: no frena la respuesta del PATCH por una llamada a Google.
  if (
    currentStatus === 'accepted' &&
    !walk.approachPolyline &&
    walk.address?.latitude != null &&
    walk.address?.longitude != null
  ) {
    WalksService.computeApproachRoute(walk, { latitude, longitude });
  }

  emitToWalk(walk.id, 'walk:location', {
    walkId: walk.id,
    latitude: location.latitude,
    longitude: location.longitude,
    updatedAt: location.updatedAt,
  });

  return location;
};

// Recorrido hecho durante el paseo (solo fase 'walk', no el acercamiento) para
// dibujarlo al final. distanceMeters es la suma de tramos entre puntos.
WalksService.getWalkRoute = async (walkId) => {
  const rows = await prisma.walkLocationPoint.findMany({
    where: { walkId: parseInt(walkId), phase: 'walk' },
    orderBy: { recordedAt: 'asc' },
    select: { latitude: true, longitude: true, recordedAt: true },
  });

  let distanceMeters = 0;
  for (let i = 1; i < rows.length; i++) {
    distanceMeters += haversineMeters(rows[i - 1], rows[i]);
  }

  return { points: rows, distanceMeters: Math.round(distanceMeters) };
};

export default WalksService;
