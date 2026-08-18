import WalksService from '../services/walks.service.js';
import asyncHandler from '../utils/async-handler.js';
import HttpError from '../utils/http-error.js';

const WalksController = {};

WalksController.createWalk = asyncHandler(async (req, res) => {
  const { dogIds, walkType, startTime, duration, notes, addressId } = req.body;

  if (!Array.isArray(dogIds) || dogIds.length === 0) {
    throw new HttpError(400, 'dogIds es obligatorio y debe ser un array no vacío');
  }

  const ownsAll = await WalksService.userOwnsAllDogs(req.user.id, dogIds);
  if (!ownsAll) {
    throw new HttpError(403, 'Alguno de los perros no te pertenece');
  }

  if (addressId != null) {
    const ownsAddress = await WalksService.userOwnsAddress(req.user.id, addressId);
    if (!ownsAddress) {
      throw new HttpError(403, 'Esa dirección no te pertenece');
    }
  }

  // Bug corregido: antes se validaba la propiedad de dogIds pero nunca se
  // pasaba al service, así que todo paseo quedaba creado con dogs: [] para
  // siempre (ver INTEGRACION-BACKEND-FRONTEND.md).
  const walk = await WalksService.createWalk(req.user.id, { dogIds, walkType, startTime, duration, notes, addressId });
  res.status(201).json(walk);
});

WalksController.getMyWalks = asyncHandler(async (req, res) => {
  const walks = req.user.type === 'walker'
    ? await WalksService.getWalksForWalker(req.user.id)
    : await WalksService.getWalksForUser(req.user.id);

  res.status(200).json(walks);
});

WalksController.getAvailableWalks = asyncHandler(async (req, res) => {
  const walks = await WalksService.getAvailableWalks();
  res.status(200).json(walks);
});

WalksController.getAllWalks = asyncHandler(async (req, res) => {
  const walks = await WalksService.getAllWalks();
  res.status(200).json(walks);
});

WalksController.getWalkById = asyncHandler(async (req, res) => {
  const walk = await WalksService.getWalkById(req.params.id);

  if (!walk) {
    throw new HttpError(404, 'Paseo no encontrado');
  }

  const isAdmin = req.user.role === 'admin';
  const isAssignedWalker = req.user.type === 'walker' && walk.walkerId === req.user.id;
  const participates = req.user.type === 'user' && await WalksService.userParticipatesInWalk(walk.id, req.user.id);

  if (!isAdmin && !isAssignedWalker && !participates) {
    throw new HttpError(403, 'No participás de este paseo');
  }

  res.status(200).json(walk);
});

WalksController.updateWalk = asyncHandler(async (req, res) => {
  const walk = await WalksService.getWalkById(req.params.id);

  if (!walk) {
    throw new HttpError(404, 'Paseo no encontrado');
  }

  const participates = await WalksService.userParticipatesInWalk(walk.id, req.user.id);
  if (!participates) {
    throw new HttpError(403, 'No participás de este paseo');
  }

  if (walk.status !== 'searching') {
    throw new HttpError(400, 'Solo se puede editar un paseo mientras está en búsqueda');
  }

  if (req.body.addressId != null) {
    const ownsAddress = await WalksService.userOwnsAddress(req.user.id, req.body.addressId);
    if (!ownsAddress) {
      throw new HttpError(403, 'Esa dirección no te pertenece');
    }
  }

  const updated = await WalksService.updateWalk(walk.id, req.body);
  res.status(200).json(updated);
});

WalksController.acceptWalk = asyncHandler(async (req, res) => {
  const updated = await WalksService.acceptWalk(req.params.id, req.user.id);
  res.status(200).json(updated);
});

WalksController.changeStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    throw new HttpError(400, 'status es obligatorio');
  }

  const walk = await WalksService.getWalkById(req.params.id);

  if (!walk) {
    throw new HttpError(404, 'Paseo no encontrado');
  }

  const isAssignedWalker = req.user.type === 'walker' && walk.walkerId === req.user.id;
  const participates = req.user.type === 'user' && await WalksService.userParticipatesInWalk(walk.id, req.user.id);

  if (!isAssignedWalker && !participates) {
    throw new HttpError(403, 'No participás de este paseo');
  }

  const updated = await WalksService.changeStatus(walk, status);
  res.status(200).json(updated);
});

export default WalksController;
