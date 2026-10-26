// api/session-paseador.ts
// Igual que api/session.ts pero para la identidad Walker, guardada bajo
// keys de AsyncStorage separadas — dueño y paseador son cuentas distintas
// (User vs Walker en el back) y pueden convivir instaladas en el mismo
// dispositivo sin pisarse la sesión entre sí.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Walker } from './types';

const TOKEN_KEY  = 'perrubi_walker_token';
const WALKER_KEY = 'perrubi_walker_user';

export async function guardarSesionPaseador(token: string, walker: Walker): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(WALKER_KEY, JSON.stringify(walker));
}

export async function obtenerTokenPaseador(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function obtenerWalker(): Promise<Walker | null> {
  const raw = await AsyncStorage.getItem(WALKER_KEY);
  return raw ? (JSON.parse(raw) as Walker) : null;
}

export async function cerrarSesionPaseador(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, WALKER_KEY]);
}
