import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { AvisoProvider } from '../../components/perrubi/aviso';
import { PaseoPaseadorProvider } from '../../context/paseo-paseador';
import { C } from '../../components/perrubi/estilos';

// login-paseador/registro-paseador son públicas; (tabs) tiene su propio guard
// de sesión (ver (tabs)/_layout.tsx). SessionPaseadorProvider vive en app/_layout.tsx.
export default function PaseadorLayout() {
  const [loaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });
  if (!loaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
        <ActivityIndicator color={C.green} />
      </View>
    );
  }
  return (
    <AvisoProvider>
      <PaseoPaseadorProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
          <Stack.Screen name="login-paseador" />
          <Stack.Screen name="registro-paseador" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PaseoPaseadorProvider>
    </AvisoProvider>
  );
}
