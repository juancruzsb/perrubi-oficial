import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ─── COLORES ────────────────────────────────────────────────
const GREEN         = '#4caf50';
const GREEN_DARK     = '#1b5e20';
const GREEN_LIGHT    = '#eaf7eb';
const BORDER         = '#e6e9e6';
const BG             = '#fbfdfb';
const WHITE          = '#ffffff';
const TEXT_DARK       = '#1c1c1c';
const TEXT_SECONDARY  = '#6b6b6b';
const AVATAR_BG        = '#e5e5e5';
const RATE_ICON_BG     = '#e2e4e2';
const RATE_ICON_COLOR  = '#8a8f8a';
const LEAF_COLOR      = '#cfe9cf';
const LEAF_COLOR_DARK  = '#a9d6ab';

type Notificacion = {
  id: string;
  tipo: 'avatar' | 'estado';
  titulo: string;
  subtitulo: string;
  hora: string;
};

const notificaciones: Notificacion[] = [
  {
    id: '1',
    tipo: 'avatar',
    titulo: 'Juan aceptó tu paseo',
    subtitulo: '¡Nos vemos pronto!',
    hora: '14:30',
  },
  {
    id: '2',
    tipo: 'estado',
    titulo: 'Paseo en progreso',
    subtitulo: 'Juan está paseando a Toby 🐕',
    hora: '14:50',
  },
  {
    id: '3',
    tipo: 'estado',
    titulo: 'Paseo finalizado',
    subtitulo: '¡Esperamos que todo haya salido bien!',
    hora: '15:20',
  },
];

export default function NotificacionesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <View style={styles.container}>
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          <View style={styles.backBtn} />
        </View>

        {/* ── CARD ── */}
        <View style={styles.card}>
          {notificaciones.map((n, index) => (
            <View key={n.id}>
              <View style={styles.row}>
                {n.tipo === 'avatar' ? (
                  <View style={styles.avatar}>
                    <Ionicons name="walk" size={20} color={TEXT_SECONDARY} />
                  </View>
                ) : (
                  <View style={styles.statusIcon}>
                    <Ionicons name="checkmark-circle" size={22} color={GREEN} />
                  </View>
                )}

                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>{n.titulo}</Text>
                  <Text style={styles.rowSubtitle}>{n.subtitulo}</Text>
                </View>

                <Text style={styles.rowTime}>{n.hora}</Text>
              </View>
              <View style={styles.divider} />
            </View>
          ))}

          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/calificacion' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.rateIcon}>
              <Ionicons name="person" size={20} color={RATE_ICON_COLOR} />
            </View>

            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Calificá a tu paseador</Text>
              <Text style={styles.rowSubtitle}>Tu opinión nos ayuda a mejorar</Text>
            </View>

            <Text style={styles.rowTime}>15:21</Text>
          </TouchableOpacity>
        </View>

        {/* ── BOTÓN NOTIFICACIONES ANTERIORES ── */}
        <TouchableOpacity style={styles.olderBtn} activeOpacity={0.85}>
          <Text style={styles.olderBtnText}>Ver notificaciones anteriores</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        {/* ── DECORACIÓN INFERIOR ── */}
        <View style={styles.bottomWave} pointerEvents="none">
          <View style={styles.leafClusterLeft}>
            <Ionicons name="leaf" size={26} color={LEAF_COLOR_DARK} style={styles.leafBack} />
            <Ionicons name="leaf" size={18} color={LEAF_COLOR} style={styles.leafFront} />
          </View>
          <Ionicons name="paw" size={22} color={LEAF_COLOR} style={styles.pawDecor} />
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
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },

  // Header
  header: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 22, height: 22, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },

  // Card
  card: {
    marginTop: 24,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 4,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AVATAR_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rateIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: RATE_ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: TEXT_DARK },
  rowSubtitle: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 3, lineHeight: 18 },
  rowTime: { fontSize: 12, color: TEXT_SECONDARY, marginLeft: 8 },

  divider: { height: 1, backgroundColor: BORDER },

  // Botón notificaciones anteriores
  olderBtn: {
    marginTop: 24,
    backgroundColor: GREEN,
    borderRadius: 28,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: GREEN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  olderBtnText: { fontSize: 16, fontWeight: '700', color: WHITE },

  // Decoración inferior
  bottomWave: {
    position: 'absolute',
    left: -20,
    right: -20,
    bottom: Platform.OS === 'ios' ? -10 : -20,
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
  pawDecor: { marginBottom: 30, transform: [{ rotate: '-10deg' }] },
});
