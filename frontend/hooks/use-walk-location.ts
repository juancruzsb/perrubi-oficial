// hooks/use-walk-location.ts
// Ubicación en vivo del paseador para paseo_en_curso.tsx: tiempo real por
// Socket.IO (evento walk:location, room walk:<id>) con fallback a lo que ya
// trae el polling de use-walk-polling.ts (walk.location, cada 5s) si el
// socket no conecta — mismo patrón que hooks/use-chat.ts.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getSocket, joinWalk, leaveWalk } from '../api/socket';
import type { WalkLocation } from '../api/types';

// Solo lo que hace falta para pintar el mapa; no se tipa como WalkLocation
// completo porque el payload del socket (walks.service.js -> emitToWalk)
// trae `walkId` pero no `id`.
export type LiveLocation = Pick<WalkLocation, 'latitude' | 'longitude' | 'updatedAt'>;

function esMasNueva(a: LiveLocation, b: LiveLocation): boolean {
  return Date.parse(a.updatedAt) > Date.parse(b.updatedAt);
}

export function useWalkLocation(
  walkId: number | null,
  seed: LiveLocation | null
): { location: LiveLocation | null; enVivo: boolean } {
  const [location, setLocation] = useState<LiveLocation | null>(seed);
  const [enVivo, setEnVivo] = useState(false);
  const walkIdRef = useRef(walkId);

  // El polling (seed) es el fallback si el socket no conectó, o la única
  // fuente si el join falló — se queda con lo que sea más nuevo entre lo
  // que ya tenía y lo que acaba de traer el poll.
  // Si cambió el paseo, se arranca de cero con el seed del nuevo en vez de
  // arrastrar el último pin del anterior.
  useEffect(() => {
    if (walkIdRef.current !== walkId) {
      walkIdRef.current = walkId;
      setLocation(seed);
      return;
    }
    if (!seed) return;
    setLocation((prev) => (!prev || esMasNueva(seed, prev) ? seed : prev));
  }, [seed, walkId]);

  // useFocusEffect, no useEffect: (tabs) es un navegador de Tabs que no
  // desmonta paseo_en_curso al navegar a otro tab, solo lo esconde — con un
  // useEffect común el socket se quedaba unido al room para siempre.
  useFocusEffect(
    useCallback(() => {
      if (walkId == null) return;

      let cancelado = false;
      let socketActivo: Awaited<ReturnType<typeof getSocket>> = null;

      const onLocation = (payload: LiveLocation & { walkId?: number }) => {
        // La room es compartida con el chat: solo se acepta la de este paseo.
        if (payload.walkId != null && payload.walkId !== walkId) return;
        setLocation((prev) => (!prev || esMasNueva(payload, prev) ? payload : prev));
      };

      (async () => {
        const socket = await getSocket();
        if (cancelado || !socket) return;

        const res = await joinWalk(socket, walkId);
        if ('error' in res) return;
        if (cancelado) {
          // El join llegó después de salir de la pantalla: no dejar el
          // socket metido en la room.
          leaveWalk(socket, walkId);
          return;
        }

        socketActivo = socket;
        setEnVivo(true);
        socket.on('walk:location', onLocation);
      })();

      return () => {
        cancelado = true;
        if (socketActivo) {
          socketActivo.off('walk:location', onLocation);
          leaveWalk(socketActivo, walkId);
        }
        setEnVivo(false);
      };
    }, [walkId])
  );

  return { location, enVivo };
}
