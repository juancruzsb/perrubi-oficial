// hooks/use-walk-location.ts
// Ubicación en vivo del paseador para paseo_en_curso.tsx: tiempo real por
// Socket.IO (evento walk:location, room walk:<id>) con fallback a lo que ya
// trae el polling de use-walk-polling.ts (walk.location, cada 5s) si el
// socket no conecta — mismo patrón que hooks/use-chat.ts.
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getSocket, joinWalk, leaveWalk } from '../api/socket';
import type { WalkLocation } from '../api/types';

// Solo lo que hace falta para pintar el mapa — el payload que emite el
// socket (walks.service.js -> emitToWalk) no manda `id`/`walkId`, así que
// no tipamos esto como WalkLocation completo.
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

  // El polling (seed) es el fallback si el socket no conectó, o la única
  // fuente si el join falló — se queda con lo que sea más nuevo entre lo
  // que ya tenía y lo que acaba de traer el poll.
  useEffect(() => {
    if (!seed) return;
    setLocation((prev) => (!prev || esMasNueva(seed, prev) ? seed : prev));
  }, [seed]);

  // useFocusEffect, no useEffect: (tabs) es un navegador de Tabs que no
  // desmonta paseo_en_curso al navegar a otro tab, solo lo esconde — con un
  // useEffect común el socket se quedaba unido al room para siempre.
  useFocusEffect(
    useCallback(() => {
      if (walkId == null) return;

      let cancelado = false;
      let socketActivo: Awaited<ReturnType<typeof getSocket>> = null;

      const onLocation = (payload: LiveLocation) => {
        setLocation((prev) => (!prev || esMasNueva(payload, prev) ? payload : prev));
      };

      (async () => {
        const socket = await getSocket();
        if (cancelado || !socket) return;

        const res = await joinWalk(socket, walkId);
        if (cancelado || 'error' in res) return;

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
