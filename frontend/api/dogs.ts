// api/dogs.ts
import { apiRequest } from './client';
import type { Dog, UserDogRow } from './types';

export type CreateDogPayload = {
  name: string;
  breed?: string;
  age?: number;
  gender?: string;
  weight?: number;
  extraNotes?: string;
  photo?: string;
};

// POST /dogs devuelve el Dog + include:{users:true} → filas de join sin
// "user" anidado (a diferencia de GET /dogs/user, que devuelve Dog[] plano).
export type CreatedDog = Dog & { users: UserDogRow[] };

// GET /dogs/user — perros del usuario logueado, YA aplanados por el back
// (dogs.service.js hace userDogs.map(ud => ud.dog)).
export function getMyDogs(): Promise<Dog[]> {
  return apiRequest<Dog[]>('/dogs/user');
}

// POST /dogs — único campo obligatorio: name.
export function createDog(payload: CreateDogPayload): Promise<CreatedDog> {
  return apiRequest<CreatedDog>('/dogs', { method: 'POST', body: payload });
}
