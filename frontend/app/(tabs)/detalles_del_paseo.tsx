import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ─── COLORES ────────────────────────────────────────────────
const GREEN          = '#4caf50';
const GREEN_DARK      = '#1b5e20';
const GREEN_LIGHT     = '#eaf7eb';
const BORDER          = '#e6e9e6';
const BG              = '#fbfdfb';
const WHITE           = '#ffffff';
const TEXT_DARK       = '#1c1c1c';
const TEXT_SECONDARY  = '#6b6b6b';
const AVATAR_BG       = '#1f2937';
const MAP_BG          = '#ecebe4';
const MAP_PARK        = '#d7e6c9';
const MAP_WATER       = '#c7dce8';
const LEAF_COLOR      = '#cfe9cf';
const LEAF_COLOR_DARK = '#a9d6ab';

// Puntos que dibujan la línea punteada de la ruta dentro del mapa
const ROUTE_DOTS = [
  { left: 18, top: 26 },
  { left: 34, top: 20 },
  { left: 50, top: 18 },
  { left: 66, top: 24 },
  { left: 80, top: 36 },
  { left: 90, top: 52 },
  { left: 106, top: 60 },
  { left: 124, top: 58 },
  { left: 140, top: 66 },
  { left: 156, top: 80 },
  { left: 172, top: 92 },
  { left: 190, top: 100 },
  { left: 208, top: 96 },
  { left: 224, top: 104 },
  { left: 238, top: 116 },
];

