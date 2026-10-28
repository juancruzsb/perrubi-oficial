import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icono, type NombreIcono } from '../../../components/perrubi/icono';
import { C, SOMBRAS, t } from '../../../components/perrubi/estilos';
import { useSessionPaseador } from '../../../context/session-paseador';
import { UbicacionPaseadorProvider } from '../../../context/ubicacion-paseador';

// Solo estas 4 aparecen en la barra; mis-paseos y paseo/[id] siguen siendo
// rutas del grupo pero se llega a ellas con push (la barra las ignora).
const PESTANAS: Record<string, { label: string; icon: string }> = {
  index: { label: 'Inicio', icon: 'solar:home-2' },
  ganancias: { label: 'Ganancias', icon: 'solar:wallet-money' },
  chat: { label: 'Chat', icon: 'solar:chat-round-dots' },
  perfil: { label: 'Perfil', icon: 'solar:user-circle' },
};

// Tipado mínimo de lo que la barra realmente usa, en vez de BottomTabBarProps:
// expo-router trae su propio fork de @react-navigation/bottom-tabs cuyos tipos
// (HeaderOptions, descriptors) no coinciden exactamente con el paquete suelto.
type BarraPestanasProps = {
  state: { routes: { key: string; name: string }[]; index: number };
  navigation: { navigate: (name: string) => void };
};

function BarraPestanasPaseador({ state, navigation }: BarraPestanasProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.divider, paddingTop: 10, paddingHorizontal: 4, paddingBottom: 12 + insets.bottom, backgroundColor: C.white, boxShadow: SOMBRAS.tab }}>
      {state.routes.map((route, i) => {
        const tab = PESTANAS[route.name];
        if (!tab) return null;
        const on = state.index === i;
        return (
          <Pressable key={route.key} onPress={() => !on && navigation.navigate(route.name)} style={{ flex: 1, alignItems: 'center', gap: 3 }}>
            <View style={{ width: 56, height: 30, borderRadius: 999, backgroundColor: on ? C.greenTab : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              <Icono name={`${tab.icon}-${on ? 'bold' : 'linear'}` as NombreIcono} size={20} color={on ? C.greenDark : C.muted} />
            </View>
            <Text style={t(11, on ? 600 : 500, on ? C.green : C.offline)}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Guard de sesión de paseador + emisor de ubicación en vivo, igual que antes.
export default function PestanasPaseador() {
  const { token, cargando } = useSessionPaseador();

  if (cargando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
        <ActivityIndicator color={C.green} />
      </View>
    );
  }
  if (!token) return <Redirect href="/paseador/login-paseador" />;

  return (
    <UbicacionPaseadorProvider>
      <Tabs backBehavior="history" screenOptions={{ headerShown: false }} tabBar={(p) => <BarraPestanasPaseador {...p} />}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="ganancias" />
        <Tabs.Screen name="chat" />
        <Tabs.Screen name="perfil" />
        <Tabs.Screen name="mis-paseos" options={{ href: null }} />
        <Tabs.Screen name="paseo/[id]" options={{ href: null }} />
      </Tabs>
    </UbicacionPaseadorProvider>
  );
}
