const DogsService = {}
import prisma from "../../db.js"

DogsService.getAllDogs = async () => {
        const dogs = await prisma.dog.findMany()
        console.log(dogs)
        return dogs
}

DogsService.getDogsByUser = async (userId) => {
    const dogs = await prisma.dog.findMany({
        where: {
            ownerId: parseInt(userId)
        }
    })
    console.log(dogs)
    return dogs
}

DogsService.createDog = async (dogData) => {
    const newDog = await prisma.dog.create({
        data: {
            name: dogData.name,
            breed: dogData.breed,
            age: dogData.age,
            ownerId: dogData.ownerId
        }
    })
    console.log(newDog)
    return newDog
}

DogsService.updateDog = async (dogId, dogData) => {
    const updatedDog = await prisma.dog.update({
        where: {
            id: parseInt(dogId)
        },
        data: {
            name: dogData.name,
            breed: dogData.breed,
            age: dogData.age
        }
    })
    console.log(updatedDog)
    return updatedDog
}

DogsService.deleteDog = async (dogId) => {
    const deletedDog = await prisma.dog.delete({
        where: {
            id: parseInt(dogId)
        }
    })
    console.log(deletedDog)
    return deletedDog
}

export default DogsService