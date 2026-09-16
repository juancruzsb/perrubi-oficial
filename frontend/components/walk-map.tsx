// components/walk-map.tsx
// Reemplazo del mapa decorativo (View's dibujadas a mano) de
// paseo_en_curso.tsx: una imagen estática de Google Maps con un pin,
// proxeada por el backend (GET /maps/static — ver api/maps.ts). No es
// react-native-maps: sin dev build, anda en Expo Go y en web. Pensado para
// reusarse en detalles_del_paseo.tsx, que tiene el mismo mapa decorativo.
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { staticMapUrl } from '../api/maps';
import { haceCuanto } from '../lib/paseos';
import type { LiveLocation } from '../hooks/use-walk-location';

const GREEN = '#4eb82f';
const MAP_BG = '#f1f0ef';
const TEXT_MUTED = '#9aa39a';
const TEXT_DARK = '#1f2937';
const WHITE = '#ffffff';

const MARKER_SIZE = 36;
const BADGE_SIZE = 18;

export function WalkMap({
  location,
  enVivo,
  conPerro,
}: {
  location: LiveLocation | null;
  enVivo: boolean;
  // false: el paseador va en camino a buscar al perro (accepted) -> ícono
  // de persona sola. true: el paseo ya arrancó (in_progress) -> se suma un
  // badge de pata para marcar que ahora está con el perro. No hay un ícono
  // "persona + perro" en Ionicons, así que se compone con el mismo motivo
  // de pata que ya usa el resto de la pantalla (chip de estado, timeline).
  conPerro: boolean;
}) {
  const [uri, setUri] = useState<string | null>(null);
  const [errorImagen, setErrorImagen] = useState(false);
  // Fuerza un re-render cada 5s solo para que "Actualizado hace X" no se
  // quede congelado en el texto que tenía la primera vez que se pintó.
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!location) {
      setUri(null);
      return;
    }
    setErrorImagen(false);
    let cancelado = false;
    staticMapUrl({ latitude: location.latitude, longitude: location.longitude, updatedAt: location.updatedAt })
      .then((url) => { if (!cancelado) setUri(url); })
      .catch(() => { if (!cancelado) setUri(null); });
    return () => { cancelado = true; };
  }, [location]);

  useEffect(() => {
    if (!location) return;
    const timer = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(timer);
  }, [location]);

  if (!location) {
    return (
      <View style={[styles.map, styles.placeholder]}>
        <Ionicons name="paw" size={28} color={TEXT_MUTED} />
        <Text style={styles.placeholderText}>Esperando la ubicación del paseador…</Text>
      </View>
    );
  }

  if (errorImagen || !uri) {
    return (
      <View style={[styles.map, styles.placeholder]}>
        <Ionicons name={errorImagen ? 'cloud-offline-outline' : 'location'} size={28} color={TEXT_MUTED} />
        <Text style={styles.placeholderText}>
          {errorImagen ? 'No pudimos cargar el mapa.' : 'Cargando mapa…'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.map}>
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        onError={() => setErrorImagen(true)}
      />
      {/* El backend centra la imagen en (latitude, longitude) y ya no dibuja
          su propio pin (ver maps.service.js) — este marcador va exactamente
          en el centro de la imagen, sin cálculo de proyección del lado del
          frontend. */}
      <View style={styles.markerWrap} pointerEvents="none">
        <View style={styles.marker}>
          <Ionicons name="person" size={18} color={WHITE} />
          {conPerro && (
            <View style={styles.markerBadge}>
              <Ionicons name="paw" size={10} color={WHITE} />
            </View>
          )}
        </View>
      </View>
      <View style={styles.overlay}>
        {enVivo && (
          <View style={styles.liveChip}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>En vivo</Text>
          </View>
        )}
        <Text style={styles.updatedText}>Actualizado {haceCuanto(location.updatedAt)}</Text>
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
  markerWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -MARKER_SIZE / 2,
    marginLeft: -MARKER_SIZE / 2,
  },
  marker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    backgroundColor: GREEN,
    borderWidth: 3,
    borderColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: TEXT_DARK,
    borderWidth: 2,
    borderColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
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
