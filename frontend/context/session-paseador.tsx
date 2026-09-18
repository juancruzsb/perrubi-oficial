// context/session-paseador.tsx
// Igual patrón que context/session.tsx pero para la sesión de Walker.
// No se engancha a setUnauthorizedHandler de api/client.ts a propósito:
// ese handler es único y ya lo usa la sesión de dueño (context/session.tsx)
// para el guard de (tabs)/_layout.tsx. Si el token del paseador expira
// (1h), las pantallas de paseador/ ven el error de la request fallida y
// el usuario cierra sesión a mano desde perfil — suficiente para una demo.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
      const [t, w] = await Promise.all([obtenerTokenPaseador(), obtenerWalker()]);
      if (!activo) return;
      setToken(t);
      setWalker(w);
      setCargando(false);
    })();
    return () => {
      activo = false;
    };
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
