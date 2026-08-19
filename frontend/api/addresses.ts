// api/addresses.ts
import { apiRequest } from './client';
import type { Address } from './types';

export type CreateAddressPayload = {
  label?: string;
  street?: string;
  number?: string;
  floorApt?: string;
  city?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
};

// GET /addresses (NO /addresses/me) — direcciones del usuario logueado.
export function getMyAddresses(): Promise<Address[]> {
  return apiRequest<Address[]>('/addresses');
}

// POST /addresses — se puede mandar { street, number?, city? } (el back lo
// geocodifica solo, ver addresses.controller.js:resolveCoordinates) o
// directamente { latitude, longitude }. No usamos /maps/directions desde
// acá: haría una segunda llamada a Google redundante con la que ya hace
// el backend.
export function createAddress(payload: CreateAddressPayload): Promise<Address> {
  return apiRequest<Address>('/addresses', { method: 'POST', body: payload });
}
