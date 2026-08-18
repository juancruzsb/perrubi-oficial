// api/session.ts
// Helpers de AsyncStorage para persistir la sesión (token + usuario).
// Extraído de lo que antes vivía en api/auth.ts para romper un ciclo de
// imports: client.ts necesita leer el token y poder cerrar la sesión ante
// un 401, y auth.ts a su vez importa client.ts — este archivo no importa
// ninguno de los dos.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from './types';

const TOKEN_KEY = 'perrubi_token';
const USER_KEY = 'perrubi_user';

export async function guardarSesion(token: string, user: User): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function obtenerToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function obtenerUsuario(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export async function cerrarSesion(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}
