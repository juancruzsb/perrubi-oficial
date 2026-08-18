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

export default function BuscandoPaseadorScreen() {
  const router = useRouter();

  const cancelarViaje = () => {
    router.back();
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
        <Text style={styles.title}>Estamos buscando{'\n'}al mejor paseador{'\n'}para ti</Text>
        <Text style={styles.subtitle}>Esto puede tardar unos segundos...</Text>

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
            <View style={styles.stepCirclePending}>
              <View style={styles.stepDotPending} />
            </View>
            <Text style={styles.stepTextPending}>Esperando respuestas</Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {/* ── BOTÓN CANCELAR ── */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={cancelarViaje}
          activeOpacity={0.85}
        >
          <Text style={styles.cancelBtnText}>Cancelar viaje</Text>
        </TouchableOpacity>

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
