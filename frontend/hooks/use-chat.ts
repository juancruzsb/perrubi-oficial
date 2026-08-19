// hooks/use-chat.ts
// Ciclo de vida completo del chat de un paseo: carga inicial por REST,
// tiempo real por Socket.IO con fallback a polling si el socket no conecta,
// y envío siempre por REST (los sockets del backend son read-only).
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getChat, markRead, sendMessage } from '../api/chat';
import { getSocket, joinWalkChat, leaveWalkChat } from '../api/socket';
import type { ChatMessage } from '../api/types';
import { ApiError } from '../api/client';

const POLL_MS = 5000;

export type EstadoChat = 'cargando' | 'listo' | 'sin-chat' | 'error';

export function useChat(walkId: number | null): {
  mensajes: ChatMessage[];
  estado: EstadoChat;
  cerrado: boolean;
  error: string;
  enviando: boolean;
  enVivo: boolean;
  enviar: (body: string) => Promise<void>;
} {
  const [mensajes, setMensajes] = useState<ChatMessage[]>([]);
  const [estado, setEstado] = useState<EstadoChat>('cargando');
  const [cerrado, setCerrado] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enVivo, setEnVivo] = useState(false);

  // El eco del socket duplica el mensaje que uno mismo acaba de postear
  // (estás en el room walk:<id>) — dedupe por id obligatorio.
  const agregarMensaje = useCallback((m: ChatMessage) => {
    setMensajes((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
  }, []);

  // ── Carga inicial por REST ──────────────────────────────────
  // useFocusEffect, no useEffect: (tabs)/_layout.tsx es un navegador de
  // Tabs, que no desmonta chat.tsx al navegar a otro tab — solo lo esconde.
  // Con un useEffect común la carga quedaba pegada al primer walkId que
  // viste; con foco se recarga cada vez que volvés al chat.
  useFocusEffect(
    useCallback(() => {
      if (walkId == null) {
        setEstado('sin-chat');
        return;
      }
      let cancelado = false;
      setEstado('cargando');
      setError('');

      getChat(walkId)
        .then((chat) => {
          if (cancelado) return;
          setMensajes(chat.messages);
          setCerrado(chat.status === 'closed');
          setEstado('listo');
          markRead(walkId).catch(() => {});
        })
        .catch((err: any) => {
          if (cancelado) return;
          if (err instanceof ApiError && err.status === 404) {
            setEstado('sin-chat');
          } else {
            setError(err.message || 'No pudimos cargar el chat.');
            setEstado('error');
          }
        });

      return () => {
        cancelado = true;
      };
    }, [walkId])
  );

  // ── Tiempo real por socket, con fallback a poll ─────────────
  // También con useFocusEffect: sin esto, el socket se quedaba unido al
  // room y el poll de respaldo seguía pegando GET /chat cada 5s para
  // siempre en segundo plano después de salir del tab de Chat, porque el
  // componente nunca llegaba a desmontarse de verdad.
  useFocusEffect(
    useCallback(() => {
      if (walkId == null || estado === 'sin-chat' || estado === 'cargando') return;
      if (cerrado) return;

      let cancelado = false;
      let pollTimer: ReturnType<typeof setTimeout>;
      let socketActivo: Awaited<ReturnType<typeof getSocket>> = null;

      const iniciarPoll = () => {
        const tick = async () => {
          try {
            const chat = await getChat(walkId);
            if (cancelado) return;
            setMensajes(chat.messages);
            if (chat.status === 'closed') setCerrado(true);
          } catch {
            // Silencioso: el chat ya cargó una vez, un poll fallido no es
            // motivo para tapar la pantalla con un error.
          }
          if (!cancelado) pollTimer = setTimeout(tick, POLL_MS);
        };
        pollTimer = setTimeout(tick, POLL_MS);
      };

      (async () => {
        const socket = await getSocket();
        if (cancelado) return;
        if (!socket) {
          iniciarPoll();
          return;
        }

        const res = await joinWalkChat(socket, walkId);
        if (cancelado) return;

        if ('error' in res) {
          iniciarPoll();
          return;
        }

        socketActivo = socket;
        setEnVivo(true);

        socket.on('chat:message', agregarMensaje);
        socket.on('chat:read', () => {
          // No distinguimos remitente acá: un re-fetch liviano del propio
          // estado alcanza porque markRead ya corrió del lado del que lee.
        });
        socket.on('chat:closed', () => setCerrado(true));
      })();

      return () => {
        cancelado = true;
        clearTimeout(pollTimer);
        if (socketActivo) {
          socketActivo.off('chat:message', agregarMensaje);
          socketActivo.off('chat:read');
          socketActivo.off('chat:closed');
          leaveWalkChat(socketActivo, walkId);
        }
        setEnVivo(false);
      };
    }, [walkId, estado, cerrado, agregarMensaje])
  );

  const enviar = useCallback(
    async (body: string) => {
      if (walkId == null || !body.trim()) return;
      try {
        setEnviando(true);
        const m = await sendMessage(walkId, body.trim());
        agregarMensaje(m);
      } catch (err: any) {
        if (err instanceof ApiError && err.status === 409) {
          // El paseo terminó mientras escribías: pasa a solo lectura, sin
          // banner rojo (es un estado esperado, no un error).
          setCerrado(true);
        } else {
          setError(err.message || 'No pudimos enviar el mensaje.');
        }
        throw err;
      } finally {
        setEnviando(false);
      }
    },
    [walkId, agregarMensaje]
  );

  return { mensajes, estado, cerrado, error, enviando, enVivo, enviar };
}
