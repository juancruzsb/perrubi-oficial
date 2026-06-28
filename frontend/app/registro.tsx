import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

const GREEN        = '#4caf50';
const WHITE        = '#ffffff';
const BG           = '#f7f7f7';
const TEXT_PRIMARY = '#1a1a1a';
const TEXT_SECONDARY = '#666666';
const TEXT_MUTED   = '#aaaaaa';
const BORDER       = '#e0e0e0';
const BORDER_FOCUS = '#4caf50';

export default function RegistroScreen() {
  const router = useRouter();

  const [nombre, setNombre]           = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmar, setConfirmar]     = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [nombreFocus,   setNombreFocus]   = useState(false);
  const [emailFocus,    setEmailFocus]    = useState(false);
  const [passFocus,     setPassFocus]     = useState(false);
  const [confirmFocus,  setConfirmFocus]  = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* Header con flecha */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── LOGO ── */}
        <View style={styles.logoSection}>
          {/*
            TODO: reemplazar por:
            <Image source={require('@/assets/images/logo-pin.png')} style={styles.logoImg} />
          */}
          <View style={styles.pinCircle}>
            <Text style={styles.pinEmoji}>📍</Text>
          </View>
          <Text style={styles.tagline}>
            Registrate para encontrar los mejores{'\n'}paseadores para tu mascota.
          </Text>
        </View>

        {/* ── FORMULARIO ── */}
        <View style={styles.formSection}>

          {/* Nombre completo */}
          <Text style={styles.inputLabel}>Nombre completo</Text>
          <View style={[styles.inputWrap, nombreFocus && styles.inputWrapFocus]}>
            {/* TODO: ícono persona */}
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Tu nombre y apellido"
              placeholderTextColor={TEXT_MUTED}
              autoCapitalize="words"
              value={nombre}
              onChangeText={setNombre}
              onFocus={() => setNombreFocus(true)}
              onBlur={() => setNombreFocus(false)}
            />
          </View>

          {/* Email */}
          <Text style={styles.inputLabel}>Email</Text>
          <View style={[styles.inputWrap, emailFocus && styles.inputWrapFocus]}>
            {/* TODO: ícono email */}
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.textInput}
              placeholder="ejemplo@email.com"
              placeholderTextColor={TEXT_MUTED}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
            />
          </View>

          {/* Contraseña */}
          <Text style={styles.inputLabel}>Contraseña</Text>
          <View style={[styles.inputWrap, passFocus && styles.inputWrapFocus]}>
            {/* TODO: ícono candado */}
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor={TEXT_MUTED}
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPassFocus(true)}
              onBlur={() => setPassFocus(false)}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Text style={styles.inputIcon}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Confirmar contraseña */}
          <Text style={styles.inputLabel}>Confirmar contraseña</Text>
          <View style={[styles.inputWrap, confirmFocus && styles.inputWrapFocus]}>
            {/* TODO: ícono escudo */}
            <Text style={styles.inputIcon}>🛡️</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Repetí tu contraseña"
              placeholderTextColor={TEXT_MUTED}
              secureTextEntry={!showConfirm}
              value={confirmar}
              onChangeText={setConfirmar}
              onFocus={() => setConfirmFocus(true)}
              onBlur={() => setConfirmFocus(false)}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Text style={styles.inputIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Botón registrarse */}
          <TouchableOpacity
            style={styles.btnRegistrar}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnRegistrarText}>Registrarme</Text>
            <Text style={styles.btnArrow}>→</Text>
          </TouchableOpacity>

          {/* Divisor */}
          <View style={styles.divisorRow}>
            <View style={styles.divisorLine} />
            <Text style={styles.divisorText}>YA TENGO CUENTA</Text>
            <View style={styles.divisorLine} />
          </View>

          {/* Iniciar sesión */}
          <TouchableOpacity
            style={styles.btnIniciar}
            onPress={() => router.back()}
            activeOpacity={0.85}
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

  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: BG,
  },
  backArrow: { fontSize: 22, color: TEXT_PRIMARY },

  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 },

  // Logo
  logoSection: { alignItems: 'center', marginBottom: 28 },
  pinCircle: {
    width: 72, height: 72,
    borderRadius: 36,
    borderBottomRightRadius: 4,
    backgroundColor: GREEN,
    alignItems: 'center', justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
    marginBottom: 16,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  pinEmoji: { fontSize: 28, transform: [{ rotate: '-45deg' }] },
  tagline: {
    fontSize: 14, color: TEXT_SECONDARY,
    textAlign: 'center', lineHeight: 20,
  },

  // Form
  formSection: { gap: 0 },

  inputLabel: {
    fontSize: 13, fontWeight: '600', color: TEXT_SECONDARY,
    marginBottom: 6, marginTop: 14,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: WHITE,
    borderWidth: 1.5, borderColor: BORDER, borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    gap: 10,
  },
  inputWrapFocus: { borderColor: BORDER_FOCUS },
  inputIcon:  { fontSize: 16 },
  textInput:  { flex: 1, fontSize: 14, color: TEXT_PRIMARY },

  // Botón registrarse
  btnRegistrar: {
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  btnRegistrarText: { fontSize: 17, fontWeight: '700', color: WHITE },
  btnArrow:         { fontSize: 20, color: WHITE, fontWeight: '700' },

  // Divisor
  divisorRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginVertical: 20,
  },
  divisorLine: { flex: 1, height: 0.5, backgroundColor: BORDER },
  divisorText: { fontSize: 11, color: TEXT_MUTED, letterSpacing: 0.5 },

  // Botón iniciar sesión
  btnIniciar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10,
    backgroundColor: WHITE,
    borderWidth: 1.5, borderColor: GREEN, borderRadius: 14,
    paddingVertical: 14,
  },
  btnIniciarText: { fontSize: 15, fontWeight: '700', color: GREEN },
  btnIniciarIcon: { fontSize: 15, color: GREEN, fontWeight: '700' },
});
