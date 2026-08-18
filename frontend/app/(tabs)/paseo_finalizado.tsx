import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ─── COLORES ────────────────────────────────────────────────
const GREEN          = '#4eb82f';
const GREEN_DARK      = '#1b5e20';
const GREEN_LIGHT     = '#f1f9ef';
const SCREEN_BG       = '#f5f7f6';
const WHITE           = '#ffffff';
const TEXT_DARK       = '#1f2937';
const TEXT_SECONDARY  = '#8a8a8a';
const TEXT_MUTED      = '#9aa39a';
const BOX_BORDER      = '#eef0ee';
const BLUE_BG         = '#e8f3fb';
const BLUE_TITLE      = '#1f5c99';
const BLUE_TEXT       = '#2f6fb0';
const LEAF_COLOR      = '#cfe9cf';
const LEAF_COLOR_DARK = '#a9d6ab';
const WAVE_BACK       = '#edf6ea';
const WAVE_FRONT      = '#e0efdd';
const DOG_PLACEHOLDER = '#e9e4d8';

export default function PaseoFinalizadoScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={SCREEN_BG} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={TEXT_DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paseo Finalizado</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── ÍCONO DE ÉXITO ── */}
        <View style={styles.successWrapper}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={64} color={GREEN} />
          </View>
        </View>

        <Text style={styles.title}>¡Paseo finalizado!</Text>
        <Text style={styles.subtitle}>Toby ya está en casa</Text>

        {/* ── TARJETA DE ESTADÍSTICAS ── */}
        <View style={styles.statsCard}>
          <View style={styles.statsCol}>
            <View style={styles.statsColHeader}>
              <Ionicons name="time-outline" size={14} color={GREEN} />
              <Text style={styles.statsColLabel}>DURACIÓN</Text>
            </View>
            <Text style={styles.statsColValue}>30 min</Text>
          </View>

          <View style={styles.statsDivider} />

          <View style={styles.statsCol}>
            <View style={styles.statsColHeader}>
              <Ionicons name="footsteps-outline" size={14} color={GREEN} />
              <Text style={styles.statsColLabel}>DISTANCIA</Text>
            </View>
            <Text style={styles.statsColValue}>2.3 km</Text>
          </View>
        </View>

        {/* ── FOTO + RESEÑA ── */}
        <View style={styles.rowSection}>
          <View style={styles.dogPhoto}>
            <Ionicons name="paw" size={30} color="#c9bfa0" />
          </View>

          <View style={styles.reviewCard}>
            <View style={styles.reviewStarCircle}>
              <Ionicons name="star" size={16} color={BLUE_TITLE} />
            </View>
            <Text style={styles.reviewTitle}>Excelente paseo</Text>
            <Text style={styles.reviewText}>¡Toby se portó genial!</Text>
          </View>
        </View>

        {/* ── BOTÓN ── */}
        <TouchableOpacity style={styles.detailBtn} activeOpacity={0.85}>
          <Text style={styles.detailBtnText}>Ver detalle</Text>
        </TouchableOpacity>

        {/* ── DECORACIÓN INFERIOR ── */}
        <View style={styles.decorArea} pointerEvents="none">
          <View style={styles.waveBack} />
          <View style={styles.waveFront} />

          <Ionicons
            name="paw"
            size={16}
            color={LEAF_COLOR}
            style={[styles.decorPaw, { top: 12, left: 100 }]}
          />
          <Ionicons
            name="paw"
            size={18}
            color={LEAF_COLOR_DARK}
            style={[styles.decorPaw, { top: 46, left: 210, transform: [{ rotate: '20deg' }] }]}
          />

          <Sprout style={{ left: 18, bottom: 6 }} big />
          <Sprout style={{ left: 190, bottom: 22 }} />
          <Sprout style={{ right: 24, bottom: 10 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── BROTE DECORATIVO ──────────────────────────────────────
function Sprout({ style, big }: { style: any; big?: boolean }) {
  const size = big ? 1.3 : 1;
  return (
    <View style={[styles.sprout, style, { transform: [{ scale: size }] }]}>
      <View style={styles.sproutStem} />
      <Ionicons
        name="leaf"
        size={20}
        color={LEAF_COLOR_DARK}
        style={[styles.sproutLeaf, { left: -8, transform: [{ rotate: '-35deg' }] }]}
      />
      <Ionicons
        name="leaf"
        size={16}
        color={LEAF_COLOR}
        style={[styles.sproutLeaf, { left: 6, top: 8, transform: [{ rotate: '45deg' }] }]}
      />
    </View>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SCREEN_BG },
  container: { flex: 1, backgroundColor: SCREEN_BG },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: SCREEN_BG,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: TEXT_DARK },

  // Ícono de éxito
  successWrapper: { alignItems: 'center', marginTop: 18, marginBottom: 24 },
  successCircle: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 7,
    borderColor: GREEN,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: { fontSize: 25, fontWeight: '700', color: TEXT_DARK, textAlign: 'center' },
  subtitle: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 26,
  },

  // Tarjeta de estadísticas
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    backgroundColor: WHITE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BOX_BORDER,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statsCol: { flex: 1, alignItems: 'center' },
  statsColHeader: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statsColLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_MUTED,
    marginLeft: 5,
    letterSpacing: 0.3,
  },
  statsColValue: { fontSize: 21, fontWeight: '700', color: TEXT_DARK, marginTop: 8 },
  statsDivider: { width: 1, height: 46, backgroundColor: BOX_BORDER },

  // Foto + reseña
  rowSection: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 20,
    gap: 12,
  },
  dogPhoto: {
    width: 150,
    height: 132,
    borderRadius: 18,
    backgroundColor: DOG_PLACEHOLDER,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  reviewCard: {
    flex: 1,
    height: 132,
    backgroundColor: BLUE_BG,
    borderRadius: 18,
    padding: 14,
    justifyContent: 'center',
  },
  reviewStarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  reviewTitle: { fontSize: 14, fontWeight: '700', color: BLUE_TITLE },
  reviewText: { fontSize: 13, color: BLUE_TEXT, marginTop: 2, lineHeight: 18 },

  // Botón
  detailBtn: {
    marginHorizontal: 24,
    marginTop: 24,
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
  detailBtnText: { fontSize: 16, fontWeight: '700', color: WHITE },

  // Decoración inferior
  decorArea: {
    height: 170,
    marginTop: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  waveBack: {
    position: 'absolute',
    left: -40,
    right: -40,
    bottom: -170,
    height: 230,
    borderRadius: 999,
    backgroundColor: WAVE_BACK,
  },
  waveFront: {
    position: 'absolute',
    left: -60,
    right: -20,
    bottom: -190,
    height: 230,
    borderRadius: 999,
    backgroundColor: WAVE_FRONT,
  },
  decorPaw: { position: 'absolute' },

  sprout: { position: 'absolute', width: 20, height: 60, alignItems: 'center' },
  sproutStem: {
    position: 'absolute',
    bottom: 0,
    width: 3,
    height: 46,
    borderRadius: 2,
    backgroundColor: GREEN_LIGHT,
  },
  sproutLeaf: { position: 'absolute', top: 0 },
});
