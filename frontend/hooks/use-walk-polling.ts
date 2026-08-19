// hooks/use-walk-polling.ts
// Boilerplate compartido de "traer un Walk por id, opcionalmente con
// polling", calcado del patrón que ya usaba buscando_paseador.tsx a mano
// (setTimeout recursivo, no setInterval: así no se apilan requests si una
// tarda). Lo que hacer con el resultado (a qué pantalla saltar según el
// status) queda en cada pantalla, porque esa decisión varía: buscando_paseador
// manda un 'canceled' a Inicio, paseo_en_curso lo hubiera mandado a
// detalles_del_paseo.
//
// Usa useFocusEffect, NO useEffect: (tabs)/_layout.tsx es un navegador de
// Tabs, y los Tabs de React Navigation no desmontan una pantalla oculta al
// navegar a otra — solo la esconden (display:none). Con un useEffect común,
// el polling de una pantalla como paseo_en_curso seguía corriendo para
// siempre en segundo plano después de salir de ahí: cada 5s volvía a
// detectar 'finished' y te forzaba de vuelta a paseo_finalizado sin
// importar a dónde hubieras navegado. useFocusEffect frena el polling en
// cuanto la pantalla pierde el foco (no cuando se desmonta) y lo retoma si
// se vuelve a enfocar.
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getWalk } from '../api/walks';
import type { Walk } from '../api/types';

const POLL_MS = 5000;

export function useWalkPolling(
  walkIdParam: string | string[] | undefined,
  opts?: { poll?: boolean; pollMs?: number }
): { walk: Walk | null; error: string; id: number; cargando: boolean } {
  const poll = opts?.poll ?? false;
  const pollMs = opts?.pollMs ?? POLL_MS;

  const rawId = Array.isArray(walkIdParam) ? walkIdParam[0] : walkIdParam;
  const id = Number(rawId);
  const idValido = !!rawId && !Number.isNaN(id);

  const [walk, setWalk] = useState<Walk | null>(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!idValido) {
        setError('No encontramos el paseo. Volvé a intentarlo desde Inicio.');
        setCargando(false);
        return;
      }

      let cancelado = false;
      let timer: ReturnType<typeof setTimeout>;

      const tick = async () => {
        try {
          const w = await getWalk(id);
          if (cancelado) return;
          setWalk(w);
          setError('');
        } catch (err: any) {
          if (!cancelado) setError(err.message || 'No pudimos consultar el estado del paseo.');
        } finally {
          if (!cancelado) setCargando(false);
        }
        if (!cancelado && poll) {
          timer = setTimeout(tick, pollMs);
        }
      };

      tick();
      return () => {
        cancelado = true;
        clearTimeout(timer);
      };
    }, [id, idValido, poll, pollMs])
  );

  return { walk, error, id, cargando };
}
