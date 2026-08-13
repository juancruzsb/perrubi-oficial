import prisma from "../../db.js";
import HttpError from "../utils/http-error.js";
import ChatService from "./chat.service.js";

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
    select: { id: true, firstName: true, lastName: true, averageRating: true, profilePicture: true },
  },
  dogs: { include: { dog: true } },
  users: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
};

WalksService.userOwnsAllDogs = async (userId, dogIds) => {
  const count = await prisma.userDog.count({
    where: {
      userId: parseInt(userId),
      dogId: { in: dogIds.map((id) => parseInt(id)) },
    },
  });
  return count === dogIds.length;
};

WalksService.createWalk = async (userId, data) => {
  const dogIds = (data.dogIds || []).map((id) => parseInt(id));

  const newWalk = await prisma.walk.create({
    data: {
      walkType: data.walkType,
      status: 'searching',
      startTime: data.startTime ? new Date(data.startTime) : null,
      duration: data.duration ? parseInt(data.duration) : null,
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

export default WalksService;
