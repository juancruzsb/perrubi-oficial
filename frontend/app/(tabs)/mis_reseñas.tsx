import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

// ─── COLORES ────────────────────────────────────────────────
const GREEN        = '#4caf50';
const GREEN_LIGHT  = '#f1f8ee';
const ORANGE       = '#f5a623';
const WHITE        = '#ffffff';
const TEXT_PRIMARY   = '#1a1a1a';
const TEXT_SECONDARY = '#666666';
const TEXT_MUTED     = '#999999';
const BORDER         = '#e5e5e5';
const TRACK          = '#e5e5e5';

const BREAKDOWN = [
  { star: 5, percent: 90 },
  { star: 4, percent: 7 },
  { star: 3, percent: 2 },
  { star: 2, percent: 1 },
  { star: 1, percent: 0 },
];

// ─── ESTRELLAS (llena/media/vacía) ───────────────────────────
function Stars({ rating, size, color }: { rating: number; size: number; color: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - (i - 1)));
        return (
          <View key={i} style={{ width: size, height: size }}>
            <Text style={{ fontSize: size, lineHeight: size, color: TRACK }}>★</Text>
            <View style={{ position: 'absolute', width: size * fill, height: size, overflow: 'hidden' }}>
              <Text style={{ fontSize: size, lineHeight: size, color }}>★</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function MisReseñasScreen() {
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
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reseñas</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── RESUMEN ── */}
        <View style={styles.card}>
          <Text style={styles.resumenTitulo}>Reseñas de Juan</Text>

          <View style={styles.resumenRow}>
            {/* Columna promedio */}
            <View style={styles.promedioCol}>
              <Text style={styles.promedioNumero}>4.9</Text>
              <Stars rating={4.5} size={16} color={GREEN} />
              <Text style={styles.promedioCantidad}>128 reseñas</Text>
            </View>

            {/* Columna desglose */}
            <View style={styles.desgloseCol}>
              {BREAKDOWN.map((b) => (
                <View key={b.star} style={styles.desgloseRow}>
                  <Text style={styles.desgloseLabel}>{b.star} ★</Text>
                  <View style={styles.barraTrack}>
                    <View style={[styles.barraFill, { width: `${b.percent}%` }]} />
                  </View>
                  <Text style={styles.desglosePorcentaje}>{b.percent}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── RESEÑA INDIVIDUAL ── */}
        <View style={styles.card}>
          <View style={styles.reviewHeaderRow}>
            <View style={styles.avatarCirculo}>
              {/* TODO: <Image source={{ uri: avatarUrl }} style={styles.avatarCirculo} /> */}
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewNombre}>Noah</Text>
              <Stars rating={4.5} size={14} color={ORANGE} />
            </View>
            <Text style={styles.reviewFecha}>Hoy</Text>
          </View>
          <Text style={styles.reviewTexto}>
            Excelente paseo, Toby volvió feliz y agotado! Muy recomendable 🐶❤️
          </Text>
        </View>

        {/* ── VER TODAS LAS RESEÑAS ── */}
        <TouchableOpacity style={styles.verTodasBtn} activeOpacity={0.7}>
          <Text style={styles.verTodasTexto}>Ver todas las reseñas</Text>
          <Text style={styles.verTodasChevron}>›</Text>
        </TouchableOpacity>

        {/* ── ILUSTRACIÓN DECORATIVA ── */}
        {/*
          TODO: reemplazar por:
          <Image source={require('@/assets/images/plantas-decorativas.png')} style={styles.ilustracion} />
        */}
        <View style={styles.ilustracionWrap}>
          <Text style={styles.ilustracionEmoji}>🌿</Text>
          <Text style={styles.ilustracionEmoji}>🌱</Text>
          <Text style={styles.ilustracionEmoji}>🌿</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: WHITE },
  scroll: { paddingBottom: 32 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  backBtn:     { width: 24, alignItems: 'center' },
  backArrow:   { fontSize: 22, color: TEXT_PRIMARY },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '700', color: TEXT_PRIMARY },

  // Card genérica
  card: {
    backgroundColor: WHITE,
    borderWidth: 1, borderColor: BORDER, borderRadius: 16,
    marginHorizontal: 20, marginTop: 16,
    padding: 20,
  },

  // Resumen
  resumenTitulo: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY, textAlign: 'center', marginBottom: 20 },
  resumenRow:    { flexDirection: 'row', alignItems: 'center' },

  promedioCol:      { alignItems: 'center', width: 100 },
  promedioNumero:   { fontSize: 44, fontWeight: '800', color: TEXT_PRIMARY, marginBottom: 6 },
  promedioCantidad: { fontSize: 12, color: TEXT_MUTED, marginTop: 8 },

  desgloseCol:  { flex: 1, gap: 8 },
  desgloseRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  desgloseLabel:{ fontSize: 12, color: TEXT_SECONDARY, width: 24 },
  barraTrack:   { flex: 1, height: 6, borderRadius: 3, backgroundColor: TRACK, overflow: 'hidden' },
  barraFill:    { height: '100%', borderRadius: 3, backgroundColor: GREEN },
  desglosePorcentaje: { fontSize: 12, color: TEXT_MUTED, width: 30, textAlign: 'right' },

  // Reseña individual
  reviewHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarCirculo: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#e0e0e0',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji:  { fontSize: 18, color: '#9e9e9e' },
  reviewNombre: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY, marginBottom: 4 },
  reviewFecha:  { fontSize: 12, color: TEXT_MUTED },
  reviewTexto:  { fontSize: 14, color: TEXT_SECONDARY, lineHeight: 20, marginTop: 12 },

  // Ver todas las reseñas
  verTodasBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginHorizontal: 20, marginTop: 20,
    paddingVertical: 16,
    borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: GREEN,
    backgroundColor: GREEN_LIGHT,
  },
  verTodasTexto:   { fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY },
  verTodasChevron: { fontSize: 18, color: TEXT_PRIMARY },

  // Ilustración decorativa
  ilustracionWrap: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 24, marginTop: 64, opacity: 0.5,
  },
  ilustracionEmoji: { fontSize: 32 },
});
