import React from 'react';
import {
  Pressable, ScrollView, Text, TextInput, View,
  type StyleProp, type TextInputProps, type TextStyle, type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Icono, type NombreIcono } from './icono';
import { C, SOMBRAS, mayus, tarjeta, t, type Peso } from './estilos';
import { Image as RNImage } from 'react-native';
import { PASEADOR } from '../../lib/datos-paseador';

/* ── Layout ─────────────────────────────────────────── */

type PropsPantalla = {
  children: React.ReactNode;
  /** padding del contenido (default 18/20 como el prototipo) */
  pad?: ViewStyle;
  scroll?: boolean;
  bg?: string;
  edges?: Edge[];
  /** contenido fijo bajo el scroll (input de chat, etc.) */
  footer?: React.ReactNode;
};

export function Pantalla({ children, pad = { paddingVertical: 18, paddingHorizontal: 20 }, scroll = true, bg = C.bg, edges = ['top'], footer }: PropsPantalla) {
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: bg }}>
      {scroll ? (
        <ScrollView contentContainerStyle={[{ flexGrow: 1 }, pad]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, pad]}>{children}</View>
      )}
      {footer}
    </SafeAreaView>
  );
}

export const Espacio = () => <View style={{ flex: 1 }} />;

export function Tarjeta({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  if (onPress) return <Pressable onPress={onPress} style={({ pressed }) => [tarjeta, style, pressed && { opacity: 0.85 }]}>{children}</Pressable>;
  return <View style={[tarjeta, style]}>{children}</View>;
}

/* ── Navegación ─────────────────────────────────────── */

export function FlechaIzquierda({ color = C.ink, size = 20 }: { color?: string; size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 20 20"><Path d="M12.5 4L6.5 10L12.5 16" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" /></Svg>;
}
export function FlechaDerecha({ color = C.placeholder, size = 14 }: { color?: string; size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 20 20"><Path d="M7.5 4L13.5 10L7.5 16" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" /></Svg>;
}

export function useVolver(fallback?: Href) {
  const router = useRouter();
  return () => (router.canGoBack() ? router.back() : fallback ? router.replace(fallback) : undefined);
}

/** Encabezado con flecha y título centrado (margin-right 28 compensa la flecha). */
export function Encabezado({ title, fallback, onBack, style, children }: { title?: string; fallback?: Href; onBack?: () => void; style?: StyleProp<ViewStyle>; children?: React.ReactNode }) {
  const back = useVolver(fallback);
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }, style]}>
      <Pressable onPress={onBack ?? back} hitSlop={10} style={{ padding: 4 }}><FlechaIzquierda /></Pressable>
      {children ?? <Text style={t(17, 700, C.ink, { flex: 1, textAlign: 'center', marginRight: 28 })}>{title}</Text>}
    </View>
  );
}

/* ── Botones ────────────────────────────────────────── */

type VarianteBoton = 'primary' | 'outline' | 'outlineGreen' | 'danger' | 'dark';
type PropsBoton = {
  label: string; onPress?: () => void; variant?: VarianteBoton;
  icon?: NombreIcono; iconColor?: string; left?: React.ReactNode;
  size?: number; weight?: Peso; py?: number; radius?: number;
  style?: StyleProp<ViewStyle>;
};

const BOTONES: Record<VarianteBoton, { box: ViewStyle; color: string }> = {
  primary: { box: { backgroundColor: C.green, boxShadow: SOMBRAS.btn }, color: C.white },
  outline: { box: { backgroundColor: C.white, borderWidth: 1, borderColor: C.borderInput }, color: C.ink },
  outlineGreen: { box: { backgroundColor: C.white, borderWidth: 1, borderColor: C.borderInput, boxShadow: SOMBRAS.input }, color: C.green },
  danger: { box: { backgroundColor: C.white, borderWidth: 1, borderColor: C.redBorder }, color: C.red },
  dark: { box: { backgroundColor: C.ink, borderWidth: 1, borderColor: C.ink }, color: C.white },
};

export function Boton({ label, onPress, variant = 'primary', icon, iconColor, left, size = 15, weight = 700, py = 15, radius = 12, style }: PropsBoton) {
  const v = BOTONES[variant];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ borderRadius: radius, paddingVertical: py, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, v.box, style, pressed && { opacity: 0.88 }]}
    >
      {left}
      {icon && <Icono name={icon} size={16} color={iconColor ?? v.color} />}
      <Text style={t(size, weight, v.color)}>{label}</Text>
    </Pressable>
  );
}

