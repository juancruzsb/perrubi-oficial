import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { dogsOf, getMyWalks } from '../../api/walks';
import type { Walk } from '../../api/types';
import { agruparPorFecha, horaCorta, nombrePaseador, presentacionEstado, rutaDeWalk } from '../../lib/paseos';

// ─── COLORES ────────────────────────────────────────────────
const GREEN          = '#4caf50';
const GREEN_LIGHT     = '#eaf7eb';
const BORDER          = '#e6e9e6';
const BG              = '#fbfdfb';
const WHITE           = '#ffffff';
const TEXT_DARK        = '#1c1c1c';
const TEXT_SECONDARY   = '#6b6b6b';
const RED             = '#ef4444';
const LEAF_COLOR      = '#cfe9cf';
const LEAF_COLOR_DARK  = '#a9d6ab';

const filtros = ['Todas', 'Completadas', 'Canceladas'] as const;
type Filtro = (typeof filtros)[number];

function tituloPaseo(w: Walk): string {
  const nombres = dogsOf(w).map((d) => d.name).join(', ');
  const duracion = w.duration != null ? `${w.duration} min` : (w.walkType === 'group' ? 'Paseo grupal' : 'Paseo individual');
  return nombres ? `${duracion} · ${nombres}` : duracion;
}

export default function MisPaseosScreen() {
  const router = useRouter();
  const [filtro, setFiltro] = useState<Filtro>('Todas');

  // null = todavía no cargó (evita flashear el estado vacío antes de tiempo)
  const [walks, setWalks] = useState<Walk[] | null>(null);
  const [error, setError] = useState('');
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async (esRefresh = false) => {
    try {
      setError('');
      if (esRefresh) setRefrescando(true);
      const w = await getMyWalks();
      setWalks(w);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar tus paseos.');
    } finally {
      if (esRefresh) setRefrescando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const cargando = walks === null;

  const walksFiltrados = (walks ?? []).filter((w) => {
    if (filtro === 'Todas') return true;
    if (filtro === 'Completadas') return w.status === 'finished';
    return w.status === 'canceled';
  });
  const grupos = agruparPorFecha(walksFiltrados);
  const tienePaseos = walksFiltrados.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={() => cargar(true)} colors={[GREEN]} />
        }
      >
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

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {cargando ? (
            <View style={styles.cargandoWrap}>
              <ActivityIndicator color={GREEN} />
            </View>
          ) : tienePaseos ? (
            grupos.map((g) => (
              <View key={g.fecha}>
                <Text style={styles.sectionLabel}>{g.fecha}</Text>

                {g.paseos.map((p) => {
                  const est = presentacionEstado(p.status);
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.paseoRow}
                      activeOpacity={0.7}
                      onPress={() => router.push(rutaDeWalk(p) as any)}
                    >
                      <View style={[styles.iconCircle, { backgroundColor: est.fondo }]}>
                        <Ionicons name={est.icono} size={20} color={est.color} />
                      </View>

                      <View style={styles.paseoInfo}>
                        <Text style={styles.paseoTitle}>{tituloPaseo(p)}</Text>
                        <Text style={styles.paseoSub}>
                          {nombrePaseador(p) ? `Con ${nombrePaseador(p)}` : 'Sin paseador asignado'}
                        </Text>
                      </View>

                      <View style={styles.paseoRight}>
                        <Text style={styles.paseoHora}>{horaCorta(p.startTime ?? p.createdAt)}</Text>
                        <Text style={[styles.paseoEstado, { color: est.color }]}>{est.etiqueta}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          ) : (
            <View style={styles.vacioWrap}>
              <Text style={styles.vacioEmoji}>📅</Text>
              <Text style={styles.vacioTitulo}>
                {filtro === 'Todas' ? 'Todavía no tenés paseos' : `No hay paseos en "${filtro}"`}
              </Text>
              {filtro === 'Todas' && (
                <Text style={styles.vacioSubtitulo}>Cuando reserves un paseo, lo verás aquí.</Text>
              )}
            </View>
          )}

          <Ionicons name="paw" size={26} color={LEAF_COLOR} style={styles.pawCorner} />
        </View>

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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
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

  errorBanner: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
  },
  errorText: { fontSize: 13, color: RED, textAlign: 'center' },
  cargandoWrap: { paddingVertical: 32, alignItems: 'center' },

  // Vacío
  vacioWrap: { alignItems: 'center', paddingVertical: 24 },
  vacioEmoji: { fontSize: 32, marginBottom: 10 },
  vacioTitulo: { fontSize: 15, fontWeight: '700', color: TEXT_DARK, textAlign: 'center' },
  vacioSubtitulo: { fontSize: 13, color: TEXT_SECONDARY, textAlign: 'center', marginTop: 4 },

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
    marginTop: 8,
    height: 110,
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
