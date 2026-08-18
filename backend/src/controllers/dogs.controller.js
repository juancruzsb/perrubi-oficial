import DogsService from '../services/dogs.service.js';
import asyncHandler from '../utils/async-handler.js';
import HttpError from '../utils/http-error.js';

const DogsController = {};

DogsController.getAllDogs = asyncHandler(async (req, res) => {
  const dogs = await DogsService.getAllDogs();
  res.status(200).json(dogs);
});

DogsController.getDogsByUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const dogs = await DogsService.getDogsByUser(userId);
  res.status(200).json(dogs);
});

DogsController.getCurrentUserDogs = asyncHandler(async (req, res) => {
  const dogs = await DogsService.getDogsByUser(req.user.id);
  res.status(200).json(dogs);
});

DogsController.createDog = asyncHandler(async (req, res) => {
  const dogData = req.body;

  if (!dogData.name) {
    throw new HttpError(400, 'El nombre del perro es obligatorio');
  }

  const newDog = await DogsService.createDog(dogData, req.user.id);
  res.status(201).json(newDog);
});

DogsController.updateDog = asyncHandler(async (req, res) => {
  const dogId = req.params.id;
  const dogData = req.body;

  if (req.user.role !== 'admin') {
    const owns = await DogsService.userOwnsDog(req.user.id, dogId);
    if (!owns) {
      throw new HttpError(403, 'No tenés permiso para modificar este perro');
    }
  }

  const updatedDog = await DogsService.updateDog(dogId, dogData);
  res.status(200).json(updatedDog);
});

DogsController.deleteDog = asyncHandler(async (req, res) => {
  const dogId = req.params.id;

  if (req.user.role !== 'admin') {
    const owns = await DogsService.userOwnsDog(req.user.id, dogId);
    if (!owns) {
      throw new HttpError(403, 'No tenés permiso para borrar este perro');
    }
  }

  await DogsService.deleteDog(dogId);
  res.status(200).json({ message: 'Dog deleted successfully' });
});

export default DogsController;
