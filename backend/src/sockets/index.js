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

    // walk:join/leave — genéricos, separados de chat:join a propósito:
    // paseo_en_curso.tsx quiere la ubicación en vivo sin depender de que el
    // chat esté abierto (assertParticipant solo exige participar del walk,
    // no que exista un Chat). Misma room que el chat (walk:<id>) — unirse a
    // las dos no duplica nada, socket.io las trata como un set.
    socket.on('walk:join', async ({ walkId } = {}, callback = () => {}) => {
      try {
        const walk = await WalksService.getWalkById(walkId);

        if (!walk) {
          return callback({ error: 'Paseo no encontrado' });
        }

        await ChatService.assertParticipant(walk, socket.data.user);

        socket.join(walkRoom(walkId));
        callback({ ok: true });
      } catch (error) {
        callback({ error: error.message || 'No se pudo unir al paseo' });
      }
    });

    socket.on('walk:leave', ({ walkId } = {}) => {
      socket.leave(walkRoom(walkId));
    });
  });

  return io;
};

export const emitToWalk = (walkId, event, payload) => {
  if (!io) return;
  io.to(walkRoom(walkId)).emit(event, payload);
};
