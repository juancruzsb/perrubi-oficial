import { Router } from 'express'
import AuthMiddlewares from '../middlewares/auth.middlewares.js'
import ChatController from '../controllers/chat.controller.js'
import ChatService from '../services/chat.service.js'
import WalksService from '../services/walks.service.js'
import asyncHandler from '../utils/async-handler.js'
import HttpError from '../utils/http-error.js'

const router = Router();

// Carga el paseo y valida que quien pide sea uno de sus dos participantes
// (el paseador asignado o el usuario dueño), reusando la misma lógica que
// ya usa /walks/:id para no duplicar el chequeo de autorización.
const requireWalkParticipant = asyncHandler(async (req, res, next) => {
  const walk = await WalksService.getWalkById(req.params.id);

  if (!walk) {
    throw new HttpError(404, 'Paseo no encontrado');
  }

  await ChatService.assertParticipant(walk, req.user);

  req.walk = walk;
  next();
});

router.get('/:id/chat', AuthMiddlewares.verifyToken, requireWalkParticipant, ChatController.getChat)
router.post('/:id/chat/messages', AuthMiddlewares.verifyToken, requireWalkParticipant, ChatController.sendMessage)
router.patch('/:id/chat/read', AuthMiddlewares.verifyToken, requireWalkParticipant, ChatController.markRead)

export default router;
