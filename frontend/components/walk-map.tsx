// components/walk-map.tsx
// Mapa del paseo para paseo_en_curso.tsx: un mapa de Google interactivo (se
// puede mover y hacer zoom — ver interactive-map.tsx) con el paseador, la casa
// del perro como destino y, mientras va a buscarlo, la ruta caminable que
// calculó el backend (walk.approachPolyline). Sobre el mapa va el cartel
// "En vivo / Actualizado hace X".
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InteractiveMap } from './interactive-map';
import type { MapPayload } from './interactive-map-types';
import { haceCuanto } from '../lib/paseos';
import type { LiveLocation } from '../hooks/use-walk-location';

const GREEN = '#4caf50';
const MAP_BG = '#f1f0ef';
const TEXT_MUTED = '#9aa39a';
const TEXT_DARK = '#1f2937';

export function WalkMap({
  location,
  enVivo,
  conPerro,
  destino,
  approachPolyline,
  fill,
  overlayPosition = 'bottom',
  bottomInset = 0,
}: {
  location: LiveLocation | null;
  enVivo: boolean;
  // false: el paseador va en camino a buscar al perro (accepted) -> ícono
  // de persona sola. true: el paseo ya arrancó (in_progress) -> se suma un
  // badge para marcar que ahora está con el perro.
  conPerro: boolean;
  // Casa del perro (walk.address). null si el paseo no tiene dirección con
  // coordenadas.
  destino?: { latitude: number; longitude: number } | null;
  // Ruta de acercamiento (walk.approachPolyline). Se oculta una vez que el
  // paseo arrancó: ya no es el camino pendiente.
  approachPolyline?: string | null;
  // fill: el mapa llena a su contenedor (flex:1) en vez de tener 220px fijos.
  fill?: boolean;
  // Dónde va el cartel "En vivo / Actualizado": abajo (default) o arriba,
  // para pantallas donde una hoja tapa la parte inferior del mapa.
  overlayPosition?: 'top' | 'bottom';
  // px de abajo tapados por una hoja flotante: el encuadre automático los deja
  // libres para que el paseador y el destino no queden escondidos.
  bottomInset?: number;
}) {
  // Fuerza un re-render cada 5s solo para que "Actualizado hace X" no se
  // quede congelado en el texto que tenía la primera vez que se pintó.
  const [, setTick] = useState(0);
  const mapStyle = fill ? styles.mapFill : styles.map;

  useEffect(() => {
    if (!location) return;
    const timer = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(timer);
  }, [location]);

  const lat = location?.latitude;
  const lng = location?.longitude;
  const destLat = destino?.latitude;
  const destLng = destino?.longitude;

  const data = useMemo<MapPayload>(
    () => ({
      walker: lat != null && lng != null ? { lat, lng, conPerro } : undefined,
      destino: destLat != null && destLng != null ? { lat: destLat, lng: destLng } : undefined,
      approachPolyline: !conPerro && approachPolyline ? approachPolyline : undefined,
      fit: 'auto',
      padding: { bottom: 60 + bottomInset },
    }),
    [lat, lng, conPerro, destLat, destLng, approachPolyline, bottomInset]
  );

  if (!location && !destino) {
    return (
      <View style={[mapStyle, styles.placeholder]}>
        <Ionicons name="paw" size={28} color={TEXT_MUTED} />
        <Text style={styles.placeholderText}>Esperando la ubicación del paseador…</Text>
      </View>
    );
  }

  return (
    <View style={mapStyle}>
      <InteractiveMap data={data} style={StyleSheet.absoluteFill} />
      {/* pointerEvents none: el cartel no tapa el arrastre del mapa. */}
      <View
        pointerEvents="none"
        style={[styles.overlay, overlayPosition === 'top' ? styles.overlayTop : styles.overlayBottom]}
      >
        {location ? (
          <>
            {enVivo && (
              <View style={styles.liveChip}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>En vivo</Text>
              </View>
            )}
            <Text style={styles.updatedText}>Actualizado {haceCuanto(location.updatedAt)}</Text>
          </>
        ) : (
          <Text style={styles.updatedText}>Esperando la ubicación del paseador…</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: MAP_BG,
  },
  mapFill: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: MAP_BG,
  },
  overlayTop: { top: 10 },
  overlayBottom: { bottom: 10 },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  placeholderText: {
    color: TEXT_MUTED,
    fontSize: 13,
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: GREEN,
  },
  liveText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: '700',
  },
  updatedText: {
    color: TEXT_DARK,
    fontSize: 11,
    marginLeft: 'auto',
  },
});
