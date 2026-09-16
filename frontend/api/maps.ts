// api/maps.ts
// No es un fetch como el resto de api/ — arma una URL para GET /maps/static
// (proxy del backend a la Maps Static API) para que un <Image> la cargue
// directo. Reemplazo de react-native-maps: sin dev build, anda en Expo Go y
// en web. El token va como query param porque <Image> no manda headers de
// forma confiable (React Native Web los ignora) — ver auth.middlewares.js
// (verifyTokenFromQuery) del backend.
import { BASE_URL } from './client';
import { obtenerToken } from './session';

type StaticMapParams = {
  latitude: number;
  longitude: number;
  // Cache-buster: sin esto <Image> puede no recargar la imagen cuando llega
  // una posición nueva con las mismas coordenadas redondeadas por Google.
  updatedAt: string;
  zoom?: number;
  width?: number;
  height?: number;
};

export async function staticMapUrl({
  latitude,
  longitude,
  updatedAt,
  zoom,
  width,
  height,
}: StaticMapParams): Promise<string | null> {
  const token = await obtenerToken();
  if (!token) return null;

  const params = new URLSearchParams({
    lat: String(latitude),
    lng: String(longitude),
    token,
    v: updatedAt,
  });
  if (zoom != null) params.set('zoom', String(zoom));
  if (width != null) params.set('width', String(width));
  if (height != null) params.set('height', String(height));

  return `${BASE_URL}/maps/static?${params.toString()}`;
}
