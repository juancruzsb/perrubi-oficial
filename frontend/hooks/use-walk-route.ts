// hooks/use-walk-route.ts
// Recorrido real de un paseo ya finalizado (GET /walks/:id/route), listo para
// pasarle a <InteractiveMap>. Lo comparten paseo_finalizado y
// detalles_del_paseo.
import { useEffect, useMemo, useState } from 'react';
import { getWalkRoute } from '../api/walks';
import type { Walk, WalkRoute } from '../api/types';
import type { MapPayload } from '../components/interactive-map-types';

export type EstadoRuta = 'cargando' | 'listo' | 'error';

export function useWalkRoute(walk: Walk | null): {
  ruta: WalkRoute | null;
  estado: EstadoRuta;
  // null si no hay recorrido que dibujar (paseo no finalizado o sin puntos).
  mapa: MapPayload | null;
} {
  const [ruta, setRuta] = useState<WalkRoute | null>(null);
  const [estado, setEstado] = useState<EstadoRuta>('cargando');
  const walkId = walk?.id ?? null;
  const finalizado = walk?.status === 'finished';

  useEffect(() => {
    // Las pantallas de Tabs no se desmontan: no arrastrar el recorrido del
    // paseo anterior.
    setRuta(null);
    if (walkId == null || !finalizado) return;

    let cancelado = false;
    setEstado('cargando');
    getWalkRoute(walkId)
      .then((r) => { if (!cancelado) { setRuta(r); setEstado('listo'); } })
      .catch(() => { if (!cancelado) setEstado('error'); });
    return () => { cancelado = true; };
  }, [walkId, finalizado]);

  const mapa = useMemo<MapPayload | null>(() => {
    if (!ruta || ruta.points.length < 2) return null;
    return {
      trail: ruta.points.map((p) => ({ lat: p.latitude, lng: p.longitude })),
      fit: 'auto',
    };
  }, [ruta]);

  return { ruta, estado, mapa };
}

export function distanciaLegible(metros: number): string {
  if (metros < 1000) return `${metros} m`;
  return `${(metros / 1000).toLocaleString('es-AR', { maximumFractionDigits: 1 })} km`;
}
