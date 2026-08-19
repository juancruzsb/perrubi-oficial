import React, { useState } from 'react';
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
const RADIO_BORDER    = '#c7ccc7';
const NOTICE_BG       = '#f2f4f2';
const LEAF_COLOR      = '#cfe9cf';
const LEAF_COLOR_DARK  = '#a9d6ab';

type MetodoPago = {
  id: string;
  tipo: 'visa' | 'mastercard' | 'mercadopago';
  titulo: string;
  subtitulo?: string;
};

const metodosPago: MetodoPago[] = [
  { id: '1', tipo: 'visa', titulo: 'Tarjeta Visa •••• 4242' },
  { id: '2', tipo: 'mastercard', titulo: 'Mastercard •••• 8888' },
  { id: '3', tipo: 'mercadopago', titulo: 'Mercado Pago' },
];

function Logo({ tipo }: { tipo: MetodoPago['tipo'] }) {
  if (tipo === 'visa') {
    return (
      <View style={styles.logoBox}>
        <Text style={styles.visaText}>VISA</Text>
      </View>
    );
  }
  if (tipo === 'mastercard') {
    return (
      <View style={styles.logoBox}>
        <View style={styles.mastercardCircles}>
          <View style={[styles.mastercardCircle, styles.mastercardCircleLeft]} />
          <View style={[styles.mastercardCircle, styles.mastercardCircleRight]} />
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.logoBox, styles.mpLogoBox]}>
      <Ionicons name="business" size={20} color="#2f8fe0" />
    </View>
  );
}

export default function MetodosDePagoScreen() {
  const router = useRouter();
  const [seleccionado, setSeleccionado] = useState('1');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <View style={styles.container}>
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Métodos de pago</Text>
          <View style={styles.backBtn} />
        </View>

        {/* ── LISTA DE MÉTODOS ── */}
        <View style={styles.list}>
          {metodosPago.map((metodo) => {
            const activo = seleccionado === metodo.id;
            return (
              <TouchableOpacity
                key={metodo.id}
                style={styles.methodCard}
                activeOpacity={0.8}
                onPress={() => setSeleccionado(metodo.id)}
              >
                <Logo tipo={metodo.tipo} />

                <Text style={styles.methodTitle}>{metodo.titulo}</Text>

                {activo ? (
                  <View style={styles.radioActive}>
                    <Ionicons name="checkmark" size={16} color={WHITE} />
                  </View>
                ) : (
                  <View style={styles.radioInactive} />
                )}
              </TouchableOpacity>
            );
          })}

          {/* ── AGREGAR TARJETA ── */}
          <TouchableOpacity style={styles.methodCard} activeOpacity={0.8}>
            <View style={styles.addIcon}>
              <Ionicons name="add" size={22} color={GREEN} />
            </View>
            <Text style={styles.methodTitle}>Agregar tarjeta</Text>
            <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>

        {/* ── AVISO DE SEGURIDAD ── */}
        <View style={styles.noticeBox}>
          <View style={styles.noticeIcon}>
            <Ionicons name="lock-closed" size={16} color={GREEN} />
          </View>
          <Text style={styles.noticeText}>Tus pagos están 100% seguros</Text>
        </View>

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

  // Lista
  list: { marginTop: 24 },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  // Logos
  logoBox: {
    width: 44,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  visaText: {
    fontSize: 11,
    fontWeight: '800',
    fontStyle: 'italic',
    color: '#1a1f71',
    letterSpacing: 0.5,
  },
  mastercardCircles: {
    flexDirection: 'row',
    width: 26,
    height: 16,
    alignItems: 'center',
  },
  mastercardCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: 'absolute',
  },
  mastercardCircleLeft: { backgroundColor: '#eb001b', left: 0 },
  mastercardCircleRight: { backgroundColor: '#f79e1b', left: 10, opacity: 0.85 },
  mpLogoBox: { backgroundColor: '#eaf3fc' },

  methodTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_DARK,
  },

  // Radios
  radioActive: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInactive: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: RADIO_BORDER,
  },

  // Agregar tarjeta
  addIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  // Aviso de seguridad
  noticeBox: {
    marginTop: 12,
    backgroundColor: NOTICE_BG,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_DARK,
    lineHeight: 20,
  },

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
