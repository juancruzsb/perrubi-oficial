import ChatService from '../services/chat.service.js';
import asyncHandler from '../utils/async-handler.js';

const ChatController = {};

ChatController.getChat = asyncHandler(async (req, res) => {
  const chat = await ChatService.getChatWithMessages(req.walk.id, req.query);
  res.status(200).json(chat);
});

ChatController.sendMessage = asyncHandler(async (req, res) => {
  const message = await ChatService.sendMessage(req.walk.id, req.user, req.body.body);
  res.status(201).json(message);
});

ChatController.markRead = asyncHandler(async (req, res) => {
  const result = await ChatService.markRead(req.walk.id, req.user);
  res.status(200).json(result);
});

export default ChatController;
