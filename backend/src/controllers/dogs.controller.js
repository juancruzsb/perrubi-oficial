import DogsService from '../services/dogs.service.js';

const DogsController = {};

DogsController.getAllDogs = async (req, res) => {
  try {
    const dogs = await DogsService.getAllDogs();
    res.status(200).json(dogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

DogsController.getDogsByUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const dogs = await DogsService.getDogsByUser(userId);
    if (!dogs || dogs.length === 0) {
      return res.status(404).json({ message: 'No dogs found for this user' });
    }
    res.status(200).json(dogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

DogsController.getCurrentUserDogs = async (req, res) => {
  const user = req.user;
  
  if (!user || !user.id) {
     return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const dogs = await DogsService.getDogsByUser(user.id);
    if (!dogs || dogs.length === 0) {
      return res.status(404).json({ message: 'No dogs found for this user' });
    }
    res.status(200).json(dogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

DogsController.createDog = async (req, res) => {
  const dogData = req.body;
  const user = req.user;
  
  if (!user || !user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  dogData.ownerId = user.id;

  try {
    const newDog = await DogsService.createDog(dogData);
    res.status(201).json(newDog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

DogsController.updateDog = async (req, res) => {
  const dogId = req.params.id;
  const dogData = req.body;
  
  try {
    const updatedDog = await DogsService.updateDog(dogId, dogData);
    res.status(200).json(updatedDog);
  } catch (error) {
    if (error.code === 'P2025') {
       return res.status(404).json({ message: 'Dog not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

DogsController.deleteDog = async (req, res) => {
  const dogId = req.params.id;
  try {
    await DogsService.deleteDog(dogId);
    res.status(200).json({ message: 'Dog deleted successfully' });
  } catch (error) {
     if (error.code === 'P2025') {
       return res.status(404).json({ message: 'Dog not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

export default DogsController;