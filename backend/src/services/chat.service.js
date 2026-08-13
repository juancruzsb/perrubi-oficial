import prisma from "../../db.js";
import HttpError from "../utils/http-error.js";
import WalksService from "./walks.service.js";
import { emitToWalk } from "../sockets/index.js";

const ChatService = {};

const MAX_BODY_LENGTH = 1000;
const DEFAULT_PAGE_SIZE = 50;

ChatService.assertParticipant = async (walk, user) => {
  const isAssignedWalker = user.type === 'walker' && walk.walkerId === user.id;
  const participates = user.type === 'user' && await WalksService.userParticipatesInWalk(walk.id, user.id);

  if (!isAssignedWalker && !participates) {
    throw new HttpError(403, 'No participás de este paseo');
  }
};

ChatService.getChatByWalkId = async (walkId) => {
  return prisma.chat.findUnique({ where: { walkId: parseInt(walkId) } });
};

ChatService.getChatWithMessages = async (walkId, { before, limit } = {}) => {
  const chat = await ChatService.getChatByWalkId(walkId);

  if (!chat) {
    throw new HttpError(404, 'Este paseo todavía no tiene un chat (falta que un paseador lo acepte)');
  }

  const take = Math.min(parseInt(limit) || DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE);

  const messages = await prisma.chatMessage.findMany({
    where: {
      chatId: chat.id,
      ...(before ? { id: { lt: parseInt(before) } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take,
  });

  return { ...chat, messages: messages.reverse() };
};

ChatService.sendMessage = async (walkId, sender, body) => {
  const trimmed = (body || '').trim();

  if (!trimmed) {
    throw new HttpError(400, 'El mensaje no puede estar vacío');
  }

  if (trimmed.length > MAX_BODY_LENGTH) {
    throw new HttpError(400, `El mensaje no puede superar los ${MAX_BODY_LENGTH} caracteres`);
  }

  const chat = await ChatService.getChatByWalkId(walkId);

  if (!chat) {
    throw new HttpError(404, 'Este paseo todavía no tiene un chat (falta que un paseador lo acepte)');
  }

  if (chat.status !== 'open') {
    throw new HttpError(409, 'El chat de este paseo ya está cerrado');
  }

  const message = await prisma.chatMessage.create({
    data: {
      chatId: chat.id,
      senderType: sender.type,
      senderId: sender.id,
      body: trimmed,
    },
  });

  emitToWalk(walkId, 'chat:message', message);

  return message;
};

ChatService.markRead = async (walkId, reader) => {
  const chat = await ChatService.getChatByWalkId(walkId);

  if (!chat) {
    throw new HttpError(404, 'Este paseo todavía no tiene un chat (falta que un paseador lo acepte)');
  }

  const result = await prisma.chatMessage.updateMany({
    where: {
      chatId: chat.id,
      senderType: { not: reader.type },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  if (result.count > 0) {
    emitToWalk(walkId, 'chat:read', { by: reader.type });
  }

  return { updated: result.count };
};

// Llamado desde WalksService al aceptar (crea) o finalizar/cancelar (cierra) un paseo.
ChatService.openForWalk = (tx, walkId) => {
  return tx.chat.create({ data: { walkId } });
};

ChatService.closeForWalk = async (tx, walkId) => {
  const result = await tx.chat.updateMany({
    where: { walkId, status: 'open' },
    data: { status: 'closed', closedAt: new Date() },
  });

  if (result.count > 0) {
    emitToWalk(walkId, 'chat:closed', { walkId });
  }
};

export default ChatService;
