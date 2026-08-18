import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── COLORES ────────────────────────────────────────────────
const GREEN            = '#4caf50';
const GREEN_LIGHT       = '#eaf7eb';
const BORDER            = '#e6e9e6';
const BG                = '#fbfdfb';
const WHITE             = '#ffffff';
const TEXT_DARK          = '#1c1c1c';
const TEXT_SECONDARY     = '#6b6b6b';
const RED               = '#ef4444';
const CANCEL_ICON_BG     = '#eceeec';
const CANCEL_ICON_COLOR  = '#9a9f9a';
const LEAF_COLOR        = '#cfe9cf';
const LEAF_COLOR_DARK    = '#a9d6ab';

type Estado = 'Completado' | 'Cancelado';

type Paseo = {
  id: string;
  duracionKm: string;
  con: string;
  hora: string;
  estado: Estado;
};

type Grupo = {
  fecha: string;
  paseos: Paseo[];
};

const grupos: Grupo[] = [
  {
    fecha: 'Hoy',
    paseos: [
      { id: '1', duracionKm: '30 min - 2.3 km', con: 'Con Juan Pérez', hora: '15:30', estado: 'Completado' },
    ],
  },
  {
    fecha: 'Ayer',
    paseos: [
      { id: '2', duracionKm: '60 min - 4.1 km', con: 'Con Ana Gómez', hora: '10:30', estado: 'Completado' },
    ],
  },
  {
    fecha: '28/05',
    paseos: [
      { id: '3', duracionKm: '30 min - 2.0 km', con: 'Con Pedro Ruiz', hora: '16:00', estado: 'Cancelado' },
    ],
  },
];

const filtros = ['Todas', 'Completadas', 'Canceladas'] as const;
type Filtro = (typeof filtros)[number];

export default function MisPaseosScreen() {
  const [filtro, setFiltro] = useState<Filtro>('Todas');

  const gruposFiltrados = grupos
    .map((g) => ({
      ...g,
      paseos: g.paseos.filter((p) => {
        if (filtro === 'Todas') return true;
        if (filtro === 'Completadas') return p.estado === 'Completado';
        return p.estado === 'Cancelado';
      }),
    }))
    .filter((g) => g.paseos.length > 0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <View style={styles.container}>
        {/* ── HEADER ── */}
        <Text style={styles.headerTitle}>Mis Paseos</Text>

        {/* ── CARD ── */}
        <View style={styles.card}>
          {/* Filtros */}
          <View style={styles.tabsRow}>
            {filtros.map((f) => {
              const active = filtro === f;
              return (
                <TouchableOpacity
                  key={f}
                  style={[styles.tabBtn, active ? styles.tabBtnActive : styles.tabBtnInactive]}
                  onPress={() => setFiltro(f)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.tabBtnText, active ? styles.tabBtnTextActive : styles.tabBtnTextInactive]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {gruposFiltrados.map((g) => (
            <View key={g.fecha}>
              <Text style={styles.sectionLabel}>{g.fecha}</Text>

              {g.paseos.map((p) => {
                const completado = p.estado === 'Completado';
                return (
                  <View key={p.id} style={styles.paseoRow}>
                    <View style={[styles.iconCircle, { backgroundColor: completado ? GREEN_LIGHT : CANCEL_ICON_BG }]}>
                      <Ionicons name="location" size={20} color={completado ? GREEN : CANCEL_ICON_COLOR} />
                    </View>

                    <View style={styles.paseoInfo}>
                      <Text style={styles.paseoTitle}>{p.duracionKm}</Text>
                      <Text style={styles.paseoSub}>{p.con}</Text>
                    </View>

                    <View style={styles.paseoRight}>
                      <Text style={styles.paseoHora}>{p.hora}</Text>
                      <Text style={[styles.paseoEstado, { color: completado ? GREEN : RED }]}>{p.estado}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}

          <Ionicons name="paw" size={26} color={LEAF_COLOR} style={styles.pawCorner} />
        </View>

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
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },

  // Header
  headerTitle: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 22,
    fontWeight: '800',
    color: TEXT_DARK,
    textAlign: 'center',
  },

  // Card
  card: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },

  // Filtros
  tabsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: { backgroundColor: GREEN },
  tabBtnInactive: { backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER },
  tabBtnText: { fontSize: 13, fontWeight: '700' },
  tabBtnTextActive: { color: WHITE },
  tabBtnTextInactive: { color: TEXT_DARK },

  // Secciones
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 10,
  },

  // Fila de paseo
  paseoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paseoInfo: { flex: 1 },
  paseoTitle: { fontSize: 14, fontWeight: '700', color: TEXT_DARK },
  paseoSub: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 3 },
  paseoRight: { alignItems: 'flex-end', marginLeft: 8 },
  paseoHora: { fontSize: 12, color: TEXT_SECONDARY },
  paseoEstado: { fontSize: 12, fontWeight: '700', marginTop: 4 },

  // Pata decorativa
  pawCorner: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    opacity: 0.9,
    transform: [{ rotate: '15deg' }],
  },

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
