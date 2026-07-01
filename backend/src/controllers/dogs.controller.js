import DogsService from '../services/dogs.service.js'
const DogsController = {}

DogsController.getAllDogs = async (req, res) => {
    try {
        const dogs = await DogsService.getAllDogs()
        res.status(200).json(dogs)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }   
}

DogsController.getDogsByUser = async (req, res) => {
    const userId = req.params.id
    try {
        const dogs = await DogsService.getDogsByUser(userId)
        if (!dogs) {
            return res.status(404).json({ message: 'Dogs not found' })
        }
        res.status(200).json(dogs)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }   
}

DogsController.getCurrentUserDogs = async (req, res) => {
    const user = req.user
    console.log(user)
    try {
        const dogs = await DogsService.getDogsByUser(user.id)
        if (!dogs) {
            return res.status(404).json({ message: 'Dogs not found' })
        }
        res.status(200).json(dogs)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

DogsController.createDog = async (req, res) => {
    const dogData = req.body
    const user = req.user
    dogData.ownerId = user.id
    try {
        const newDog = await DogsService.createDog(dogData)
        res.status(201).json(newDog)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }   
}

DogsController.updateDog = async (req, res) => {
    const dogId = req.params.id
    const dogData = req.body
    try {
        const updatedDog = await DogsService.updateDog(dogId, dogData)
        if (!updatedDog) {
            return res.status(404).json({ message: 'Dog not found' })
        }
        res.status(200).json(updatedDog)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

DogsController.deleteDog = async (req, res) => {
    const dogId = req.params.id
    try {
        const deletedDog = await DogsService.deleteDog(dogId)
        if (!deletedDog) {
            return res.status(404).json({ message: 'Dog not found' })
        }
        res.status(200).json({ message: 'Dog deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export default DogsController