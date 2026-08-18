// api/auth.ts
import { apiRequest } from './client';
import { cerrarSesion, guardarSesion } from './session';
import type { User } from './types';

export type { User };
// Re-exportados para no romper imports existentes de sesión que apuntaban acá.
export { cerrarSesion, guardarSesion, obtenerToken, obtenerUsuario } from './session';

// ─── TIPOS — contra el contrato real de auth.controller.js ──────
// El back exige firstName (no "name"); lastName es opcional.
export type RegisterPayload = {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterResponse = { message: string; user: User };
export type LoginResponse = { message: string; token: string; user: User };
export type MeResponse = { user: User };

// ─── LLAMADAS ────────────────────────────────────────────────

// POST /auth/userRegister → { firstName, lastName?, email, password }
// Devuelve el usuario creado (sin token — hay que loguear después).
export function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/auth/userRegister', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

// POST /auth/userLogin → { email, password }
// Devuelve token + user, y los guarda en AsyncStorage automáticamente.
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse>('/auth/userLogin', {
    method: 'POST',
    body: payload,
    auth: false,
  });
  await guardarSesion(response.token, response.user);
  return response;
}

// GET /auth/me → perfil del usuario logueado.
export function getMe(): Promise<MeResponse> {
  return apiRequest<MeResponse>('/auth/me');
}

export function logout(): Promise<void> {
  return cerrarSesion();
}

// La UI pide "Nombre completo" en un solo campo (registro.tsx); el backend
// exige firstName por separado. Divide por el primer espacio.
export function splitNombre(nombreCompleto: string): { firstName: string; lastName?: string } {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
  const firstName = partes.shift() ?? '';
  const lastName = partes.join(' ');
  return lastName ? { firstName, lastName } : { firstName };
}

export function nombreCompleto(user: User | null): string {
  if (!user) return 'usuario';
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
}
