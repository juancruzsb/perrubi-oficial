// api/auth.ts
import { apiRequest } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── TIPOS — basados en el schema de Prisma ─────────────────
export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

// Coincide exactamente con el modelo User de Prisma
export type User = {
  id: number;        // SERIAL en postgres → número
  email: string;
  name: string | null; // name es opcional en el schema
  password: string;  // el back lo devuelve, pero no lo uses en el front
  createdAt: string;
  review: number;    // default 0
};

export type LoginResponse = {
  message: string;
  token: string;
  user: User;
};

export type RegisterResponse = {
  message: string;
  user: User;
};

// ─── ASYNCSTORAGE KEYS ──────────────────────────────────────
const TOKEN_KEY = 'perrubi_token';
const USER_KEY  = 'perrubi_user';

// ─── HELPERS TOKEN ───────────────────────────────────────────
export async function guardarSesion(token: string, user: User) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function obtenerToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function obtenerUsuario(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function cerrarSesion() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

// ─── LLAMADAS ────────────────────────────────────────────────

// POST /auth/register → { name, email, password }
// Devuelve el usuario creado (sin token — tiene que hacer login después)
export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: payload,
  });
}

// POST /auth/userLogin → { email, password }
// Devuelve token + user, y los guarda en AsyncStorage automáticamente
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse>('/auth/userLogin', {
    method: 'POST',
    body: payload,
  });
  await guardarSesion(response.token, response.user);
  return response;
}
