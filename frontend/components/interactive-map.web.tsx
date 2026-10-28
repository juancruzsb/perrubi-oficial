// components/interactive-map.web.tsx
// Versión web de interactive-map.tsx (mismo contrato): react-native-webview no
// existe en web, así que la página del mapa va en un <iframe> y se le habla con
// postMessage.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { MapPayload } from './interactive-map-types';
import { walkMapHtml } from './walk-map-html';

export function InteractiveMap({
  data,
  style,
}: {
  data: MapPayload;
  style?: StyleProp<ViewStyle>;
}) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [readyCount, setReadyCount] = useState(0);
  const json = useMemo(() => JSON.stringify(data), [data]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frameRef.current?.contentWindow || typeof e.data !== 'string') return;
      try {
        if (JSON.parse(e.data).type === 'ready') setReadyCount((c) => c + 1);
      } catch {
        // mensaje que no es nuestro: ignorar
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (readyCount > 0) frameRef.current?.contentWindow?.postMessage(json, '*');
  }, [readyCount, json]);

  return (
    <View style={[styles.container, style]}>
      {React.createElement('iframe', {
        ref: frameRef,
        srcDoc: walkMapHtml(),
        title: 'Mapa del paseo',
        style: { width: '100%', height: '100%', border: 0 },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', backgroundColor: '#f1f0ef' },
});
