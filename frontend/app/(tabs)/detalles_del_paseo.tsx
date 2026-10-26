import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { InteractiveMap } from '../../components/interactive-map';
import { useAtrasDelFlujo } from '../../hooks/use-atras';
import { useWalkPolling } from '../../hooks/use-walk-polling';
import { distanciaLegible, useWalkRoute } from '../../hooks/use-walk-route';
import { nombrePaseador, ratingNumero } from '../../lib/paseos';

// ─── COLORES ────────────────────────────────────────────────
const GREEN          = '#4caf50';
const GREEN_DARK      = '#1b5e20';
const GREEN_LIGHT     = '#eaf7eb';
const BORDER          = '#e6e9e6';
const BG              = '#fbfdfb';
const WHITE           = '#ffffff';
const TEXT_DARK       = '#1c1c1c';
const TEXT_SECONDARY  = '#6b6b6b';
const RED             = '#ef4444';
const AVATAR_BG       = '#1f2937';
const MAP_BG          = '#ecebe4';
const LEAF_COLOR      = '#cfe9cf';
const LEAF_COLOR_DARK = '#a9d6ab';

function fechaLarga(iso: string | null): string {
  if (!iso) return '';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  const fechaTxt = fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const horaTxt = `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
  return `${fechaTxt} • ${horaTxt}`;
}

export default function DetalleDelPaseoScreen() {
  const router = useRouter();
  const volver = useAtrasDelFlujo();
  const { walkId } = useLocalSearchParams<{ walkId?: string }>();
  const { walk, error, cargando } = useWalkPolling(walkId);

  // Recorrido real guardado por el backend (puntos GPS del paseo). Solo tiene
  // sentido una vez finalizado.
  const { ruta, estado: rutaEstado, mapa: mapaRuta } = useWalkRoute(walk);
  const finalizado = walk?.status === 'finished';

  const rating = walk ? ratingNumero(walk.walker?.averageRating) : null;
  const precio = walk?.price != null ? Number(walk.price) : null;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── CARD ── */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={volver} hitSlop={12} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={TEXT_DARK} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detalle de actividad</Text>
            <View style={styles.backBtn} />
          </View>

          {cargando ? (
            <View style={styles.cargandoWrap}>
              <ActivityIndicator color={GREEN} />
            </View>
          ) : error || !walk ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error || 'No pudimos cargar este paseo.'}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.headerSubtitle}>{fechaLarga(walk.startTime ?? walk.createdAt)}</Text>

              {/* Paseador */}
              {walk.walker ? (
                <View style={styles.walkerRow}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={26} color={WHITE} />
                  </View>

                  <View style={styles.walkerInfo}>
                    <Text style={styles.walkerLabel}>Paseador</Text>
                    <Text style={styles.walkerName}>{nombrePaseador(walk)}</Text>
                  </View>

                  {rating != null && (
                    <View style={styles.ratingPill}>
                      <Ionicons name="star" size={13} color={GREEN_DARK} />
                      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.chatBtn}
                    activeOpacity={0.85}
                    onPress={() => router.push({ pathname: '/chat', params: { walkId: String(walk.id) } })}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color={GREEN} />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.sinPaseador}>Sin paseador asignado</Text>
              )}

              <View style={styles.divider} />

              {/* Resumen del paseo */}
              <Text style={styles.sectionTitle}>Resumen del paseo</Text>

              <View style={styles.infoRow}>
                <View style={styles.infoLeft}>
                  <Ionicons name="time-outline" size={18} color={GREEN} />
                  <Text style={styles.infoLabel}>Duración</Text>
                </View>
                <Text style={styles.infoValue}>
                  {walk.duration != null ? `${walk.duration} min` : 'Sin registrar'}
                </Text>
              </View>

              <View style={[styles.infoRow, { marginBottom: 12 }]}>
                <View style={styles.infoLeft}>
                  <Ionicons name="git-network-outline" size={18} color={GREEN} />
                  <Text style={styles.infoLabel}>Ruta realizada</Text>
                </View>
                {finalizado && ruta && ruta.distanceMeters > 0 && (
                  <Text style={styles.infoValue}>{distanciaLegible(ruta.distanceMeters)}</Text>
                )}
              </View>

              {/* Recorrido real del paseo (puntos GPS que fue guardando el backend) */}
              {finalizado && mapaRuta ? (
                <InteractiveMap data={mapaRuta} style={styles.mapBox} />
              ) : (
                <View style={[styles.mapBox, styles.mapVacio]}>
                  {finalizado && rutaEstado === 'cargando' ? (
                    <ActivityIndicator color={GREEN} />
                  ) : (
                    <Text style={styles.mapVacioText}>
                      {finalizado && rutaEstado === 'error'
                        ? 'No pudimos cargar el recorrido.'
                        : 'No hay recorrido registrado para este paseo.'}
                    </Text>
                  )}
                </View>
              )}

              {precio != null && Number.isFinite(precio) && walk?.status === 'finished' && (
                <>
                  <View style={styles.divider} />
                  <View style={[styles.infoRow, { marginBottom: 0 }]}>
                    <Text style={styles.totalLabel}>Total pagado</Text>
                    <Text style={styles.totalValue}>
                      $ {precio.toLocaleString('es-AR')}
                    </Text>
                  </View>
                </>
              )}
            </>
          )}
        </View>

        {/* ── BOTÓN VOLVER ── */}
        <TouchableOpacity style={styles.volverBtn} onPress={volver} activeOpacity={0.85}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: {
    flexGrow: 1,
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

  cargandoWrap: { paddingVertical: 40, alignItems: 'center' },
  errorBanner: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
  },
  errorText: { fontSize: 13, color: RED, textAlign: 'center' },
  sinPaseador: { fontSize: 14, color: TEXT_SECONDARY, fontStyle: 'italic' },

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

  // Mapa del recorrido
  mapBox: {
    height: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: MAP_BG,
    overflow: 'hidden',
  },
  mapVacio: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  mapVacioText: { fontSize: 13, color: TEXT_SECONDARY, textAlign: 'center' },

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
