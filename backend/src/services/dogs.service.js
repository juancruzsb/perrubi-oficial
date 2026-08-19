import prisma from "../../db.js";
import { toIntOrNull, toFloatOrNull } from "../utils/sanitize.js";

const DogsService = {};

DogsService.getAllDogs = async () => {
  // select explícito (en vez de user: true) para no filtrar passwordHash —
  // include:{user:true} devolvía el User completo, hash incluido.
  const dogs = await prisma.dog.findMany({
    include: {
      users: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
  });
  return dogs;
};

DogsService.getDogsByUser = async (userId) => {
  const userDogs = await prisma.userDog.findMany({
    where: {
      userId: parseInt(userId),
    },
    include: {
      dog: true,
    },
  });

  const dogs = userDogs.map((ud) => ud.dog);
  return dogs;
};

DogsService.userOwnsDog = async (userId, dogId) => {
  const userDog = await prisma.userDog.findFirst({
    where: {
      userId: parseInt(userId),
      dogId: parseInt(dogId),
    },
  });
  return Boolean(userDog);
};

DogsService.createDog = async (dogData, ownerId) => {
  const newDog = await prisma.dog.create({
    data: {
      name: dogData.name,
      breed: dogData.breed,
      age: toIntOrNull(dogData.age),
      gender: dogData.gender,
      weight: toFloatOrNull(dogData.weight),
      extraNotes: dogData.extraNotes,
      photo: dogData.photo,
      users: {
        create: {
          userId: parseInt(ownerId),
        },
      },
    },
    include: {
      users: true,
    },
  });
  return newDog;
};

DogsService.updateDog = async (dogId, dogData) => {
  const updatedDog = await prisma.dog.update({
    where: {
      id: parseInt(dogId),
    },
    data: {
      name: dogData.name,
      breed: dogData.breed,
      age: dogData.age !== undefined ? toIntOrNull(dogData.age) : undefined,
      gender: dogData.gender,
      weight: dogData.weight !== undefined ? toFloatOrNull(dogData.weight) : undefined,
      extraNotes: dogData.extraNotes,
      photo: dogData.photo,
    },
  });
  return updatedDog;
};

DogsService.deleteDog = async (dogId) => {
  const deletedDog = await prisma.dog.delete({
    where: {
      id: parseInt(dogId),
    },
  });
  return deletedDog;
};

export default DogsService;
