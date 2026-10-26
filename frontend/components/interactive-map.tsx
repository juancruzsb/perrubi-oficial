// components/interactive-map.tsx
// Mapa de Google que el usuario puede mover y hacer zoom: un WebView que carga
// la página del backend (GET /maps/embed, Maps JavaScript API) y recibe lo que
// tiene que dibujar por postMessage. Corre en Expo Go (react-native-webview
// viene incluido), a diferencia de react-native-maps. La versión web es
// interactive-map.web.tsx (un <iframe>, misma API).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { embedMapUrl } from '../api/maps';
import type { MapPayload } from './interactive-map-types';

export function InteractiveMap({
  data,
  style,
}: {
  data: MapPayload;
  style?: StyleProp<ViewStyle>;
}) {
  const webRef = useRef<WebView>(null);
  // Contador y no booleano: si el WebView se recarga vuelve a avisar 'ready' y
  // hay que reenviar el estado, cosa que un `true` -> `true` no dispararía.
  const [readyCount, setReadyCount] = useState(0);
  const json = useMemo(() => JSON.stringify(data), [data]);

  useEffect(() => {
    if (readyCount > 0) webRef.current?.postMessage(json);
  }, [readyCount, json]);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webRef}
        source={{ uri: embedMapUrl() }}
        originWhitelist={['*']}
        javaScriptEnabled
        // Android: que el arrastre del mapa no se lo robe un ScrollView padre.
        nestedScrollEnabled
        scrollEnabled={false}
        bounces={false}
        onMessage={(e) => {
          try {
            if (JSON.parse(e.nativeEvent.data).type === 'ready') setReadyCount((c) => c + 1);
          } catch {
            // mensaje que no es nuestro: ignorar
          }
        }}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', backgroundColor: '#f1f0ef' },
  webview: { flex: 1, backgroundColor: 'transparent' },
});
