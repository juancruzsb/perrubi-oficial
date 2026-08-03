import prisma from "../../db.js";
import HttpError from "../utils/http-error.js";

const WalksService = {};

// Máquina de estados: qué transiciones son válidas desde cada status.
const ALLOWED_TRANSITIONS = {
  searching: ['canceled'],
  accepted: ['in_progress', 'canceled'],
  in_progress: ['finished'],
  finished: [],
  canceled: [],
};

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
  // Update condicionado por status: si dos paseadores intentan aceptar
  // el mismo paseo al mismo tiempo, solo uno gana la carrera (count === 0 para el otro).
  const result = await prisma.walk.updateMany({
    where: { id: parseInt(walkId), status: 'searching' },
    data: { walkerId: parseInt(walkerId), status: 'accepted' },
  });

  if (result.count === 0) {
    throw new HttpError(409, 'El paseo ya no está disponible para aceptar');
  }

  return WalksService.getWalkById(walkId);
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

  return prisma.walk.update({
    where: { id: walk.id },
    data,
    include: WALK_INCLUDE,
  });
};

export default WalksService;
