// api/walker.ts
// Lado paseador de la API: walkerRegister/walkerLogin (endpoints reales del
// back, ver auth.router.js) + los endpoints de walks que solo puede usar un
// walker (getAvailableWalks, acceptWalk) o que también usa el dueño pero acá
// hace falta mandarlos con el token de ESTA sesión — apiRequest() por
// default busca el token del dueño (api/session.ts), así que estas
// funciones se lo pasan explícito vía withWalkerToken().
import { apiRequest } from './client';
import { guardarSesionPaseador, obtenerTokenPaseador } from './session-paseador';
import type { RegisterPayload, LoginPayload } from './auth';
import type { Walker, Walk, WalkStatus } from './types';

export type WalkerLoginResponse = { message: string; token: string; walker: Walker };
export type WalkerRegisterResponse = { message: string; walker: Walker };

// POST /auth/walkerRegister → { firstName, lastName?, email, password }
export function walkerRegister(payload: RegisterPayload): Promise<WalkerRegisterResponse> {
  return apiRequest<WalkerRegisterResponse>('/auth/walkerRegister', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

// POST /auth/walkerLogin → { email, password }
export async function walkerLogin(payload: LoginPayload): Promise<WalkerLoginResponse> {
  const response = await apiRequest<WalkerLoginResponse>('/auth/walkerLogin', {
    method: 'POST',
    body: payload,
    auth: false,
  });
  await guardarSesionPaseador(response.token, response.walker);
  return response;
}

async function withWalkerToken<T>(
  endpoint: string,
  options: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH'; body?: object } = {}
): Promise<T> {
  const token = await obtenerTokenPaseador();
  // token: '' si no hay sesión → apiRequest no manda Authorization y el back
  // responde 401 en vez de, por error, usar el token del dueño.
  return apiRequest<T>(endpoint, { ...options, token: token ?? '' });
}

// GET /walks/available — paseos en estado 'searching', para que el paseador
// elija cuál aceptar.
export function getAvailableWalks(): Promise<Walk[]> {
  return withWalkerToken<Walk[]>('/walks/available');
}

// GET /walks/me — con token de walker, el back devuelve los paseos donde es
// el walkerId asignado (walks.controller.js: getMyWalks bifurca por type).
export function getMyWalksAsWalker(): Promise<Walk[]> {
  return withWalkerToken<Walk[]>('/walks/me');
}

export function getWalkAsWalker(id: number): Promise<Walk> {
  return withWalkerToken<Walk>(`/walks/${id}`);
}

// PATCH /walks/:id/accept — atómico en el back: si dos paseadores aceptan a
// la vez, el que pierde la carrera recibe 409.
export function acceptWalk(id: number): Promise<Walk> {
  return withWalkerToken<Walk>(`/walks/${id}/accept`, { method: 'PATCH' });
}

// PATCH /walks/:id/status — transiciones válidas para un walker:
// accepted → in_progress → finished (ver ALLOWED_TRANSITIONS en walks.service.js).
export function changeWalkStatusAsWalker(id: number, status: WalkStatus): Promise<Walk> {
  return withWalkerToken<Walk>(`/walks/${id}/status`, { method: 'PATCH', body: { status } });
}
