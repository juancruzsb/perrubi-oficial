// api/walks.ts
import { apiRequest } from './client';
import type { Dog, Walk, WalkStatus } from './types';

export type CreateWalkPayload = {
  dogIds: number[]; // obligatorio y no vacío (walks.controller.js)
  walkType: string; // 'individual' | 'group' — sin validación estricta en el back
  startTime?: string; // ISO
  duration?: number; // minutos
  notes?: string;
  addressId?: number;
};

// POST /walks
export function createWalk(payload: CreateWalkPayload): Promise<Walk> {
  return apiRequest<Walk>('/walks', { method: 'POST', body: payload });
}

// GET /walks/me — paseos del usuario logueado (o del paseador, según el token).
export function getMyWalks(): Promise<Walk[]> {
  return apiRequest<Walk[]>('/walks/me');
}

// GET /walks/:id
export function getWalk(id: number): Promise<Walk> {
  return apiRequest<Walk>(`/walks/${id}`);
}

// PATCH /walks/:id/status — transiciones válidas: ver ALLOWED_TRANSITIONS en
// walks.service.js. Una transición inválida responde 400 con un mensaje en
// español ya listo para mostrar tal cual.
export function changeWalkStatus(id: number, status: WalkStatus): Promise<Walk> {
  return apiRequest<Walk>(`/walks/${id}/status`, { method: 'PATCH', body: { status } });
}

// walk.dogs es un array de filas de join (WalkDog), no de Dog — este helper
// evita repetir el .map(wd => wd.dog) en cada pantalla.
export function dogsOf(walk: Walk): Dog[] {
  return walk.dogs.map((wd) => wd.dog);
}
