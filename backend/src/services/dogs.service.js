import prisma from "../../db.js";

const DogsService = {};

DogsService.getAllDogs = async () => {
  const dogs = await prisma.dog.findMany({
    include: {
      users: {
        include: {
          user: true, 
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

DogsService.createDog = async (dogData) => {
  const newDog = await prisma.dog.create({
    data: {
      name: dogData.name,
      breed: dogData.breed,
      age: parseInt(dogData.age) || null,
      gender: dogData.gender,
      weight: parseFloat(dogData.weight) || null,
      extraNotes: dogData.extraNotes,
      photo: dogData.photo,
      users: {
        create: {
          userId: parseInt(dogData.ownerId),
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
      age: dogData.age ? parseInt(dogData.age) : undefined,
      gender: dogData.gender,
      weight: dogData.weight ? parseFloat(dogData.weight) : undefined,
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