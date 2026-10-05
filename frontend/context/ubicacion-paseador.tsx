// context/ubicacion-paseador.tsx
// Lado emisor de la ubicación en vivo: mientras el paseador tiene un paseo
// aceptado o en curso, lee el GPS del dispositivo y lo manda a
// PATCH /walks/:id/location (api/walker.ts), que el back guarda y difunde por
// socket al dueño (ver UBICACION-TIEMPO-REAL.md).
//
// Vive en un provider montado en paseador/(tabs)/_layout.tsx (después del
// guard de sesión) para que siga andando en cualquier tab del paseador, y se
// apaga solo al desmontarse (logout). Solo funciona con la app en primer
// plano: segundo plano requeriría un dev build + expo-task-manager.
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import { getMyWalksAsWalker, updateWalkLocation } from '../api/walker';

export type EstadoUbicacion = 'inactivo' | 'compartiendo' | 'sin-permiso';

type UbicacionValue = { estado: EstadoUbicacion; walkId: number | null };

const UbicacionContext = createContext<UbicacionValue>({ estado: 'inactivo', walkId: null });

const REVISAR_PASEOS_MS = 15000;
const MIN_ENTRE_ENVIOS_MS = 4000;

export function UbicacionPaseadorProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<EstadoUbicacion>('inactivo');
  const [walkId, setWalkId] = useState<number | null>(null);

  useEffect(() => {
    let cancelado = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let suscripcion: Location.LocationSubscription | null = null;
    let walkActivo: number | null = null;
    // Para no volver a pedir el permiso cada 15s si ya lo negó para este paseo.
    let permisoNegadoPara: number | null = null;
    let ultimoEnvio = 0;

    const detener = () => {
      suscripcion?.remove();
      suscripcion = null;
      walkActivo = null;
      setWalkId(null);
      setEstado('inactivo');
    };

    const iniciar = async (id: number) => {
      const permiso = await Location.requestForegroundPermissionsAsync();
      if (cancelado) return;
      if (permiso.status !== 'granted') {
        permisoNegadoPara = id;
        setWalkId(id);
        setEstado('sin-permiso');
        return;
      }

      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 5 },
        async (pos) => {
          const ahora = Date.now();
          if (ahora - ultimoEnvio < MIN_ENTRE_ENVIOS_MS) return;
          ultimoEnvio = ahora;
          try {
            await updateWalkLocation(id, {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          } catch {
            // 409: el paseo ya no está en curso — el próximo chequeo lo
            // detiene. Cualquier otro error es transitorio (red): el
            // siguiente tick vuelve a intentar.
          }
        }
      );
      if (cancelado) {
        sub.remove();
        return;
      }
      suscripcion = sub;
      walkActivo = id;
      setWalkId(id);
      setEstado('compartiendo');
    };

    const revisar = async () => {
      try {
        const walks = await getMyWalksAsWalker();
        if (cancelado) return;
        const activo = walks.find((w) => w.status === 'accepted' || w.status === 'in_progress');
        if (!activo) {
          if (walkActivo !== null || permisoNegadoPara !== null) {
            detener();
            permisoNegadoPara = null;
          }
        } else if (walkActivo !== activo.id && permisoNegadoPara !== activo.id) {
          detener();
          await iniciar(activo.id);
        }
      } catch {
        // Sin red o 401: el siguiente chequeo reintenta (un 401 ya cierra la
        // sesión y desmonta este provider).
      }
      if (!cancelado) timer = setTimeout(revisar, REVISAR_PASEOS_MS);
    };

    revisar();

    return () => {
      cancelado = true;
      if (timer) clearTimeout(timer);
      suscripcion?.remove();
    };
  }, []);

  const value = useMemo(() => ({ estado, walkId }), [estado, walkId]);
  return <UbicacionContext.Provider value={value}>{children}</UbicacionContext.Provider>;
}

export function useUbicacionCompartida(): UbicacionValue {
  return useContext(UbicacionContext);
}
