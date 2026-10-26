// components/interactive-map-types.ts
// Estado completo que interactive-map(.web).tsx le manda a la página del mapa
// (GET /maps/embed del backend, backend/src/views/walk-map.html — ahí está el
// contrato original). Lo que no viene en el payload se borra del mapa.
export type LatLng = { lat: number; lng: number };

export type MapPayload = {
  walker?: LatLng & { conPerro: boolean };
  destino?: LatLng;
  // Encoded polyline de la Routes API (walk.approachPolyline).
  approachPolyline?: string;
  trail?: LatLng[];
  // 'auto': encuadra todo mientras el usuario no haya movido el mapa.
  fit?: 'auto' | 'none';
  // px del mapa tapados por UI de la app (ej. la hoja arrastrable).
  padding?: { top?: number; right?: number; bottom?: number; left?: number };
};
