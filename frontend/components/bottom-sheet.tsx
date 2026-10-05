// components/bottom-sheet.tsx
// Hoja inferior arrastrable para pantallas con un mapa de fondo (ver
// paseo_en_curso.tsx). Dos posiciones: colapsada (solo se ve `header`) y
// expandida (header + children). Se arrastra desde el header o se toca el
// handle para alternar. Usa PanResponder + Animated de React Native core, así
// que anda igual en nativo y en web sin depender de gesture-handler.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const WHITE = '#ffffff';
const DRAG_HANDLE = '#d1d5db';

export function BottomSheet({
  header,
  children,
  maxHeight,
  startExpanded = false,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  // Alto máximo de la hoja (normalmente el alto del área del mapa).
  maxHeight: number;
  startExpanded?: boolean;
}) {
  const [sheetH, setSheetH] = useState(0);
  const [headH, setHeadH] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const expandedRef = useRef(startExpanded);
  const startYRef = useRef(0);
  const collapsedYRef = useRef(0);

  const collapsedY = Math.max(0, sheetH - headH);
  collapsedYRef.current = collapsedY;

  const snapTo = useCallback(
    (expand: boolean) => {
      expandedRef.current = expand;
      Animated.spring(translateY, {
        toValue: expand ? 0 : collapsedYRef.current,
        useNativeDriver: true,
        bounciness: 0,
        speed: 16,
      }).start();
    },
    [translateY]
  );

  // Cuando cambian las medidas (primer layout, rotación, contenido que crece)
  // se reposiciona sin animar para no "saltar".
  useEffect(() => {
    if (sheetH === 0 || headH === 0) return;
    translateY.setValue(expandedRef.current ? 0 : collapsedY);
  }, [sheetH, headH, collapsedY, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      // Reclama el gesto desde el toque inicial (no solo al mover): en
      // react-native-web la negociación solo por movimiento no se activaba.
      // Los botones hijos (chat, paseador) siguen ganando el toque simple
      // porque el más profundo negocia primero.
      onStartShouldSetPanResponder: () => true,
      // Un arrastre vertical le quita el gesto al botón hijo que lo tenía.
      onMoveShouldSetPanResponderCapture: (_, g) =>
        Math.abs(g.dy) > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderGrant: () => {
        startYRef.current = expandedRef.current ? 0 : collapsedYRef.current;
      },
      onPanResponderMove: (_, g) => {
        const y = Math.min(Math.max(startYRef.current + g.dy, 0), collapsedYRef.current);
        translateY.setValue(y);
      },
      onPanResponderRelease: (_, g) => {
        const y = Math.min(Math.max(startYRef.current + g.dy, 0), collapsedYRef.current);
        if (g.vy < -0.5) snapTo(true);
        else if (g.vy > 0.5) snapTo(false);
        else snapTo(y < collapsedYRef.current / 2);
      },
      onPanResponderTerminate: () => snapTo(expandedRef.current),
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.sheet,
        { maxHeight, opacity: sheetH === 0 ? 0 : 1, transform: [{ translateY }] },
      ]}
      onLayout={(e) => setSheetH(e.nativeEvent.layout.height)}
    >
      <View
        style={styles.header}
        onLayout={(e) => setHeadH(e.nativeEvent.layout.height)}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.handleHit}
          activeOpacity={0.7}
          onPress={() => snapTo(!expandedRef.current)}
          accessibilityRole="button"
          accessibilityLabel="Mostrar u ocultar detalles"
        >
          <View style={styles.handle} />
        </TouchableOpacity>
        {header}
      </View>
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    // En web, arrastrar seleccionaba el texto del header.
    ...(Platform.OS === 'web' ? ({ userSelect: 'none' } as object) : null),
  },
  handleHit: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 14,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: DRAG_HANDLE,
  },
  body: { flexShrink: 1 },
  bodyContent: { paddingHorizontal: 20, paddingBottom: 20 },
});