export default function DetalleDelPaseoScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <View style={styles.container}>
        {/* ── CARD ── */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={TEXT_DARK} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detalle de actividad</Text>
            <View style={styles.backBtn} />
          </View>
          <Text style={styles.headerSubtitle}>Hoy, 29/05/2024 • 15:30</Text>

          {/* Paseador */}
          <View style={styles.walkerRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={26} color={WHITE} />
            </View>

            <View style={styles.walkerInfo}>
              <Text style={styles.walkerLabel}>Paseador</Text>
              <Text style={styles.walkerName}>Juan Pérez</Text>
            </View>

            <View style={styles.ratingPill}>
              <Ionicons name="star" size={13} color={GREEN_DARK} />
              <Text style={styles.ratingText}>4.9</Text>
            </View>

            <TouchableOpacity style={styles.chatBtn} activeOpacity={0.85}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={GREEN} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Resumen del paseo */}
          <Text style={styles.sectionTitle}>Resumen del paseo</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="time-outline" size={18} color={GREEN} />
              <Text style={styles.infoLabel}>Duración</Text>
            </View>
            <Text style={styles.infoValue}>30 min</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="location-outline" size={18} color={GREEN} />
              <Text style={styles.infoLabel}>Distancia</Text>
            </View>
            <Text style={styles.infoValue}>2.3 km</Text>
          </View>

          <View style={[styles.infoRow, { marginBottom: 12 }]}>
            <View style={styles.infoLeft}>
              <Ionicons name="git-network-outline" size={18} color={GREEN} />
              <Text style={styles.infoLabel}>Ruta realizada</Text>
            </View>
          </View>

          {/* Mapa: botón que más adelante abre Google Maps */}
          <TouchableOpacity style={styles.mapBox} activeOpacity={0.9}>
            <View style={styles.mapPark} />
            <View style={styles.mapWater} />

            {ROUTE_DOTS.map((p, i) => (
              <View key={i} style={[styles.routeDot, { left: p.left, top: p.top }]} />
            ))}

            <View style={[styles.mapPin, { top: 12, left: 8 }]}>
              <Ionicons name="walk" size={12} color={WHITE} />
            </View>
            <View style={[styles.mapPin, styles.mapPinEnd, { top: 104, left: 230 }]}>
              <Ionicons name="paw" size={12} color={WHITE} />
            </View>

            <View style={styles.verMapaBtn}>
              <Ionicons name="map-outline" size={13} color={GREEN} />
              <Text style={styles.verMapaText}>Ver mapa</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Total pagado */}
          <View style={[styles.infoRow, { marginBottom: 0 }]}>
            <Text style={styles.totalLabel}>Total pagado</Text>
            <Text style={styles.totalValue}>$ 6.500</Text>
          </View>
        </View>

        {/* ── BOTÓN VOLVER ── */}
        <TouchableOpacity style={styles.volverBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.volverBtnText}>Volver</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        {/* ── DECORACIÓN INFERIOR ── */}
        <View style={styles.bottomWave} pointerEvents="none">
          <View style={styles.leafClusterLeft}>
            <Ionicons name="leaf" size={26} color={LEAF_COLOR_DARK} style={styles.leafBack} />
            <Ionicons name="leaf" size={18} color={LEAF_COLOR} style={styles.leafFront} />
          </View>
          <View style={styles.leafClusterRight}>
            <Ionicons name="leaf" size={26} color={LEAF_COLOR_DARK} style={styles.leafBack} />
            <Ionicons name="leaf" size={18} color={LEAF_COLOR} style={styles.leafFront} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    position: 'relative',
    overflow: 'hidden',
  },

  // Card
  card: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 24,
    padding: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 24, height: 24, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 19, fontWeight: '800', color: TEXT_DARK, textAlign: 'center' },
  headerSubtitle: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },

  // Paseador
  walkerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: AVATAR_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  walkerInfo: { flex: 1 },
  walkerLabel: { fontSize: 12, color: TEXT_SECONDARY },
  walkerName: { fontSize: 16, fontWeight: '700', color: TEXT_DARK, marginTop: 2 },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN_LIGHT,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  ratingText: { fontSize: 13, fontWeight: '700', color: TEXT_DARK, marginLeft: 4 },
  chatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Divisor
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 16 },

  // Resumen del paseo
  sectionTitle: { fontSize: 15, fontWeight: '700', color: TEXT_DARK, marginBottom: 14 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: { fontSize: 14, color: TEXT_DARK, marginLeft: 8 },
  infoValue: { fontSize: 15, fontWeight: '700', color: TEXT_DARK },

  // Mapa (botón — se conecta con Google Maps API más adelante)
  mapBox: {
    height: 150,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: MAP_BG,
    overflow: 'hidden',
    position: 'relative',
  },
  mapPark: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 110,
    height: 80,
    backgroundColor: MAP_PARK,
    borderBottomRightRadius: 60,
    opacity: 0.85,
  },
  mapWater: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 130,
    height: 46,
    backgroundColor: MAP_WATER,
    borderBottomLeftRadius: 40,
    opacity: 0.85,
  },
  routeDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: GREEN,
  },
  mapPin: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: WHITE,
  },
  mapPinEnd: { backgroundColor: GREEN_DARK },
  verMapaBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  verMapaText: { fontSize: 12, fontWeight: '700', color: GREEN, marginLeft: 4 },

  // Total pagado
  totalLabel: { fontSize: 15, fontWeight: '700', color: TEXT_DARK },
  totalValue: { fontSize: 18, fontWeight: '800', color: TEXT_DARK },

  // Botón Volver
  volverBtn: {
    marginTop: 20,
    height: 56,
    borderRadius: 16,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  volverBtnText: { fontSize: 16, fontWeight: '700', color: WHITE },

  // Decoración inferior
  bottomWave: {
    position: 'absolute',
    left: -20,
    right: -20,
    bottom: -20,
    height: 130,
    backgroundColor: GREEN_LIGHT,
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
    opacity: 0.6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  leafClusterLeft: { width: 50, height: 50 },
  leafClusterRight: { width: 50, height: 50, alignItems: 'flex-end' },
  leafBack: { position: 'absolute', bottom: 0, transform: [{ rotate: '-15deg' }] },
  leafFront: { position: 'absolute', bottom: 4, left: 14, transform: [{ rotate: '20deg' }] },
});
