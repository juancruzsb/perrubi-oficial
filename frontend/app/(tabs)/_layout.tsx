import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../context/session';

const GREEN      = '#4caf50';
const TEXT_MUTED = '#999999';
const WHITE      = '#ffffff';
const BORDER     = '#e0e0e0';

// Alto del contenido de la barra, sin el inset inferior (home indicator /
// botones de navegación de Android), que se suma en runtime con
// useSafeAreaInsets() para que la barra nunca quede debajo del sistema.
const TAB_CONTENT_HEIGHT = 56;

export default function TabLayout() {
  const { token, cargando } = useSession();
  const insets = useSafeAreaInsets();

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
    return <Redirect href="/elegir-modo" />;
  }

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: WHITE,
          borderTopWidth: 0.5,
          borderTopColor: BORDER,
          height: TAB_CONTENT_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom + 6,
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

      <Tabs.Screen
        name="direcciones"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="estado_paseador"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="buscando_paseador"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="poner_calificacion"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="detalles_del_paseo"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="metodos_de_pago"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="mis_perros"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="mis_reseñas"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="notificaciones"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="paseo_en_curso"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="paseo_finalizado"
        options={{ href: null }}
      />

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