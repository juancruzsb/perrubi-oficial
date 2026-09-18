import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { walkerLogin } from '../../api/walker';
import { useSessionPaseador } from '../../context/session-paseador';

const GREEN         = '#4caf50';
const ORANGE         = '#f5a623';
const ORANGE_LIGHT   = '#fdf1e0';
const BLACK          = '#1a2e1a';
const WHITE          = '#ffffff';
const BG             = '#ffffff';
const TEXT_PRIMARY   = '#1a1a1a';
const TEXT_SECONDARY = '#666666';
const TEXT_MUTED     = '#aaaaaa';
const BORDER         = '#e0e0e0';
const BORDER_FOCUS   = '#4caf50';
const RED            = '#ef4444';

// Login real de paseadores: POST /auth/walkerLogin (api/walker.ts), sesión
// guardada aparte de la del dueño (ver context/session-paseador.tsx).
export default function LoginPaseadorScreen() {
  const router = useRouter();
  const { entrar } = useSessionPaseador();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus,  setPassFocus]  = useState(false);

  const handleIngresar = async () => {
    setError('');

    if (!email.trim() || !password) {
      setError('Completá tu email y contraseña.');
      return;
    }

    try {
      setLoading(true);
      const res = await walkerLogin({ email: email.trim().toLowerCase(), password });
      await entrar(res.token, res.walker);
      router.replace('/paseador/index');
    } catch (err: any) {
      setError(err.message || 'No pudimos iniciar sesión. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoSection}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>MODO PASEADOR</Text>
          </View>

          <View style={styles.pinCircle}>
            <Ionicons name="paw" size={30} color={GREEN} style={styles.pinPaw} />
          </View>
          <View style={styles.pinDot} />

          <View style={styles.wordmarkRow}>
            <Text style={styles.wordmark}>Perrubi</Text>
            <View style={styles.wordmarkDot} />
          </View>

          <Text style={styles.tagline}>
            Ingresá para ver los paseos{'\n'}disponibles cerca de ti
          </Text>
        </View>

        <View style={styles.formSection}>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Correo electrónico</Text>
          <View style={[styles.inputWrap, emailFocus && styles.inputWrapFocus]}>
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

          <Text style={styles.label}>Contraseña</Text>
          <View style={[styles.inputWrap, passFocus && styles.inputWrapFocus]}>
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
              <Ionicons name={showPass ? 'eye-off' : 'eye'} size={18} color={TEXT_MUTED} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btnEntrar, loading && styles.btnDisabled]}
            onPress={handleIngresar}
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

          <View style={styles.divisorRow}>
            <View style={styles.divisorLine} />
            <Text style={styles.divisorText}>O CONTINUAR CON</Text>
            <View style={styles.divisorLine} />
          </View>

          <TouchableOpacity style={styles.btnGoogle} activeOpacity={0.85}>
            <Ionicons name="logo-google" size={18} color="#4285F4" />
            <Text style={styles.btnGoogleText}>Continuar con Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnApple} activeOpacity={0.85}>
            <Ionicons name="logo-apple" size={20} color={WHITE} />
            <Text style={styles.btnAppleText}>Continuar con Apple</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>¿Sos nuevo? </Text>
            <TouchableOpacity onPress={() => router.push('/paseador/registro-paseador')}>
              <Text style={styles.footerLink}>Postularme como paseador</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 32 },

  logoSection: { alignItems: 'center', marginBottom: 24 },
  badge: {
    backgroundColor: ORANGE_LIGHT, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 6, marginBottom: 20,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: ORANGE, letterSpacing: 0.5 },

  pinCircle: {
    width: 76, height: 76, borderRadius: 38, borderBottomRightRadius: 4,
    borderWidth: 4, borderColor: GREEN,
    alignItems: 'center', justifyContent: 'center',
    transform: [{ rotate: '45deg' }], marginBottom: 6,
  },
  pinPaw: { transform: [{ rotate: '-45deg' }] },
  pinDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: GREEN, marginBottom: 14,
  },

  wordmarkRow: { flexDirection: 'row', alignItems: 'flex-start' },
  wordmark:    { fontSize: 34, fontWeight: '800', color: BLACK },
  wordmarkDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN, marginTop: 6, marginLeft: 2 },

  tagline: {
    fontSize: 14, color: TEXT_SECONDARY, textAlign: 'center',
    lineHeight: 20, marginTop: 10,
  },

  formSection: { gap: 0 },

  errorBanner: {
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    borderRadius: 10, padding: 12, marginBottom: 12,
  },
  errorText: { fontSize: 13, color: RED, textAlign: 'center' },

  label:    { fontSize: 13, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 6, marginTop: 14 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: WHITE, borderWidth: 1.5, borderColor: BORDER, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 14 : 10, gap: 10,
  },
  inputWrapFocus: { borderColor: BORDER_FOCUS },
  textInput:  { flex: 1, fontSize: 14, color: TEXT_PRIMARY },

  btnEntrar: {
    backgroundColor: ORANGE, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 24,
    shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnDisabled:    { opacity: 0.7 },
  btnEntrarText:  { fontSize: 16, fontWeight: '700', color: WHITE },
  btnArrow:       { fontSize: 18, color: WHITE, fontWeight: '700' },

  divisorRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  divisorLine: { flex: 1, height: 0.5, backgroundColor: BORDER },
  divisorText: { fontSize: 11, color: TEXT_MUTED, letterSpacing: 0.5 },

  btnGoogle: {
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1.5, borderColor: BORDER, backgroundColor: WHITE,
    marginBottom: 12,
  },
  btnGoogleText: { fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY },

  btnApple: {
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: BLACK,
  },
  btnAppleText: { fontSize: 15, fontWeight: '600', color: WHITE },

  footerRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 13, color: TEXT_SECONDARY },
  footerLink: { fontSize: 13, color: ORANGE, fontWeight: '700' },
});
