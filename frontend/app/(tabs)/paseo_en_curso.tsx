import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { dogsOf } from '../../api/walks';
import { useWalkPolling } from '../../hooks/use-walk-polling';
import { horaCorta, minutosTranscurridos, nombrePaseador, ratingNumero } from '../../lib/paseos';

// ─── COLORES ────────────────────────────────────────────────
const GREEN         = '#4eb82f';
const GREEN_DARK     = '#1b5e20';
const GREEN_MEDIUM   = '#58ad45';
const GREEN_LIGHT    = '#f1f9ef';
const GREEN_BORDER   = '#cdeacd';
const MAP_BG         = '#f1f0ef';
const MAP_ROAD       = '#e2e0dd';
const MAP_BLOCK      = '#e7ecdf';
const PIN_DARK       = '#101720';
const WHITE          = '#ffffff';
const TEXT_DARK       = '#1f2937';
const TEXT_SECONDARY  = '#8a8a8a';
const TEXT_MUTED      = '#9aa39a';
const RED             = '#ef4444';
const DRAG_HANDLE     = '#e5e7eb';
const STEP_PENDING_BG = '#f3f4f6';
const STEP_PENDING_DOT = '#c3c9c3';
const LEAF_COLOR      = '#cfe9cf';
const LEAF_COLOR_DARK = '#a9d6ab';
const BOX_BORDER      = '#eef0ee';

