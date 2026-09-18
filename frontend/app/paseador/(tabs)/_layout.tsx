import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSessionPaseador } from '../../../context/session-paseador';

const ORANGE     = '#f5a623';
const TEXT_MUTED = '#999999';
const WHITE      = '#ffffff';
const BORDER     = '#e0e0e0';

// Mismo patrón que (tabs)/_layout.tsx del lado dueño, pero con la sesión de
// paseador (context/session-paseador.tsx) y redirigiendo a login-paseador.
export default function PaseadorTabsLayout() {
  const { token, cargando } = useSessionPaseador();

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator color={ORANGE} />
      </View>
    );
  }
  if (!token) {
    return <Redirect href="/paseador/login-paseador" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: WHITE, borderTopWidth: 0.5, borderTopColor: BORDER },
        tabBarActiveTintColor: ORANGE,
        tabBarInactiveTintColor: TEXT_MUTED,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Disponibles',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mis-paseos"
        options={{
          title: 'Mis paseos',
          tabBarIcon: ({ color, size }) => <Ionicons name="walk" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="paseo/[id]" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  cargando: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: WHITE },
});
