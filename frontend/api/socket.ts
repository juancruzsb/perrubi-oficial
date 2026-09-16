// api/socket.ts
// Singleton de Socket.IO, mismo espíritu que client.ts: no importa React ni
// el router. Una sola conexión para toda la app; lo que cambia es a qué
// room (walk:<id>) te unís vía joinWalkChat/leaveWalkChat.
//
// Los sockets del backend son READ-ONLY (sockets/index.js no tiene ningún
// handler que reciba texto) — escribir SIEMPRE por REST (api/chat.ts).
import { io, type Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import { BASE_URL } from './client';
import { obtenerToken } from './session';

let socket: Socket | null = null;

// Conexión perezosa: recién arma el socket la primera vez que hace falta
// (no al importar el módulo), y con el token vigente en ese momento.
export async function getSocket(): Promise<Socket | null> {
  const token = await obtenerToken();
  if (!token) return null;

  if (socket && socket.connected) return socket;

  if (!socket) {
    socket = io(BASE_URL, {
      autoConnect: false,
      auth: { token },
      // En nativo, saltear el fallback de long-polling XHR (da problemas en RN).
      transports: Platform.OS === 'web' ? undefined : ['websocket'],
      reconnectionAttempts: 3,
    });
  } else {
    // Token pudo haber cambiado (login con otro usuario) desde la última vez.
    socket.auth = { token };
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

// Se llama desde context/session.tsx: al cerrar sesión (o al ser expulsado
// por un 401) no debe quedar un socket autenticado como el usuario anterior.
export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function isSocketConnected(): boolean {
  return Boolean(socket?.connected);
}

type JoinAck = { ok: true } | { error: string };

// chat:join / walk:join esperan un ack — { ok: true } o { error: string }. Si
// el server no contesta en 5s (caído, o el evento se perdió), tratamos como
// error para que el caller pueda degradar a polling en vez de esperar para
// siempre. Compartido por joinWalkChat y joinWalk: mismo evento de ack, solo
// cambia el nombre del evento emitido.
function emitJoin(socket: Socket, event: string, walkId: number): Promise<JoinAck> {
  return new Promise((resolve) => {
    let resuelto = false;
    const timeout = setTimeout(() => {
      if (!resuelto) {
        resuelto = true;
        resolve({ error: 'Tiempo de espera agotado' });
      }
    }, 5000);

    socket.emit(event, { walkId }, (res: JoinAck) => {
      if (resuelto) return;
      resuelto = true;
      clearTimeout(timeout);
      resolve(res);
    });
  });
}

export function joinWalkChat(socket: Socket, walkId: number): Promise<JoinAck> {
  return emitJoin(socket, 'chat:join', walkId);
}

export function leaveWalkChat(socket: Socket, walkId: number): void {
  socket.emit('chat:leave', { walkId });
}

// walk:join/leave — separados de chat:join a propósito: paseo_en_curso.tsx
// quiere la ubicación en vivo sin depender de que el chat esté abierto (ver
// sockets/index.js del backend). Misma room walk:<id> que el chat.
export function joinWalk(socket: Socket, walkId: number): Promise<JoinAck> {
  return emitJoin(socket, 'walk:join', walkId);
}

export function leaveWalk(socket: Socket, walkId: number): void {
  socket.emit('walk:leave', { walkId });
}
