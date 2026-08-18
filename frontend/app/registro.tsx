import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { register, login, splitNombre } from '../api/auth';
import { useSession } from '../context/session';

const GREEN        = '#4caf50';
const WHITE        = '#ffffff';
const BG           = '#f7f7f7';
const TEXT_PRIMARY = '#1a1a1a';
const TEXT_SECONDARY = '#666666';
const TEXT_MUTED   = '#aaaaaa';
const BORDER       = '#e0e0e0';
const BORDER_FOCUS = '#4caf50';
const RED          = '#ef4444';

export default function RegistroScreen() {
  const router = useRouter();
  const { entrar } = useSession();

  const [nombre,   setNombre]   = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirmar,setConfirmar]= useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const [nombreFocus,  setNombreFocus]  = useState(false);
  const [emailFocus,   setEmailFocus]   = useState(false);
  const [passFocus,    setPassFocus]    = useState(false);
  const [confirmFocus, setConfirmFocus] = useState(false);

  const handleRegistrar = async () => {
    setError('');

    if (!nombre || !email || !password || !confirmar) {
      setError('Por favor completá todos los campos.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      const emailNormalizado = email.trim().toLowerCase();
      // 1. Registra el usuario (el back exige firstName, no "name")
      await register({ ...splitNombre(nombre), email: emailNormalizado, password });
      // 2. Hace login automático (el register no devuelve token)
      const res = await login({ email: emailNormalizado, password });
      await entrar(res.token, res.user);
      // 3. Va directo al home
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoSection}>
          <View style={styles.pinCircle}>
            <Text style={styles.pinEmoji}>📍</Text>
          </View>
          <Text style={styles.tagline}>
            Registrate para encontrar los mejores{'\n'}paseadores para tu mascota.
          </Text>
        </View>

        <View style={styles.formSection}>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Nombre completo</Text>
          <View style={[styles.inputWrap, nombreFocus && styles.inputWrapFocus]}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Tu nombre y apellido"
              placeholderTextColor={TEXT_MUTED}
              autoCapitalize="words"
              value={nombre}
              onChangeText={(t) => { setNombre(t); setError(''); }}
              onFocus={() => setNombreFocus(true)}
              onBlur={() => setNombreFocus(false)}
            />
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputWrap, emailFocus && styles.inputWrapFocus]}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.textInput}
              placeholder="ejemplo@email.com"
              placeholderTextColor={TEXT_MUTED}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
            />
          </View>

          <Text style={styles.label}>Contraseña</Text>
          <View style={[styles.inputWrap, passFocus && styles.inputWrapFocus]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor={TEXT_MUTED}
              secureTextEntry={!showPass}
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
              onFocus={() => setPassFocus(true)}
              onBlur={() => setPassFocus(false)}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Text style={styles.inputIcon}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirmar contraseña</Text>
          <View style={[styles.inputWrap, confirmFocus && styles.inputWrapFocus]}>
            <Text style={styles.inputIcon}>🛡️</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Repetí tu contraseña"
              placeholderTextColor={TEXT_MUTED}
              secureTextEntry={!showConf}
              value={confirmar}
              onChangeText={(t) => { setConfirmar(t); setError(''); }}
              onFocus={() => setConfirmFocus(true)}
              onBlur={() => setConfirmFocus(false)}
            />
            <TouchableOpacity onPress={() => setShowConf(!showConf)}>
              <Text style={styles.inputIcon}>{showConf ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btnRegistrar, loading && styles.btnDisabled]}
            onPress={handleRegistrar}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={WHITE} />
              : <>
                  <Text style={styles.btnRegistrarText}>Registrarme</Text>
                  <Text style={styles.btnArrow}>→</Text>
                </>
            }
          </TouchableOpacity>

          <View style={styles.divisorRow}>
            <View style={styles.divisorLine} />
            <Text style={styles.divisorText}>YA TENGO CUENTA</Text>
            <View style={styles.divisorLine} />
          </View>

          <TouchableOpacity
            style={styles.btnIniciar}
            onPress={() => router.replace('/login-form')}
          >
            <Text style={styles.btnIniciarText}>Iniciar sesión</Text>
            <Text style={styles.btnIniciarIcon}>→|</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  backArrow: { fontSize: 22, color: TEXT_PRIMARY },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 },

  logoSection: { alignItems: 'center', marginBottom: 28 },
  pinCircle: {
    width: 72, height: 72, borderRadius: 36, borderBottomRightRadius: 4,
    backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center',
    transform: [{ rotate: '45deg' }], marginBottom: 16,
    shadowColor: GREEN, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  pinEmoji: { fontSize: 28, transform: [{ rotate: '-45deg' }] },
  tagline:  { fontSize: 14, color: TEXT_SECONDARY, textAlign: 'center', lineHeight: 20 },

  formSection: { gap: 0 },

  errorBanner: {
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    borderRadius: 10, padding: 12, marginBottom: 12,
  },
  errorText: { fontSize: 13, color: RED, textAlign: 'center' },

  label:    { fontSize: 13, fontWeight: '600', color: TEXT_SECONDARY, marginBottom: 6, marginTop: 14 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: WHITE, borderWidth: 1.5, borderColor: BORDER, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 14 : 10, gap: 10,
  },
  inputWrapFocus: { borderColor: BORDER_FOCUS },
  inputIcon:  { fontSize: 16 },
  textInput:  { flex: 1, fontSize: 14, color: TEXT_PRIMARY },

  btnRegistrar: {
    backgroundColor: GREEN, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 24,
    shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  btnDisabled:      { opacity: 0.7 },
  btnRegistrarText: { fontSize: 17, fontWeight: '700', color: WHITE },
  btnArrow:         { fontSize: 20, color: WHITE, fontWeight: '700' },

  divisorRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  divisorLine: { flex: 1, height: 0.5, backgroundColor: BORDER },
  divisorText: { fontSize: 11, color: TEXT_MUTED, letterSpacing: 0.5 },

  btnIniciar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: WHITE, borderWidth: 1.5, borderColor: GREEN, borderRadius: 14, paddingVertical: 14,
  },
  btnIniciarText: { fontSize: 15, fontWeight: '700', color: GREEN },
  btnIniciarIcon: { fontSize: 15, color: GREEN, fontWeight: '700' },
});