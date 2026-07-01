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

const GREEN       = '#4caf50';
const GREEN_LIGHT = '#e8f5e9';
const GREEN_DARK  = '#2e7d32';
const WHITE       = '#ffffff';
const TEXT_PRIMARY   = '#1a1a1a';
const TEXT_SECONDARY = '#666666';
const TEXT_MUTED     = '#aaaaaa';
const BORDER         = '#e0e0e0';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      <View style={styles.container}>

        {/* ── LOGO ── */}
        <View style={styles.logoSection}>
          {/*
            TODO: reemplazar por:
            <Image source={require('@/assets/images/logo-pin.png')} style={styles.logoImg} />
          */}
          <View style={styles.logoPin}>
            <View style={styles.logoPinInner}>
              <Text style={styles.logoPinEmoji}>🐾</Text>
            </View>
            {/* punta del pin */}
            <View style={styles.logoPinTip} />
          </View>

          <Text style={styles.logoText}>Perrubi</Text>
          <Text style={styles.tagline}>
            Paseos seguros,{'\n'}perros{' '}
            <Text style={styles.taglineGreen}>felices.</Text>
          </Text>
          <Text style={styles.descripcion}>
            Conectamos dueños de perros con{'\n'}paseadores de confianza.
          </Text>
        </View>

        {/* ── FEATURES ── */}
        <View style={styles.featuresSection}>
          <View style={styles.featureRow}>
            {/* TODO: <Image source={require('@/assets/icons/check-pin.png')} style={styles.featureIcon} /> */}
            <View style={[styles.featureIconWrap, { backgroundColor: GREEN_LIGHT }]}>
              <Text style={styles.featureIconEmoji}>✓</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Paseadores verificados</Text>
              <Text style={styles.featureSub}>Confianza y seguridad para tu mascota.</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            {/* TODO: <Image source={require('@/assets/icons/ubicacion-pin.png')} style={styles.featureIcon} /> */}
            <View style={[styles.featureIconWrap, { backgroundColor: GREEN_LIGHT }]}>
              <Text style={styles.featureIconEmoji}>📍</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Seguimiento en tiempo real</Text>
              <Text style={styles.featureSub}>Sabés dónde está tu perro en todo momento.</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            {/* TODO: <Image source={require('@/assets/icons/chat-pin.png')} style={styles.featureIcon} /> */}
            <View style={[styles.featureIconWrap, { backgroundColor: GREEN_LIGHT }]}>
              <Text style={styles.featureIconEmoji}>💬</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Comunicación directa</Text>
              <Text style={styles.featureSub}>Hablá con el paseador cuando lo necesites.</Text>
            </View>
          </View>
        </View>

        {/* ── BOTONES ── */}
        <View style={styles.botonesSection}>

          {/* Iniciar sesión */}
          <TouchableOpacity
            style={styles.btnPrimario}
            onPress={() => router.push('/login-form')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimarioText}>Iniciar sesión</Text>
            <Text style={styles.btnArrow}>→</Text>
          </TouchableOpacity>

          {/* Crear cuenta */}
          <TouchableOpacity
            style={styles.btnSecundario}
            onPress={() => router.push('/registro')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnSecundarioText}>Crear cuenta</Text>
            <Text style={styles.btnArrowGreen}>→</Text>
          </TouchableOpacity>

          {/* Divisor */}
          <View style={styles.divisorRow}>
            <View style={styles.divisorLine} />
            <Text style={styles.divisorText}>o continúa con</Text>
            <View style={styles.divisorLine} />
          </View>

          {/* Google */}
          <TouchableOpacity style={styles.btnGoogle} activeOpacity={0.85}>
            {/* TODO: <Image source={require('@/assets/icons/google.png')} style={{width:20,height:20}} /> */}
            <Text style={styles.btnGoogleIcon}>G</Text>
            <Text style={styles.btnGoogleText}>Continuar con Google</Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: WHITE },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 32, paddingBottom: 24, justifyContent: 'space-between' },

  // Logo
  logoSection:   { alignItems: 'center' },
  logoPin: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoPinInner: {
    width: 72, height: 72,
    borderRadius: 36,
    backgroundColor: GREEN,
    alignItems: 'center', justifyContent: 'center',
    // simula el pin redondeado
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 36,
    transform: [{ rotate: '45deg' }],
  },
  logoPinEmoji: {
    fontSize: 30,
    transform: [{ rotate: '-45deg' }],
  },
  logoPinTip: {
    // la punta del pin ya está simulada con el borderRadius asimétrico
    display: 'none',
  },
  logoText: {
    fontSize: 36, fontWeight: '800', color: TEXT_PRIMARY, marginBottom: 6,
  },
  tagline: {
    fontSize: 22, fontWeight: '700', color: TEXT_PRIMARY,
    textAlign: 'center', lineHeight: 30, marginBottom: 8,
  },
  taglineGreen: { color: GREEN },
  descripcion: {
    fontSize: 13, color: TEXT_SECONDARY,
    textAlign: 'center', lineHeight: 20,
  },

  // Features
  featuresSection: { gap: 14, marginVertical: 8 },
  featureRow:      { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  featureIconEmoji: { fontSize: 16 },
  featureText:  { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },
  featureSub:   { fontSize: 12, color: TEXT_SECONDARY, marginTop: 1 },

  // Botones
  botonesSection: { gap: 12 },

  btnPrimario: {
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimarioText: { fontSize: 16, fontWeight: '700', color: WHITE },
  btnArrow:        { fontSize: 18, color: WHITE, fontWeight: '700' },

  btnSecundario: {
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: GREEN,
    backgroundColor: WHITE,
  },
  btnSecundarioText: { fontSize: 16, fontWeight: '700', color: GREEN },
  btnArrowGreen:     { fontSize: 18, color: GREEN, fontWeight: '700' },

  divisorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divisorLine:{ flex: 1, height: 0.5, backgroundColor: BORDER },
  divisorText:{ fontSize: 12, color: TEXT_MUTED },

  btnGoogle: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },
  btnGoogleIcon: {
    fontSize: 16, fontWeight: '800', color: '#4285F4',
    // TODO: reemplazar con <Image source={require('@/assets/icons/google.png')} />
  },
  btnGoogleText: { fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY },
});