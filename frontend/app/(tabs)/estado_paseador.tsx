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
const GREEN_LIGHT    = '#eaf7eb';
const ORANGE         = '#f5a623';
const WHITE          = '#ffffff';
const TEXT_PRIMARY   = '#1a1a1a';
const TEXT_SECONDARY = '#666666';
const TEXT_MUTED     = '#999999';
const BORDER         = '#ededed';
const STAT_BG        = '#f5f6f5';
const AVATAR_BG      = '#e0e0e0';
const LEAF_DARK       = '#a9d6ab';
const LEAF_LIGHT      = '#cfe9cf';

export default function EstadoPaseadorScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Estado del paseador</Text>
        <View style={styles.backBtn} />
      </View>

      {/* ── CARD PRINCIPAL ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Perfil del paseador</Text>

        {/* Perfil */}
        <View style={styles.profileRow}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCirculo}>
              <Ionicons name="person" size={28} color="#9e9e9e" />
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.nombre}>Juan Pérez</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={ORANGE} />
              <Text style={styles.ratingNumero}>4.9</Text>
              <Text style={styles.ratingCantidad}>(128)</Text>
            </View>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <View style={styles.statValueRow}>
              <Ionicons name="shield-checkmark" size={14} color={GREEN} />
              <Text style={styles.statValue}>96%</Text>
            </View>
            <Text style={styles.statLabel}>Aceptación</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statValueRow}>
              <Ionicons name="star" size={14} color={ORANGE} />
              <Text style={styles.statValue}>4.9</Text>
            </View>
            <Text style={styles.statLabel}>Calificación</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statValueRow}>
              <Ionicons name="calendar" size={14} color={GREEN} />
              <Text style={styles.statValue}>1 año</Text>
            </View>
            <Text style={styles.statLabel}>En Perrubi</Text>
          </View>
        </View>

        {/* Sobre mí */}
        <View style={styles.sobreMiHeader}>
          <Text style={styles.sobreMiTitulo}>Sobre mí</Text>
          <Ionicons name="paw" size={28} color={LEAF_LIGHT} style={styles.pawDecor} />
        </View>
        <Text style={styles.sobreMiTexto}>
          Amo los perros y disfruto de cada paseo como si fuera mío.
        </Text>

        {/* Botón */}
        <TouchableOpacity style={styles.perfilBtn} activeOpacity={0.85}>
          <Text style={styles.perfilBtnTexto}>Ver perfil completo</Text>
          <Ionicons name="chevron-forward" size={16} color={WHITE} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} />

      {/* ── DECORACIÓN INFERIOR ── */}
      <View style={styles.decorWrap} pointerEvents="none">
        <View style={styles.bottomWave} />

        <View style={styles.leafClusterLeft}>
          <Ionicons name="leaf" size={30} color={LEAF_LIGHT} style={styles.leafBack} />
          <Ionicons name="leaf" size={20} color={LEAF_DARK} style={styles.leafFront} />
        </View>

        <View style={styles.leafClusterRight}>
          <Ionicons name="leaf" size={30} color={LEAF_LIGHT} style={styles.leafBack} />
          <Ionicons name="leaf" size={20} color={LEAF_DARK} style={styles.leafFront} />
        </View>

        <Ionicons name="leaf" size={14} color={LEAF_LIGHT} style={styles.leafSmallOne} />
        <Ionicons name="leaf" size={12} color={LEAF_LIGHT} style={styles.leafSmallTwo} />
      </View>
    </SafeAreaView>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WHITE },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  backBtn:     { width: 24, alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '700', color: TEXT_PRIMARY },

  // Card principal
  card: {
    backgroundColor: WHITE,
    borderWidth: 1, borderColor: BORDER, borderRadius: 24,
    marginHorizontal: 20, marginTop: 8,
    paddingVertical: 24, paddingHorizontal: 20,
  },
  cardTitulo: { fontSize: 13, fontWeight: '500', color: TEXT_MUTED, textAlign: 'center', marginBottom: 20 },

  // Perfil
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  avatarWrap: { width: 64, height: 64 },
  avatarCirculo: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: AVATAR_BG,
    alignItems: 'center', justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: GREEN, borderWidth: 2, borderColor: WHITE,
  },
  profileInfo: { flex: 1, gap: 6 },
  nombre: { fontSize: 20, fontWeight: '700', color: TEXT_PRIMARY },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingNumero: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },
  ratingCantidad: { fontSize: 14, color: TEXT_MUTED },

  // Estadísticas
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox: {
    flex: 1, backgroundColor: STAT_BG, borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 6,
    alignItems: 'center', gap: 6,
  },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY },
  statLabel: { fontSize: 11, color: TEXT_SECONDARY, textAlign: 'center' },

  // Sobre mí
  sobreMiHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  sobreMiTitulo: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },
  pawDecor: { transform: [{ rotate: '-10deg' }], opacity: 0.9 },
  sobreMiTexto: { fontSize: 14, color: TEXT_SECONDARY, lineHeight: 20, marginTop: 8, marginRight: 40 },

  // Botón
  perfilBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: GREEN, borderRadius: 30,
    paddingVertical: 16, marginTop: 24,
  },
  perfilBtnTexto: { fontSize: 15, fontWeight: '700', color: WHITE },

  // Decoración inferior
  decorWrap: {
    height: 140,
    position: 'relative',
    overflow: 'hidden',
  },
  bottomWave: {
    position: 'absolute',
    left: -20, right: -20, bottom: -40,
    height: 100,
    backgroundColor: GREEN_LIGHT,
    borderTopLeftRadius: 200, borderTopRightRadius: 200,
    opacity: 0.5,
  },
  leafClusterLeft: {
    position: 'absolute', left: 20, bottom: Platform.OS === 'ios' ? 34 : 18,
    width: 50, height: 50,
  },
  leafClusterRight: {
    position: 'absolute', right: 20, bottom: Platform.OS === 'ios' ? 34 : 18,
    width: 50, height: 50, alignItems: 'flex-end',
  },
  leafBack:  { position: 'absolute', bottom: 0, transform: [{ rotate: '-15deg' }] },
  leafFront: { position: 'absolute', bottom: 4, left: 14, transform: [{ rotate: '20deg' }] },
  leafSmallOne: { position: 'absolute', left: 90, bottom: 70, opacity: 0.6, transform: [{ rotate: '30deg' }] },
  leafSmallTwo: { position: 'absolute', right: 100, bottom: 90, opacity: 0.5, transform: [{ rotate: '-25deg' }] },
});
