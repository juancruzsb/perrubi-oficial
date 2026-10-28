import React, { useRef, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Boton, FlechaIzquierda, Campo, InsigniaModo, HuellaFondo, Pantalla, useVolver } from '@/components/perrubi/piezas';
import { C, mayus, t } from '@/components/perrubi/estilos';
import { splitNombre } from '../../api/auth';
import { walkerRegister, walkerLogin } from '../../api/walker';
import { useSessionPaseador } from '../../context/session-paseador';

// Alta de paseador: POST /auth/walkerRegister + login automático, y después
// el paso 2 (verificación de identidad).
export default function RegistroPaseador() {
  const router = useRouter();
  const back = useVolver('/paseador/login-paseador');
  const { entrar } = useSessionPaseador();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Si el alta salió bien pero el login automático falló, un reintento no
  // debe volver a registrar (el back respondería 409 'ya existe').
  const registrado = useRef(false);

  const cambiar = (set: (v: string) => void) => (v: string) => { set(v); setError(''); };

  const handleRegistrar = async () => {
    setError('');
    if (!nombre.trim() || !email.trim() || !password || !confirmar) return setError('Por favor completá todos los campos.');
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
    if (password !== confirmar) return setError('Las contraseñas no coinciden.');
    try {
      setLoading(true);
      const emailNormalizado = email.trim().toLowerCase();
      if (!registrado.current) {
        await walkerRegister({ ...splitNombre(nombre.trim()), email: emailNormalizado, password });
        registrado.current = true;
      }
      const res = await walkerLogin({ email: emailNormalizado, password });
      await entrar(res.token, res.walker);
      router.replace('/paseador/verificacion');
    } catch (err: any) {
      setError(err.message || 'Error al registrarte. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pantalla pad={{ paddingVertical: 24, paddingHorizontal: 28 }}>
        <HuellaFondo />
        <Pressable onPress={back} hitSlop={10} style={{ alignSelf: 'flex-start', padding: 4, marginBottom: 12 }}><FlechaIzquierda /></Pressable>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <InsigniaModo />
          <Image source={require('@/assets/perrubi/logo-perrubi.png')} resizeMode="contain" style={{ width: 72, height: 72, marginTop: 16 }} />
          <Image source={require('@/assets/perrubi/texto-perrubi.png')} resizeMode="contain" style={{ width: 126, height: 34, marginTop: 10 }} />
          <Text style={t(13, 400, C.muted, { textAlign: 'center', lineHeight: 19.5, marginTop: 8 })}>
            Registro de paseador. Paso 1 de 2: datos personales.{'\n'}Luego se valida tu identidad.
          </Text>
        </View>

        {!!error && (
          <View style={{ backgroundColor: C.redSoft, borderWidth: 1, borderColor: C.redBorder, borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <Text style={t(13, 500, C.red, { textAlign: 'center' })}>{error}</Text>
          </View>
        )}

        <Campo label="Nombre completo" placeholder="Tu nombre y apellido" autoCapitalize="words" value={nombre} onChangeText={cambiar(setNombre)} style={{ marginBottom: 12 }} />
        <Campo label="Email" placeholder="ejemplo@email.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={cambiar(setEmail)} style={{ marginBottom: 12 }} />
        <Campo label="Contraseña" placeholder="Mínimo 8 caracteres" secureTextEntry value={password} onChangeText={cambiar(setPassword)} style={{ marginBottom: 12 }} />
        <Campo label="Confirmar contraseña" placeholder="Repetí tu contraseña" secureTextEntry value={confirmar} onChangeText={cambiar(setConfirmar)} onSubmitEditing={handleRegistrar} style={{ marginBottom: 20 }} />

        <Boton
          label={loading ? 'Creando cuenta…' : 'Continuar →'}
          left={loading ? <ActivityIndicator color={C.white} /> : undefined}
          onPress={loading ? undefined : handleRegistrar}
          style={loading && { opacity: 0.7 }}
        />
        <Text style={[mayus(11, 400), { textAlign: 'center', marginVertical: 16 }]}>Ya tengo cuenta</Text>
        <Boton label="Iniciar sesión →" variant="outlineGreen" size={14} py={13} onPress={() => router.replace('/paseador/login-paseador')} />
      </Pantalla>
    </KeyboardAvoidingView>
  );
}
