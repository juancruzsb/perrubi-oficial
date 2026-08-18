import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import ChatService from '../services/chat.service.js';
import WalksService from '../services/walks.service.js';

let io = null;

const walkRoom = (walkId) => `walk:${walkId}`;

const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('No llego ninguna token en el handshake'));
  }

  try {
    socket.data.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    next(new Error('Unauthorized'));
  }
};

export const initSockets = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    socket.on('chat:join', async ({ walkId } = {}, callback = () => {}) => {
      try {
        const walk = await WalksService.getWalkById(walkId);

        if (!walk) {
          return callback({ error: 'Paseo no encontrado' });
        }

        await ChatService.assertParticipant(walk, socket.data.user);

        socket.join(walkRoom(walkId));
        callback({ ok: true });
      } catch (error) {
        callback({ error: error.message || 'No se pudo unir al chat' });
      }
    });

    socket.on('chat:leave', ({ walkId } = {}) => {
      socket.leave(walkRoom(walkId));
    });
  });

  return io;
};

export const emitToWalk = (walkId, event, payload) => {
  if (!io) return;
  io.to(walkRoom(walkId)).emit(event, payload);
};
