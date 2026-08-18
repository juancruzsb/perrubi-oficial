import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../context/session';

const GREEN      = '#4caf50';
const TEXT_MUTED = '#999999';
const WHITE      = '#ffffff';
const BORDER     = '#e0e0e0';

const TAB_HEIGHT = Platform.select({
  ios:     84,
  android: 64,
  web:     80,
  default: 64,
});

const TAB_PADDING_BOTTOM = Platform.select({
  ios:     24,
  android: 8,
  web:     18,
  default: 8,
});

export default function TabLayout() {
  const { token, cargando } = useSession();

  // Guard de sesión: (tabs)/index es la ruta "/", así que la app arranca
  // acá en frío y este es el primer lugar donde se puede chequear si hay
  // token. Un <Redirect> declarativo evita el "navigate before mount" que
  // tira un router.replace() imperativo durante el primer render.
  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator color={GREEN} />
      </View>
    );
  }
  if (!token) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: WHITE,
          borderTopWidth: 0.5,
          borderTopColor: BORDER,
          height: TAB_HEIGHT,
          paddingBottom: TAB_PADDING_BOTTOM,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: GREEN,
        tabBarInactiveTintColor: TEXT_MUTED,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mis-paseos"
        options={{
          title: 'Mis paseos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubble' : 'chatbubble-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="crear-paseo"
        options={{ href: null }}
      />
      
      <Tabs.Screen
      name="agregar-perro"
      options={{ href: null }}
      />

      <Tabs.Screen name="buscando_paseador" options={{ href: null }} />
      <Tabs.Screen name="paseo_en_curso" options={{ href: null }} />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  cargando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
  },
  tabItem: {
    paddingTop: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});