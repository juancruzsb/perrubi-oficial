import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { login } from '../api/auth';

const GREEN        = '#4caf50';
const WHITE        = '#ffffff';
const BG           = '#f7f7f7';
const TEXT_PRIMARY = '#1a1a1a';
const TEXT_SECONDARY = '#666666';
const TEXT_MUTED   = '#aaaaaa';
const BORDER       = '#e0e0e0';
const BORDER_FOCUS = '#4caf50';
const RED          = '#ef4444';

export default function LoginFormScreen() {
  const router = useRouter();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [recordarme, setRecordarme] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const handleEntrar = async () => {
    setError('');

    if (!email || !password) {
      setError('Por favor completá todos los campos.');
      return;
    }

    try {
      setLoading(true);
      await login({ email, password });
      // Login exitoso → va al home
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── LOGO ── */}
        <View style={styles.logoSection}>
          <View style={styles.pinWrap}>
            <View style={styles.pinCircle}>
              <Text style={styles.pinEmoji}>🐾</Text>
            </View>
            <View style={styles.pinDot} />
          </View>
          <Text style={styles.logoText}>Perrubi</Text>
          <Text style={styles.tagline}>
            Inicia sesión para continuar con los{'\n'}
            <Text style={styles.taglineGreen}>paseos seguros</Text>
            <Text>.</Text>
          </Text>
        </View>

        {/* ── FORMULARIO ── */}
        <View style={styles.formSection}>

          {/* Error general */}
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email */}
          <Text style={styles.inputLabel}>Correo electrónico</Text>
          <View style={[styles.inputWrap, emailFocus && styles.inputWrapFocus]}>
            <Text style={styles.inputIconEmoji}>✉️</Text>
            <TextInput
              style={styles.textInput}
              placeholder="tu@email.com"
              placeholderTextColor={TEXT_MUTED}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
            />
          </View>

          {/* Contraseña */}
          <View style={styles.passLabelRow}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <TouchableOpacity>
              <Text style={styles.olvidaste}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.inputWrap, passFocus && styles.inputWrapFocus]}>
            <Text style={styles.inputIconEmoji}>🔒</Text>
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              placeholderTextColor={TEXT_MUTED}
              secureTextEntry={!showPass}
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
              onFocus={() => setPassFocus(true)}
              onBlur={() => setPassFocus(false)}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Text style={styles.inputIconEmoji}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Recordarme */}
          <TouchableOpacity
            style={styles.recordarmeRow}
            onPress={() => setRecordarme(!recordarme)}
          >
            <View style={[styles.checkbox, recordarme && styles.checkboxActive]}>
              {recordarme && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.recordarmeText}>Recordarme en este dispositivo</Text>
          </TouchableOpacity>

          {/* Botón Entrar */}
          <TouchableOpacity
            style={[styles.btnEntrar, loading && styles.btnDisabled]}
            onPress={handleEntrar}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={WHITE} />
              : <>
                  <Text style={styles.btnEntrarText}>Entrar</Text>
                  <Text style={styles.btnArrow}>→</Text>
                </>
            }
          </TouchableOpacity>

          {/* Divisor */}
          <View style={styles.divisorRow}>
            <View style={styles.divisorLine} />
            <Text style={styles.divisorText}>O CONTINÚA CON</Text>
            <View style={styles.divisorLine} />
          </View>

          {/* Google — TODO: implementar OAuth */}
          <TouchableOpacity style={styles.btnGoogle}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.btnGoogleText}>Continuar con Google</Text>
          </TouchableOpacity>

          <View style={styles.crearCuentaRow}>
            <Text style={styles.crearCuentaTexto}>¿No tenés una cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/registro' as any)}>
              <Text style={styles.crearCuentaLink}>Crear cuenta</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.seguridadRow}>
            <Text style={styles.seguridadIcon}>🛡️</Text>
            <Text style={styles.seguridadText}>Conexión segura y encriptada</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32 },

  logoSection:   { alignItems: 'center', marginBottom: 32 },
  pinWrap:       { alignItems: 'center', marginBottom: 16 },
  pinCircle: {
    width: 72, height: 72, borderRadius: 36, borderBottomRightRadius: 4,
    backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
    shadowColor: GREEN, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  pinEmoji: { fontSize: 30, transform: [{ rotate: '-45deg' }] },
  pinDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN, marginTop: 2 },
  logoText: { fontSize: 38, fontWeight: '800', color: TEXT_PRIMARY, marginBottom: 8 },
  tagline:  { fontSize: 15, color: TEXT_PRIMARY, textAlign: 'center', lineHeight: 22 },
  taglineGreen: { color: GREEN, fontWeight: '700' },

  formSection: { gap: 0 },

  errorBanner: {
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    borderRadius: 10, padding: 12, marginBottom: 12,
  },
  errorText: { fontSize: 13, color: RED, textAlign: 'center' },

  inputLabel:   { fontSize: 13, fontWeight: '600', color: TEXT_SECONDARY, marginBottom: 6 },
  passLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, marginTop: 16 },
  olvidaste:    { fontSize: 12, color: GREEN, fontWeight: '600' },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: WHITE, borderWidth: 1.5, borderColor: BORDER, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    marginBottom: 0, gap: 10,
  },
  inputWrapFocus: { borderColor: BORDER_FOCUS },
  inputIconEmoji: { fontSize: 16 },
  textInput:      { flex: 1, fontSize: 14, color: TEXT_PRIMARY },

  recordarmeRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, marginBottom: 20 },
  checkbox:       { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: BORDER, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: GREEN, borderColor: GREEN },
  checkmark:      { fontSize: 11, color: WHITE, fontWeight: '800' },
  recordarmeText: { fontSize: 13, color: TEXT_SECONDARY },

  btnEntrar: {
    backgroundColor: GREEN, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
    marginBottom: 24,
  },
  btnDisabled:   { opacity: 0.7 },
  btnEntrarText: { fontSize: 17, fontWeight: '700', color: WHITE },
  btnArrow:      { fontSize: 20, color: WHITE, fontWeight: '700' },

  divisorRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  divisorLine: { flex: 1, height: 0.5, backgroundColor: BORDER },
  divisorText: { fontSize: 11, color: TEXT_MUTED, letterSpacing: 0.5 },

  btnGoogle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    backgroundColor: WHITE, borderWidth: 1.5, borderColor: BORDER, borderRadius: 14,
    paddingVertical: 14, marginBottom: 20,
  },
  googleG:       { fontSize: 18, fontWeight: '800', color: '#4285F4' },
  btnGoogleText: { fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY },

  crearCuentaRow:   { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  crearCuentaTexto: { fontSize: 13, color: TEXT_SECONDARY },
  crearCuentaLink:  { fontSize: 13, color: GREEN, fontWeight: '700' },

  seguridadRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  seguridadIcon: { fontSize: 12 },
  seguridadText: { fontSize: 11, color: TEXT_MUTED },
});