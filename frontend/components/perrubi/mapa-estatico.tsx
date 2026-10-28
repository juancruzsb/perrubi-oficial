import React, { useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Polyline } from 'react-native-svg';
import { Icono } from './icono';
import { C, SOMBRAS, t } from './estilos';

/**
 * Mapa estático igual al prototipo: tile de Esri + ruta SVG + pines en coordenadas 0–100.
 * Para mapa interactivo real, reemplazar por react-native-maps manteniendo los mismos pines.
 */
export const MOSAICOS = {
  z15: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/15/19753/11066',
  z16: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/16/39506/22132',
};

export type Pin =
  | { kind: 'dog'; x: number; y: number; uri: string; anchor?: 'bottom' | 'center' }
  | { kind: 'me'; x: number; y: number }
  | { kind: 'zone'; x: number; y: number; diameter?: number };

type Props = {
  height: number;
  tile?: string;
  route?: [number, number][];
  dashed?: boolean;
  routeWidth?: number;
  pins?: Pin[];
  gps?: string;
  radius?: number;
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function MapaEstatico({ height, tile = MOSAICOS.z16, route, dashed, routeWidth = 1.6, pins = [], gps, radius = 14, bordered = true, style }: Props) {
  const [w, setW] = useState(0);
  const px = (x: number) => (x / 100) * w;
  const py = (y: number) => (y / 100) * height;

  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[{ height, borderRadius: radius, overflow: 'hidden', backgroundColor: C.mapBg }, bordered && { borderWidth: 1, borderColor: C.border }, style]}
    >
      <Image source={{ uri: tile }} contentFit="cover" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      {route && (
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute' }}>
          <Polyline
            points={route.map((p) => p.join(',')).join(' ')}
            fill="none" stroke={C.green} strokeWidth={routeWidth} strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={dashed ? '2.5,2' : undefined}
          />
        </Svg>
      )}
      {w > 0 && pins.map((p, i) => {
        if (p.kind === 'me') {
          return <View key={i} style={{ position: 'absolute', left: px(p.x) - 9, top: py(p.y) - 9, width: 18, height: 18, borderRadius: 9, backgroundColor: C.green, borderWidth: 3, borderColor: C.white, boxShadow: '0px 0px 0px 6px rgba(87,174,71,0.22), 0px 3px 8px rgba(0,0,0,0.25)' }} />;
        }
        if (p.kind === 'zone') {
          const d = p.diameter ?? 120;
          return (
            <React.Fragment key={i}>
              <View style={{ position: 'absolute', left: px(p.x) - d / 2, top: py(p.y) - d / 2, width: d, height: d, borderRadius: d / 2, backgroundColor: 'rgba(87,174,71,0.18)', borderWidth: 2, borderColor: C.green }} />
              <View style={{ position: 'absolute', left: px(p.x) - 7, top: py(p.y) - 7, width: 14, height: 14, borderRadius: 7, backgroundColor: C.green, borderWidth: 3, borderColor: C.white }} />
            </React.Fragment>
          );
        }
        // dog pin: 40px + punta de 8px → alto total 47
        const top = p.anchor === 'center' ? py(p.y) - 23.5 : py(p.y) - 47;
        return (
          <View key={i} style={{ position: 'absolute', left: px(p.x) - 20, top, alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: C.white, backgroundColor: C.white, boxShadow: SOMBRAS.pin, overflow: 'hidden' }}>
              <Image source={{ uri: p.uri }} contentFit="cover" style={{ width: '100%', height: '100%' }} />
            </View>
            <View style={{ width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: C.white, marginTop: -1 }} />
          </View>
        );
      })}
      {!!gps && (
        <View style={{ position: 'absolute', left: 10, bottom: 10, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.white, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, boxShadow: SOMBRAS.badge }}>
          <Icono name="solar:gps-bold" size={13} color={C.green} />
          <Text style={t(11, 600)}>{gps}</Text>
        </View>
      )}
    </View>
  );
}
