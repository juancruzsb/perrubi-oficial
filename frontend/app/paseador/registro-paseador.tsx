import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { splitNombre } from '../../api/auth';
import { walkerRegister, walkerLogin } from '../../api/walker';
import { useSessionPaseador } from '../../context/session-paseador';

const ORANGE        = '#f5a623';
const WHITE         = '#ffffff';
const BG            = '#f7f7f7';
const TEXT_PRIMARY  = '#1a1a1a';
const TEXT_SECONDARY = '#666666';
const TEXT_MUTED    = '#aaaaaa';
const BORDER        = '#e0e0e0';
const BORDER_FOCUS  = '#f5a623';
const RED           = '#ef4444';

// Alta de paseador: POST /auth/walkerRegister + login automático (mismo
// patrón que app/registro.tsx del lado dueño, ver api/walker.ts).
export default function RegistroPaseadorScreen() {
  const router = useRouter();
  const { entrar } = useSessionPaseador();

  const [nombre,   setNombre]   = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirmar,setConfirmar]= useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

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
      await walkerRegister({ ...splitNombre(nombre), email: emailNormalizado, password });
      const res = await walkerLogin({ email: emailNormalizado, password });
      await entrar(res.token, res.walker);
      router.replace('/paseador/index');
    } catch (err: any) {
      setError(err.message || 'Error al registrarte. Intentá de nuevo.');
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
          <Text style={styles.titulo}>Postularme como paseador</Text>
          <Text style={styles.tagline}>
            Registrate para empezar a aceptar paseos cerca tuyo.
          </Text>
        </View>

        <View style={styles.formSection}>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Nombre completo</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.textInput}
              placeholder="Tu nombre y apellido"
              placeholderTextColor={TEXT_MUTED}
              autoCapitalize="words"
              value={nombre}
              onChangeText={(t) => { setNombre(t); setError(''); }}
            />
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.textInput}
              placeholder="ejemplo@email.com"
              placeholderTextColor={TEXT_MUTED}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
            />
          </View>

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.textInput}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor={TEXT_MUTED}
              secureTextEntry
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
            />
          </View>

          <Text style={styles.label}>Confirmar contraseña</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.textInput}
              placeholder="Repetí tu contraseña"
              placeholderTextColor={TEXT_MUTED}
              secureTextEntry
              value={confirmar}
              onChangeText={(t) => { setConfirmar(t); setError(''); }}
            />
          </View>

          <TouchableOpacity
            style={[styles.btnRegistrar, loading && styles.btnDisabled]}
            onPress={handleRegistrar}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={WHITE} />
              : <Text style={styles.btnRegistrarText}>Registrarme como paseador</Text>
            }
          </TouchableOpacity>

          <View style={styles.divisorRow}>
            <View style={styles.divisorLine} />
            <Text style={styles.divisorText}>YA TENGO CUENTA</Text>
            <View style={styles.divisorLine} />
          </View>

          <TouchableOpacity
            style={styles.btnIniciar}
            onPress={() => router.replace('/paseador/login-paseador')}
          >
            <Text style={styles.btnIniciarText}>Iniciar sesión</Text>
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

  logoSection: { marginBottom: 24 },
  titulo:   { fontSize: 22, fontWeight: '800', color: TEXT_PRIMARY, marginBottom: 6 },
  tagline:  { fontSize: 14, color: TEXT_SECONDARY, lineHeight: 20 },

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
    paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  textInput:  { flex: 1, fontSize: 14, color: TEXT_PRIMARY },

  btnRegistrar: {
    backgroundColor: ORANGE, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 20,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 24,
  },
  btnDisabled:      { opacity: 0.7 },
  btnRegistrarText: { fontSize: 16, fontWeight: '700', color: WHITE },

  divisorRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  divisorLine: { flex: 1, height: 0.5, backgroundColor: BORDER },
  divisorText: { fontSize: 11, color: TEXT_MUTED, letterSpacing: 0.5 },

  btnIniciar: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: WHITE, borderWidth: 1.5, borderColor: ORANGE, borderRadius: 14, paddingVertical: 14,
  },
  btnIniciarText: { fontSize: 15, fontWeight: '700', color: ORANGE },
});