/* ── Piezas ─────────────────────────────────────────── */

const ETIQUETAS = {
  green: { bg: C.greenSoft, fg: C.greenDark },
  orange: { bg: C.orangeSoft, fg: C.orange },
  red: { bg: C.redSoft, fg: C.red },
};
export function Etiqueta({ label, tone = 'green', style, textStyle }: { label: string; tone?: keyof typeof ETIQUETAS; style?: StyleProp<ViewStyle>; textStyle?: TextStyle }) {
  return (
    <View style={[{ backgroundColor: ETIQUETAS[tone].bg, paddingVertical: 4, paddingHorizontal: 9, borderRadius: 999 }, style]}>
      <Text style={[t(11, 600, ETIQUETAS[tone].fg), textStyle]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export function TituloSeccion({ children, style }: { children: string; style?: TextStyle }) {
  return <Text style={[mayus(), { marginTop: 18, marginHorizontal: 4, marginBottom: 8 }, style]}>{children}</Text>;
}

const CUADROS = {
  green: { bg: C.greenSoft, fg: C.green },
  orange: { bg: C.orangeSoft, fg: C.orange },
  blue: { bg: C.blueSoft, fg: C.blue },
  red: { bg: C.redSoft, fg: C.red },
  gray: { bg: C.gray, fg: C.grayIcon },
  star: { bg: C.starSoft, fg: C.starDark },
};
export type TonoCuadro = keyof typeof CUADROS;
export function CuadroIcono({ icon, tone = 'green', size = 36, radius = 10, iconSize = 18 }: { icon: NombreIcono; tone?: TonoCuadro; size?: number; radius?: number; iconSize?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: CUADROS[tone].bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icono name={icon} size={iconSize} color={CUADROS[tone].fg} />
    </View>
  );
}

type PropsFila = {
  icon: NombreIcono; tone?: TonoCuadro; title: string; sub?: string;
  rightText?: string; right?: React.ReactNode; chevron?: boolean;
  onPress?: () => void; last?: boolean;
  /** 'menu' = perfil (34px, título 14/500) · 'list' = resto (36px, título 13.5/600) */
  kind?: 'menu' | 'list';
};
export function Fila({ icon, tone, title, sub, rightText, right, chevron = true, onPress, last, kind = 'list' }: PropsFila) {
  const menu = kind === 'menu';
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: C.divider }, pressed && { backgroundColor: '#FAFBFC' }]}>
      <CuadroIcono icon={icon} tone={tone} size={menu ? 34 : 36} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={menu ? t(14, 500) : t(13.5, 600)}>{title}</Text>
        {!!sub && <Text style={t(11.5, 400, C.muted, { marginTop: 2 })}>{sub}</Text>}
      </View>
      {!!rightText && <Text style={t(12, 400, C.muted)}>{rightText}</Text>}
      {right}
      {chevron && onPress && <FlechaDerecha />}
    </Pressable>
  );
}

/** Tira de 3 métricas separadas por divisores. */
export function FilaMetricas({ items, style, valueSize = 16, centered }: { items: { label: string; value: string; color?: string; suffix?: string }[]; style?: StyleProp<ViewStyle>; valueSize?: number; centered?: boolean }) {
  return (
    <View style={[{ flexDirection: 'row' }, style]}>
      {items.map((it, i) => (
        <View key={it.label} style={{ flex: 1, paddingVertical: 12, paddingHorizontal: centered ? 4 : 14, borderLeftWidth: i ? 1 : 0, borderLeftColor: C.divider, alignItems: centered ? 'center' : 'flex-start' }}>
          {centered ? (
            <>
              <Text style={t(17, 700, it.color ?? C.ink)}>{it.value}</Text>
              <Text style={t(11, 400, C.muted, { marginTop: 2 })}>{it.label}</Text>
            </>
          ) : (
            <>
              <Text style={t(11, 400, C.muted)}>{it.label}</Text>
              <Text style={t(valueSize, 700, it.color ?? C.ink, { marginTop: 2 })}>
                {it.value}{!!it.suffix && <Text style={t(12, 500, C.muted)}> {it.suffix}</Text>}
              </Text>
            </>
          )}
        </View>
      ))}
    </View>
  );
}

