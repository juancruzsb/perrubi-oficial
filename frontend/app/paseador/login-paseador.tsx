import React, { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Boton, Separador, Campo, InsigniaModo, HuellaFondo, Pantalla } from '@/components/perrubi/piezas';
import { useAviso } from '@/components/perrubi/aviso';
import { C, t } from '@/components/perrubi/estilos';
import { walkerLogin } from '../../api/walker';
import { useSessionPaseador } from '../../context/session-paseador';

function LogoGoogle() {
  return (
    <Svg width={19} height={19} viewBox="0 0 48 48">
      <Path fill="#4285F4" d="M45 24c0-1.6-.15-3.14-.42-4.63H24v8.76h11.77c-.5 2.7-2.05 4.98-4.36 6.5v5.4h7.06C42.6 36.2 45 30.6 45 24z" />
      <Path fill="#34A853" d="M24 46c5.94 0 10.93-1.97 14.57-5.33l-7.06-5.4C29.5 36.6 27 37.4 24 37.4c-5.8 0-10.7-3.9-12.45-9.16H4.3v5.6C7.95 41.1 15.4 46 24 46z" />
      <Path fill="#FBBC05" d="M11.55 28.24A13.6 13.6 0 0 1 10.83 24c0-1.47.26-2.9.72-4.24v-5.6H4.3A22 22 0 0 0 2 24c0 3.55.85 6.9 2.3 9.84l7.25-5.6z" />
      <Path fill="#EA4335" d="M24 10.6c3.27 0 6.2 1.12 8.5 3.32l6.27-6.27C34.9 4.12 29.94 2 24 2 15.4 2 7.95 6.9 4.3 14.16l7.25 5.6C13.3 14.5 18.2 10.6 24 10.6z" />
    </Svg>
  );
}
function LogoApple() {
  return (
    <Svg width={17} height={19} viewBox="0 0 24 24" fill="#fff">
      <Path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.3 1.1 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.2.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.6-1-2.6-3.5zM14.2 5.6c.6-.8 1-1.8.9-2.9-.9.1-2 .6-2.7 1.4-.6.7-1 1.8-.9 2.8 1 .1 2.1-.5 2.7-1.3z" />
    </Svg>
  );
}

// Login real de paseadores: POST /auth/walkerLogin (api/walker.ts), sesión
// guardada aparte de la del dueño (ver context/session-paseador.tsx).
export default function LoginPaseador() {
  const router = useRouter();
  const aviso = useAviso();
  const { entrar, token, cargando } = useSessionPaseador();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      router.replace('/paseador');
    } catch (err: any) {
      setError(err.message || 'No pudimos iniciar sesión. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const proximamente = () => aviso('Próximamente', 'Por ahora ingresá con tu correo y contraseña.');

  // Ya hay una sesión de paseador guardada: no pedir las credenciales de nuevo.
  if (!cargando && token) return <Redirect href="/paseador" />;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pantalla pad={{ paddingVertical: 24, paddingHorizontal: 28, justifyContent: 'center' }}>
        <HuellaFondo />
        <View style={{ alignItems: 'center', marginBottom: 26 }}>
          <InsigniaModo />
          <Image source={require('@/assets/perrubi/logo-perrubi.png')} resizeMode="contain" style={{ width: 96, height: 96, marginTop: 20 }} />
          <Image source={require('@/assets/perrubi/texto-perrubi.png')} resizeMode="contain" style={{ width: 150, height: 40, marginTop: 12 }} />
          <Text style={t(13.5, 400, C.muted, { textAlign: 'center', lineHeight: 20, marginTop: 8 })}>
            Acceso para paseadores verificados.{'\n'}Usá el correo con el que te registraste.
          </Text>
        </View>

        {!!error && (
          <View style={{ backgroundColor: C.redSoft, borderWidth: 1, borderColor: C.redBorder, borderRadius: 12, padding: 12, marginBottom: 14 }}>
            <Text style={t(13, 500, C.red, { textAlign: 'center' })}>{error}</Text>
          </View>
        )}

        <Campo
          label="Correo electrónico" placeholder="tu@email.com" keyboardType="email-address" autoCapitalize="none"
          value={email} onChangeText={(v) => { setEmail(v); setError(''); }}
          style={{ marginBottom: 14 }}
        />
        <Campo
          label="Contraseña" placeholder="••••••••" secureTextEntry
          value={password} onChangeText={(v) => { setPassword(v); setError(''); }}
          onSubmitEditing={handleIngresar}
          style={{ marginBottom: 20 }}
        />
        <Boton
          label={loading ? 'Entrando…' : 'Entrar →'}
          left={loading ? <ActivityIndicator color={C.white} /> : undefined}
          onPress={loading ? undefined : handleIngresar}
          style={loading && { opacity: 0.7 }}
        />

        <Separador label="O CONTINUAR CON" style={{ marginTop: 20, marginBottom: 16 }} />
        <View style={{ gap: 10 }}>
          <Boton label="Continuar con Google" variant="outline" left={<LogoGoogle />} size={14.5} weight={600} py={13} onPress={proximamente} style={{ boxShadow: '0px 3px 8px rgba(28,42,34,0.10)' }} />
          <Boton label="Continuar con Apple" variant="dark" left={<LogoApple />} size={14.5} py={13} radius={14} onPress={proximamente} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
          <Text style={t(13, 400, C.muted)}>¿Sos nuevo? </Text>
          <Pressable onPress={() => router.push('/paseador/registro-paseador')}><Text style={t(13, 700, C.green)}>Postularme como paseador</Text></Pressable>
        </View>
      </Pantalla>
    </KeyboardAvoidingView>
  );
}
