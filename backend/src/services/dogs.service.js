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

export default DogsService