export function Interruptor({ on, w = 44, h = 24, shadow }: { on: boolean; w?: number; h?: number; shadow?: boolean }) {
  const k = h - 4;
  return (
    <View style={{ width: w, height: h, borderRadius: h / 2, backgroundColor: on ? C.green : C.toggleOff }}>
      <View style={{ position: 'absolute', top: 2, left: on ? w - k - 2 : 2, width: k, height: k, borderRadius: k / 2, backgroundColor: C.white, boxShadow: shadow ? '0px 1px 3px rgba(0,0,0,0.2)' : undefined }} />
    </View>
  );
}

export function Opcion({ label, on, onPress, style, size = 12, fill }: { label: string; on: boolean; onPress?: () => void; style?: StyleProp<ViewStyle>; size?: number; fill?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[{ paddingVertical: 7, paddingHorizontal: 13, borderRadius: 999, borderWidth: 1, backgroundColor: on ? C.greenSoft : C.white, borderColor: on ? C.greenChipBorder : C.borderInput, alignItems: 'center' }, fill && { flex: 1 }, style]}>
      <Text style={t(size, 600, on ? C.greenDark : C.ink)}>{label}</Text>
    </Pressable>
  );
}

export function Campo({ label, style, labelStyle, multiline, ...rest }: TextInputProps & { label?: string; labelStyle?: TextStyle }) {
  return (
    <>
      {!!label && <Text style={[t(13, 500, C.muted, { marginBottom: 8 }), labelStyle]}>{label}</Text>}
      <TextInput
        placeholderTextColor={C.placeholder}
        multiline={multiline}
        style={[t(14, 400, C.ink), { borderWidth: 1, borderColor: C.borderInput, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: C.white, boxShadow: SOMBRAS.input }, multiline && { minHeight: 84, lineHeight: 21, textAlignVertical: 'top' }, style]}
        {...rest}
      />
    </>
  );
}

export function Foto({ uri, size, radius, style }: { uri: string; size: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  return <Image source={{ uri }} contentFit="cover" style={[{ width: size, height: size, borderRadius: radius ?? size / 2, backgroundColor: C.greenSoft }, style as any]} />;
}

/** Badge "Modo paseador" / "Paseador" */
export function InsigniaModo({ label = 'Modo paseador', small }: { label?: string; small?: boolean }) {
  return (
    <View style={{ backgroundColor: C.orangeSoft, borderRadius: 999, paddingVertical: small ? 3 : 5, paddingHorizontal: small ? 8 : 12, alignSelf: 'center' }}>
      <Text style={mayus(small ? 10 : 11, small ? 600 : 700, C.orange)}>{label}</Text>
    </View>
  );
}

export function Separador({ label, style }: { label: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12 }, style]}>
      <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
      <Text style={t(11, 700, C.faint, { letterSpacing: 0.88 })}>{label}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
    </View>
  );
}

export function Estrellas({ n = 5, size = 14 }: { n?: number; size?: number }) {
  return <View style={{ flexDirection: 'row', gap: 2 }}>{Array.from({ length: n }, (_, i) => <Icono key={i} name="solar:star-bold" size={size} color={C.star} />)}</View>;
}

export const HuellaFondo = () => (
  <RNImage source={require('../../assets/perrubi/huella-fondo.png')} resizeMode="contain" pointerEvents="none" style={{ position: 'absolute', top: 24, right: 0, width: 160, height: 160, opacity: 0.9 }} />
);

export function AvatarEditable({ size, uri = PASEADOR.avatar }: { size: number; uri?: string }) {
  return (
    <View style={{ width: size, height: size }}>
      <Foto uri={uri} size={size} style={{ borderWidth: 3, borderColor: C.white, boxShadow: SOMBRAS.avatar }} />
      <View style={{ position: 'absolute', right: 0, bottom: 2, width: 28, height: 28, borderRadius: 14, backgroundColor: C.green, borderWidth: 2, borderColor: C.white, alignItems: 'center', justifyContent: 'center' }}>
        <Icono name="solar:camera-bold" size={14} color={C.white} />
      </View>
    </View>
  );
}
