import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { changeWalkStatus, getWalk } from '../../api/walks';
import type { Walk } from '../../api/types';

// ─── COLORES ────────────────────────────────────────────────
const GREEN        = '#4caf50';
const GREEN_DARK    = '#1b5e20';
const GREEN_TITLE   = '#57b85a';
const GREEN_LIGHT   = '#eaf7eb';
const GREEN_BORDER  = '#cdeacd';
const CIRCLE_OUTER  = '#cdeccd';
const BG            = '#fbfdfb';
const WHITE         = '#ffffff';
const TEXT_SECONDARY = '#8a8a8a';
const TEXT_MUTED     = '#9aa39a';
const STEP_PENDING_BG = '#e2e6e2';
const STEP_PENDING_DOT = '#a9b0a9';
const LEAF_COLOR     = '#cfe9cf';
const LEAF_COLOR_DARK = '#a9d6ab';

const POLL_MS = 5000;

export default function BuscandoPaseadorScreen() {
  const router = useRouter();
  const { walkId } = useLocalSearchParams<{ walkId?: string }>();
  const id = Number(walkId);

  const [walk, setWalk] = useState<Walk | null>(null);
  const [error, setError] = useState('');
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    if (!walkId || Number.isNaN(id)) {
      setError('No encontramos el paseo. Volvé a intentarlo desde Inicio.');
      return;
    }

    let cancelado = false;
    let timer: ReturnType<typeof setTimeout>;

    // setTimeout recursivo (no setInterval): así no se apilan requests si
    // una tarda, y se puede frenar el ciclo apenas se sale de "searching".
    const tick = async () => {
      try {
        const w = await getWalk(id);
        if (cancelado) return;
        setWalk(w);
        setError('');

        if (w.status === 'canceled' || w.status === 'finished') {
          router.replace('/(tabs)');
          return;
        }
        if (w.status === 'accepted' || w.status === 'in_progress') {
          // Ya hay paseador: dejamos de pollear y pasamos a la pantalla del
          // paseo en curso, que hace su propio polling desde acá en adelante.
          router.replace({ pathname: '/paseo_en_curso', params: { walkId } });
          return;
        }
      } catch (err: any) {
        if (!cancelado) setError(err.message || 'No pudimos consultar el estado del paseo.');
      }
      if (!cancelado) timer = setTimeout(tick, POLL_MS);
    };

    tick();
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [walkId, id, router]);

  const encontrado = walk?.status === 'accepted' || walk?.status === 'in_progress';

  const cancelarViaje = async () => {
    if (!walkId || Number.isNaN(id)) {
      router.replace('/(tabs)');
      return;
    }
    try {
      setCancelando(true);
      await changeWalkStatus(id, 'canceled');
      router.replace('/(tabs)');
    } catch (err: any) {
      // Ej: "No se puede pasar de 'in_progress' a 'canceled'" — mensaje del
      // back ya listo para mostrar tal cual.
      setError(err.message || 'No pudimos cancelar el paseo.');
    } finally {
      setCancelando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <View style={styles.container}>
        {/* ── ÍCONO CENTRAL ── */}
        <View style={styles.iconOuter}>
          <View style={styles.iconMiddle}>
            <View style={styles.iconInner}>
              <View style={styles.pinShape}>
                <Ionicons name="paw" size={22} color={WHITE} style={styles.pawIcon} />
              </View>
              <View style={styles.pinDot} />
            </View>
          </View>
        </View>

        {/* ── TÍTULO ── */}
        {encontrado ? (
          <>
            <Text style={styles.title}>
              ¡Encontramos a{'\n'}{walk?.walker?.firstName ?? 'tu paseador'}!
            </Text>
            <Text style={styles.subtitle}>Ya está en camino para el paseo.</Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>Estamos buscando{'\n'}al mejor paseador{'\n'}para ti</Text>
            <Text style={styles.subtitle}>Esto puede tardar unos segundos...</Text>
          </>
        )}

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── CARD DE PROGRESO ── */}
        <View style={styles.card}>
          <View style={styles.stepRow}>
            <View style={styles.stepCircleDone}>
              <Ionicons name="checkmark" size={14} color={WHITE} />
            </View>
            <Text style={styles.stepTextDone}>Buscando paseadores disponibles</Text>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepCircleDone}>
              <Ionicons name="checkmark" size={14} color={WHITE} />
            </View>
            <Text style={styles.stepTextDone}>Enviando tu solicitud</Text>
          </View>

          <View style={[styles.stepRow, styles.stepRowLast]}>
            {encontrado ? (
              <View style={styles.stepCircleDone}>
                <Ionicons name="checkmark" size={14} color={WHITE} />
              </View>
            ) : (
              <View style={styles.stepCirclePending}>
                <View style={styles.stepDotPending} />
              </View>
            )}
            <Text style={encontrado ? styles.stepTextDone : styles.stepTextPending}>
              {encontrado ? 'Paseador encontrado' : 'Esperando respuestas'}
            </Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {/* ── BOTÓN CANCELAR / VER PASEOS ── */}
        {encontrado ? (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.85}
          >
            <Text style={styles.cancelBtnText}>Ver mis paseos</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.cancelBtn, cancelando && styles.cancelBtnDisabled]}
            onPress={cancelarViaje}
            activeOpacity={0.85}
            disabled={cancelando}
          >
            {cancelando
              ? <ActivityIndicator color={GREEN} />
              : <Text style={styles.cancelBtnText}>Cancelar viaje</Text>
            }
          </TouchableOpacity>
        )}

        {/* ── DECORACIÓN INFERIOR ── */}
        <View style={styles.decorRow} pointerEvents="none">
          <View style={styles.leafClusterLeft}>
            <Ionicons name="leaf" size={26} color={LEAF_COLOR_DARK} style={styles.leafBack} />
            <Ionicons name="leaf" size={18} color={LEAF_COLOR} style={styles.leafFront} />
          </View>
          <View style={styles.leafClusterRight}>
            <Ionicons name="leaf" size={26} color={LEAF_COLOR_DARK} style={styles.leafBack} />
            <Ionicons name="leaf" size={18} color={LEAF_COLOR} style={styles.leafFront} />
          </View>
        </View>
        <View style={styles.bottomWave} pointerEvents="none" />
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
    paddingTop: 48,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  // Ícono central
  iconOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: CIRCLE_OUTER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMiddle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinShape: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GREEN_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 4,
  },
  pawIcon: { transform: [{ rotate: '0deg' }] },
  pinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: WHITE,
    marginTop: 6,
  },

  // Título
  title: {
    marginTop: 32,
    fontSize: 26,
    fontWeight: '700',
    color: GREEN_TITLE,
    textAlign: 'center',
    lineHeight: 33,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 13,
    color: TEXT_SECONDARY,
    textAlign: 'center',
  },

  errorBanner: {
    width: '100%', marginTop: 16, padding: 12,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10,
  },
  errorText: { fontSize: 13, color: '#ef4444', textAlign: 'center' },

  // Card de progreso
  card: {
    width: '100%',
    marginTop: 40,
    backgroundColor: GREEN_LIGHT,
    borderWidth: 1,
    borderColor: GREEN_BORDER,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  stepRowLast: { marginBottom: 0 },
  stepCircleDone: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCirclePending: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: STEP_PENDING_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotPending: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: STEP_PENDING_DOT,
  },
  stepTextDone: { fontSize: 14, fontWeight: '600', color: '#2b2b2b' },
  stepTextPending: { fontSize: 14, fontWeight: '600', color: TEXT_MUTED },

  // Botón cancelar
  cancelBtn: {
    width: '100%',
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: GREEN,
    borderRadius: 28,
    paddingVertical: 17,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cancelBtnDisabled: { opacity: 0.6 },
  cancelBtnText: { fontSize: 16, fontWeight: '700', color: GREEN },

  // Decoración inferior
  decorRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 34 : 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  leafClusterLeft: { width: 50, height: 50 },
  leafClusterRight: { width: 50, height: 50, alignItems: 'flex-end' },
  leafBack: { position: 'absolute', bottom: 0, transform: [{ rotate: '-15deg' }] },
  leafFront: { position: 'absolute', bottom: 4, left: 14, transform: [{ rotate: '20deg' }] },
  bottomWave: {
    position: 'absolute',
    left: -20,
    right: -20,
    bottom: -30,
    height: 60,
    backgroundColor: GREEN_LIGHT,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    opacity: 0.5,
  },
});
