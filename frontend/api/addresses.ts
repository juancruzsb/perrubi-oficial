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

// PUT /addresses/:id — mismo geocodificado del lado del back no aplica acá
// (addresses.controller.js:updateAddress no llama a resolveCoordinates),
// así que si se cambia la calle sin mandar lat/lng, quedan las viejas.
export function updateAddress(id: number, payload: CreateAddressPayload): Promise<Address> {
  return apiRequest<Address>(`/addresses/${id}`, { method: 'PUT', body: payload });
}

export function deleteAddress(id: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/addresses/${id}`, { method: 'DELETE' });
}
