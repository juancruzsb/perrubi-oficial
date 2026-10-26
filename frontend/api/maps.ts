// api/maps.ts
// No es un fetch como el resto de api/: arma la URL de la página del mapa
// interactivo (GET /maps/embed del backend, Maps JavaScript API) que cargan
// components/interactive-map(.web).tsx. La página no lleva datos propios ni
// token — la app le manda lo que tiene que dibujar por postMessage.
import { BASE_URL } from './client';

export function embedMapUrl(): string {
  return `${BASE_URL}/maps/embed`;
}
