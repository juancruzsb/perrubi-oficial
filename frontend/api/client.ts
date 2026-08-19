// api/client.ts
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { cerrarSesion, obtenerToken } from './session';

const DEFAULT_PORT = 3000;

// Resuelve la URL base del backend en runtime, en vez de hardcodearla:
// - EXPO_PUBLIC_API_URL (si se define en frontend/.env) siempre gana.
// - Si no, se deriva del hostUri que usa el propio Metro para servir la app
//   (ej. "192.168.0.12:8081", la IP LAN de la PC que corre `expo start`).
//   Esto es lo que hace que la app ande en un celular físico o en un
//   emulador Android sin tocar código — "localhost" ahí no apunta a la PC.
// - Si hostUri no está disponible o es localhost: en Android el emulador
//   usa 10.0.2.2 para llegar al host; en cualquier otro caso, localhost.
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).expoGoConfig?.debuggerHost ??
    '';
  const host = String(hostUri).split(':')[0];

  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:${DEFAULT_PORT}`;
  }
  if (Platform.OS === 'android') return `http://10.0.2.2:${DEFAULT_PORT}`;
  return `http://localhost:${DEFAULT_PORT}`;
}

export const BASE_URL = resolveBaseUrl();

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// El SessionProvider registra este handler para enterarse de un 401 sin que
// client.ts tenga que importar expo-router ni el contexto de sesión.
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: object;
  token?: string; // override manual, poco común
  auth?: boolean; // default true; false para login/registro (todavía no hay token)
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = options.token ?? (auth ? await obtenerToken() : null);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, `No se pudo conectar con el servidor (${BASE_URL}).`);
  }

  // El back siempre manda JSON, pero si BASE_URL apunta mal (o el server no
  // está levantado) puede volver HTML o un body vacío — parseo defensivo en
  // vez del `response.json()` directo, que explotaba en ese caso.
  const raw = await response.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (response.status === 401) {
    await cerrarSesion();
    onUnauthorized?.();
    throw new ApiError(401, data?.error ?? 'Tu sesión expiró. Iniciá sesión de nuevo.');
  }

  if (!response.ok) {
    // El error.middleware.js del back SIEMPRE responde { error: "..." },
    // nunca { message: "..." } — no leer otra clave acá.
    throw new ApiError(response.status, data?.error ?? `Error ${response.status}`);
  }

  return data as T;
}
