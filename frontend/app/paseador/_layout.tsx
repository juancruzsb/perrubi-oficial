import { Stack } from 'expo-router';

// Espejo de app/_layout.tsx + (tabs)/_layout.tsx pero para el rol paseador:
// login-paseador/registro-paseador son públicas, (tabs) tiene su propio
// guard de sesión (ver (tabs)/_layout.tsx).
export default function PaseadorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login-paseador" />
      <Stack.Screen name="registro-paseador" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
