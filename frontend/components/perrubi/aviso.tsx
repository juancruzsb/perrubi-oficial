import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, SOMBRAS, t } from './estilos';

type Aviso = { title: string; body?: string } | null;
const Ctx = createContext<(title: string, body?: string) => void>(() => {});
export const useAviso = () => useContext(Ctx);

export function AvisoProvider({ children }: { children: React.ReactNode }) {
  const [aviso, setAviso] = useState<Aviso>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const insets = useSafeAreaInsets();

  const mostrar = useCallback((title: string, body?: string) => {
    setAviso({ title, body });
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAviso(null), 3200);
  }, [anim]);

  return (
    <Ctx.Provider value={mostrar}>
      <View style={{ flex: 1 }}>
        {children}
        {aviso && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute', top: insets.top + 14, alignSelf: 'center', zIndex: 50, maxWidth: 320,
              backgroundColor: C.ink, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, boxShadow: SOMBRAS.toast,
              opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
            }}
          >
            <Text style={t(13, 700, C.white)}>{aviso.title}</Text>
            {!!aviso.body && <Text style={t(12, 400, C.toastSub, { marginTop: 2 })}>{aviso.body}</Text>}
          </Animated.View>
        )}
      </View>
    </Ctx.Provider>
  );
}