export default function PaseoEnCursoScreen() {
  const router = useRouter();
  const { walkId } = useLocalSearchParams<{ walkId?: string }>();
  const { walk, error, cargando } = useWalkPolling(walkId, { poll: true });

  // Guard de estado: esta pantalla solo sabe mostrar accepted/in_progress.
  // Si el paseo avanza (finished) o entran acá directo con un walkId de
  // otro estado, redirige a la pantalla que corresponde en vez de mostrar
  // datos que no tienen sentido.
  useEffect(() => {
    if (!walk) return;
    if (walk.status === 'finished') {
      router.replace({ pathname: '/paseo_finalizado', params: { walkId } });
    } else if (walk.status === 'canceled') {
      router.replace('/(tabs)');
    } else if (walk.status === 'searching') {
      router.replace({ pathname: '/buscando_paseador', params: { walkId } });
    }
  }, [walk, router, walkId]);

  if (cargando || !walk || walk.status === 'finished' || walk.status === 'canceled' || walk.status === 'searching') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <View style={styles.centerWrap}>
          {error ? <Text style={styles.errorText}>{error}</Text> : <ActivityIndicator color={GREEN} />}
        </View>
      </SafeAreaView>
    );
  }

  const perros = dogsOf(walk).map((d) => d.name).join(', ') || 'Tu mascota';
  const rating = ratingNumero(walk.walker?.averageRating);
  const enCurso = walk.status === 'in_progress';
  const minutos = enCurso ? minutosTranscurridos(walk.startTime) : walk.duration;
  const mensajeEstado = enCurso
    ? `${perros} está disfrutando su paseo 🐕`
    : `Tu paseador está en camino a buscar a ${perros}`;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={TEXT_DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paseo en curso</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── TARJETA DEL PERRO ── */}
        <View style={styles.tobyCard}>
          <View style={styles.tobyAvatar}>
            <Text style={styles.tobyAvatarEmoji}>🐶</Text>
          </View>
          <Text style={styles.tobyLabel}>{perros}</Text>
          <View style={{ flex: 1 }} />
          {minutos != null && (
            <View style={styles.tobyStat}>
              <Ionicons name="time-outline" size={15} color={GREEN} />
              <Text style={styles.tobyStatText}>{minutos} min</Text>
            </View>
          )}
        </View>

        {/* ── MAPA (ilustración decorativa) ── */}
        <View style={styles.mapWrapper}>
          <View style={styles.map}>
            {/* bloques de manzanas */}
            <View style={[styles.mapBlock, { top: 10, left: 10, width: 70, height: 50 }]} />
            <View style={[styles.mapBlock, { top: 20, right: 30, width: 90, height: 60 }]} />
            <View style={[styles.mapBlock, { top: 100, left: 30, width: 60, height: 40 }]} />
            <View style={[styles.mapBlock, { bottom: 60, right: 10, width: 80, height: 50 }]} />
            <View style={[styles.mapBlock, { bottom: 10, left: 60, width: 100, height: 45 }]} />

            {/* calles */}
            <View style={[styles.mapRoad, { top: 90, left: 0, right: 0, height: 3 }]} />
            <View style={[styles.mapRoadVertical, { left: 140, top: 0, bottom: 0, width: 3 }]} />
            <View style={[styles.mapRiver]} />

            {/* etiquetas de calles */}
            <Text style={[styles.mapLabel, { top: 8, right: 20 }]}>Parque{'\n'}Los Andes</Text>
            <Text style={[styles.mapLabel, { top: 90, right: 12 }]}>Av. del Libertador</Text>
            <Text style={[styles.mapLabel, { top: 175, left: 10 }]}>Club San Martín</Text>
            <Text style={[styles.mapLabel, { top: 165, left: 150 }]}>Plaza{'\n'}Italia</Text>
            <Text style={[styles.mapLabel, { bottom: 55, right: 20 }]}>Av. Rivadavia</Text>
            <Text style={[styles.mapLabel, { bottom: 5, right: 5 }]}>Plaza{'\n'}Sarmiento</Text>

            {/* ── RUTA (polilínea) ── */}
            <View style={[styles.routeSeg, { width: 90, top: 78, left: 30, transform: [{ rotate: '55deg' }] }]} />
            <View style={[styles.routeSeg, { width: 90, top: 128, left: 45, transform: [{ rotate: '-8deg' }] }]} />
            <View style={[styles.routeSeg, { width: 80, top: 128, left: 130, transform: [{ rotate: '35deg' }] }]} />
            <View style={[styles.routeSeg, { width: 100, top: 168, left: 195, transform: [{ rotate: '-12deg' }] }]} />
            <View style={[styles.routeSeg, { width: 60, top: 190, left: 285, transform: [{ rotate: '55deg' }] }]} />
            <View style={[styles.routeSeg, { width: 55, top: 235, left: 300, transform: [{ rotate: '5deg' }] }]} />

            {/* pin de inicio (paw) */}
            <View style={[styles.mapPin, { top: 55, left: 20 }]}>
              <Ionicons name="paw" size={16} color={WHITE} />
            </View>
            {/* pin de destino (home) */}
            <View style={[styles.mapPin, { top: 218, left: 285 }]}>
              <Ionicons name="home" size={16} color={WHITE} />
            </View>
          </View>

          {/* ── HOJA DE DETALLE (sheet) ── */}
          <View style={styles.sheet}>
            <View style={styles.dragHandle} />

            {/* paseador */}
            <View style={styles.walkerRow}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                activeOpacity={0.7}
                onPress={() => router.push({ pathname: '/estado_paseador', params: { walkId } })}
              >
                <View style={styles.walkerAvatar}>
                  <Ionicons name="person" size={26} color={WHITE} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.walkerNameRow}>
                    <Text style={styles.walkerName}>{nombrePaseador(walk) ?? 'Paseador'}</Text>
                    {rating != null && (
                      <>
                        <Ionicons name="star" size={14} color={GREEN_MEDIUM} style={{ marginLeft: 6 }} />
                        <Text style={styles.walkerRating}>{rating.toFixed(1)}</Text>
                      </>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chatBtn}
                activeOpacity={0.85}
                onPress={() => router.push({ pathname: '/chat', params: { walkId } })}
              >
                <Ionicons name="chatbubble-ellipses" size={18} color={WHITE} />
              </TouchableOpacity>
              {/* Sin onPress: el backend no expone el teléfono del paseador
                  (decisión de privacidad, no de cableado — ver plan). */}
              <TouchableOpacity style={styles.callBtn} activeOpacity={0.85} disabled>
                <Ionicons name="call" size={18} color={GREEN_MEDIUM} />
              </TouchableOpacity>
            </View>

            {/* chip de estado */}
            <View style={styles.statusChip}>
              <View style={styles.statusChipIcon}>
                <Ionicons name="paw" size={13} color={GREEN_MEDIUM} />
              </View>
              <Text style={styles.statusChipText}>{mensajeEstado}</Text>
            </View>

            {/* stat box */}
            {minutos != null && (
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <View style={styles.statBoxHeader}>
                    <Ionicons name="time-outline" size={13} color={TEXT_MUTED} />
                    <Text style={styles.statBoxLabel}>{enCurso ? 'TRANSCURRIDO' : 'DURACIÓN PREVISTA'}</Text>
                  </View>
                  <Text style={styles.statBoxValue}>{minutos} min</Text>
                </View>
              </View>
            )}

            {/* timeline — solo los 3 pasos con timestamp real disponible */}
            <View style={styles.timeline}>
              <TimelineStep label="Paseo solicitado" time={horaCorta(walk.createdAt)} status="done" />
              <TimelineStep label="Paseador asignado" time="--:--" status="done" />
              <TimelineStep
                label="Paseando ahora"
                time={horaCorta(walk.startTime)}
                status={enCurso ? 'active' : 'pending'}
                isLast
              />
            </View>
          </View>
        </View>

        {/* ── DECORACIÓN INFERIOR ── */}
        <View style={styles.decorRow} pointerEvents="none">
          <View style={styles.leafClusterLeft}>
            <Ionicons name="leaf" size={24} color={LEAF_COLOR_DARK} style={styles.leafBack} />
            <Ionicons name="leaf" size={16} color={LEAF_COLOR} style={styles.leafFront} />
          </View>
          <View style={styles.leafClusterRight}>
            <Ionicons name="leaf" size={24} color={LEAF_COLOR_DARK} style={styles.leafBack} />
            <Ionicons name="leaf" size={16} color={LEAF_COLOR} style={styles.leafFront} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── TIMELINE STEP ──────────────────────────────────────────
type StepStatus = 'done' | 'active' | 'pending';
function TimelineStep({
  label,
  time,
  status,
  isLast,
}: {
  label: string;
  time: string;
  status: StepStatus;
  isLast?: boolean;
}) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineIndicator}>
        <View
          style={[
            styles.timelineCircle,
            status === 'done' && styles.timelineCircleDone,
            status === 'active' && styles.timelineCircleActive,
            status === 'pending' && styles.timelineCirclePending,
          ]}
        >
          {status === 'done' && <Ionicons name="checkmark" size={13} color={WHITE} />}
        </View>
        {!isLast && (
          <View
            style={[
              styles.timelineLine,
              status === 'pending' ? styles.timelineLinePending : styles.timelineLineDone,
            ]}
          />
        )}
      </View>
      <View style={styles.timelineContent}>
        <Text
          style={[
            styles.timelineLabel,
            status === 'active' && styles.timelineLabelActive,
            status === 'pending' && styles.timelineLabelPending,
          ]}
        >
          {label}
        </Text>
      </View>
      <Text style={[styles.timelineTime, status === 'pending' && styles.timelineTimePending]}>
        {time}
      </Text>
    </View>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WHITE },
  container: { flex: 1, backgroundColor: WHITE },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  errorText: { fontSize: 14, color: RED, textAlign: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: WHITE,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: TEXT_DARK },

  // Toby card
  tobyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 14,
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BOX_BORDER,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tobyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  tobyAvatarEmoji: { fontSize: 18 },
  tobyLabel: { fontSize: 14, fontWeight: '600', color: TEXT_DARK },
  tobyStat: { flexDirection: 'row', alignItems: 'center', marginLeft: 10, gap: 4 },
  tobyStatText: { fontSize: 13, fontWeight: '700', color: TEXT_DARK, marginLeft: 3 },

  // Mapa
  mapWrapper: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  map: {
    height: 340,
    backgroundColor: MAP_BG,
    position: 'relative',
    overflow: 'hidden',
  },
  mapBlock: {
    position: 'absolute',
    backgroundColor: MAP_BLOCK,
    borderRadius: 6,
  },
  mapRoad: {
    position: 'absolute',
    backgroundColor: MAP_ROAD,
  },
  mapRoadVertical: {
    position: 'absolute',
    backgroundColor: MAP_ROAD,
  },
  mapRiver: {
    position: 'absolute',
    left: 40,
    top: 140,
    width: 3,
    height: 170,
    backgroundColor: '#cfe0ea',
    borderRadius: 2,
    transform: [{ rotate: '8deg' }],
  },
  mapLabel: {
    position: 'absolute',
    fontSize: 9,
    color: '#9a9a92',
    fontWeight: '500',
    textAlign: 'right',
  },
  routeSeg: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    backgroundColor: GREEN,
  },
  mapPin: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: GREEN,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  // Sheet
  sheet: {
    marginTop: -24,
    backgroundColor: WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: DRAG_HANDLE,
    alignSelf: 'center',
    marginBottom: 16,
  },

  // Walker row
  walkerRow: { flexDirection: 'row', alignItems: 'center' },
  walkerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: TEXT_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkerNameRow: { flexDirection: 'row', alignItems: 'center' },
  walkerName: { fontSize: 17, fontWeight: '700', color: TEXT_DARK },
  walkerRating: { fontSize: 13, fontWeight: '700', color: TEXT_DARK, marginLeft: 3 },
  chatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GREEN_MEDIUM,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    opacity: 0.4,
  },

  // Status chip
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN_LIGHT,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  statusChipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statusChipText: { fontSize: 13, fontWeight: '600', color: GREEN_DARK, flexShrink: 1 },

  // Stat boxes
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  statBox: {
    flex: 1,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BOX_BORDER,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statBoxHeader: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statBoxLabel: { fontSize: 11, fontWeight: '700', color: TEXT_MUTED, marginLeft: 5, letterSpacing: 0.3 },
  statBoxValue: { fontSize: 20, fontWeight: '700', color: TEXT_DARK, marginTop: 6 },

  // Timeline
  timeline: { marginTop: 22 },
  timelineRow: { flexDirection: 'row' },
  timelineIndicator: { alignItems: 'center', width: 26 },
  timelineCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCircleDone: { backgroundColor: GREEN_MEDIUM },
  timelineCircleActive: {
    backgroundColor: GREEN_MEDIUM,
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 5,
  },
  timelineCirclePending: {
    backgroundColor: STEP_PENDING_BG,
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 5,
  },
  timelineLine: { width: 2, flex: 1, minHeight: 30 },
  timelineLineDone: { backgroundColor: GREEN_MEDIUM },
  timelineLinePending: { backgroundColor: STEP_PENDING_BG },
  timelineContent: { flex: 1, marginLeft: 12, paddingBottom: 22 },
  timelineLabel: { fontSize: 14, fontWeight: '600', color: TEXT_DARK, lineHeight: 19 },
  timelineLabelActive: { color: GREEN_MEDIUM, fontWeight: '700' },
  timelineLabelPending: { color: TEXT_MUTED, fontWeight: '500' },
  timelineTime: { fontSize: 12, color: TEXT_SECONDARY, marginLeft: 8 },
  timelineTimePending: { color: '#c7cbc7' },

  // Decoración inferior
  decorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 8,
  },
  leafClusterLeft: { width: 50, height: 30 },
  leafClusterRight: { width: 50, height: 30, alignItems: 'flex-end' },
  leafBack: { position: 'absolute', bottom: 0, transform: [{ rotate: '-15deg' }] },
  leafFront: { position: 'absolute', bottom: 4, left: 14, transform: [{ rotate: '20deg' }] },
});
