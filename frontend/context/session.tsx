// context/session.tsx
// Estado de sesión global: quién está logueado y con qué token. Se hidrata
// desde AsyncStorage al montar (api/session.ts) y se sincroniza con
// client.ts para que un 401 en cualquier request limpie la sesión sin que
// client.ts tenga que conocer React ni el router.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setUnauthorizedHandler } from '../api/client';
import { cerrarSesion, guardarSesion, obtenerToken, obtenerUsuario } from '../api/session';
import type { User } from '../api/types';

type SessionValue = {
  user: User | null;
  token: string | null;
  cargando: boolean;
  entrar: (token: string, user: User) => Promise<void>;
  salir: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    (async () => {
      const [t, u] = await Promise.all([obtenerToken(), obtenerUsuario()]);
      if (!activo) return;
      setToken(t);
      setUser(u);
      setCargando(false);
    })();
    return () => {
      activo = false;
    };
  }, []);

  // apiRequest ya llamó a cerrarSesion() antes de invocar este handler;
  // acá solo hace falta sincronizar el estado de React para que el guard
  // de (tabs)/_layout.tsx redirija a /login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const entrar = useCallback(async (nuevoToken: string, nuevoUser: User) => {
    await guardarSesion(nuevoToken, nuevoUser);
    setToken(nuevoToken);
    setUser(nuevoUser);
  }, []);

  const salir = useCallback(async () => {
    await cerrarSesion();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, cargando, entrar, salir }),
    [user, token, cargando, entrar, salir]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession() tiene que usarse dentro de <SessionProvider>');
  return ctx;
}
