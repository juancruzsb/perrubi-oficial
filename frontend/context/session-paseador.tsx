// context/session-paseador.tsx
// Igual patrón que context/session.tsx pero para la sesión de Walker.
// Usa su propio handler de 401 (setWalkerUnauthorizedHandler) separado del
// del dueño: así un token de paseador vencido (1h) cierra solo la sesión de
// paseador y el guard de paseador/(tabs)/_layout.tsx redirige al login.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setWalkerUnauthorizedHandler } from '../api/client';
import { cerrarSesionPaseador, guardarSesionPaseador, obtenerTokenPaseador, obtenerWalker } from '../api/session-paseador';
import type { Walker } from '../api/types';

type SessionPaseadorValue = {
  walker: Walker | null;
  token: string | null;
  cargando: boolean;
  entrar: (token: string, walker: Walker) => Promise<void>;
  salir: () => Promise<void>;
};

const SessionPaseadorContext = createContext<SessionPaseadorValue | null>(null);

export function SessionPaseadorProvider({ children }: { children: React.ReactNode }) {
  const [walker, setWalker] = useState<Walker | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const [t, w] = await Promise.all([obtenerTokenPaseador(), obtenerWalker()]);
        if (!activo) return;
        setToken(t);
        setWalker(w);
      } catch {
        // Storage ilegible o JSON corrupto: se arranca sin sesión.
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  // apiRequest ya llamó a cerrarSesionPaseador(); acá se sincroniza el estado.
  useEffect(() => {
    setWalkerUnauthorizedHandler(() => {
      setToken(null);
      setWalker(null);
    });
    return () => setWalkerUnauthorizedHandler(null);
  }, []);

  const entrar = useCallback(async (nuevoToken: string, nuevoWalker: Walker) => {
    await guardarSesionPaseador(nuevoToken, nuevoWalker);
    setToken(nuevoToken);
    setWalker(nuevoWalker);
  }, []);

  const salir = useCallback(async () => {
    await cerrarSesionPaseador();
    setToken(null);
    setWalker(null);
  }, []);

  const value = useMemo(
    () => ({ walker, token, cargando, entrar, salir }),
    [walker, token, cargando, entrar, salir]
  );

  return <SessionPaseadorContext.Provider value={value}>{children}</SessionPaseadorContext.Provider>;
}

export function useSessionPaseador(): SessionPaseadorValue {
  const ctx = useContext(SessionPaseadorContext);
  if (!ctx) throw new Error('useSessionPaseador() tiene que usarse dentro de <SessionPaseadorProvider>');
  return ctx;
}
