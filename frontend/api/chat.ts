// api/chat.ts
import { apiRequest } from './client';
import type { Chat, ChatMessage } from './types';

// GET /walks/:id/chat — historial del chat de un paseo.
// El chat recién existe una vez que un paseador acepta el paseo
// (PATCH /walks/:id/accept lo crea) — hasta entonces esto tira 404 con
// el mensaje "Este paseo todavía no tiene un chat (falta que un paseador
// lo acepte)", ya listo para mostrar tal cual (ApiError.message).
export function getChat(
  walkId: number,
  opts?: { before?: number; limit?: number }
): Promise<Chat> {
  const params = new URLSearchParams();
  if (opts?.before != null) params.set('before', String(opts.before));
  if (opts?.limit != null) params.set('limit', String(opts.limit));
  const query = params.toString();
  return apiRequest<Chat>(`/walks/${walkId}/chat${query ? `?${query}` : ''}`);
}

// POST /walks/:id/chat/messages — único camino de escritura. Los sockets
// del backend son read-only (solo emiten chat:message/chat:read/chat:closed,
// no tienen ningún handler que reciba texto) — ver sockets/index.js.
// 409 si el chat ya está cerrado (paseo en estado final).
export function sendMessage(walkId: number, body: string): Promise<ChatMessage> {
  return apiRequest<ChatMessage>(`/walks/${walkId}/chat/messages`, {
    method: 'POST',
    body: { body },
  });
}

// PATCH /walks/:id/chat/read — marca como leídos los mensajes del otro
// participante (dueño o paseador, según quién llame).
export function markRead(walkId: number): Promise<{ updated: number }> {
  return apiRequest<{ updated: number }>(`/walks/${walkId}/chat/read`, { method: 'PATCH' });
}
