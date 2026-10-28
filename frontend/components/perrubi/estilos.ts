import type { TextStyle, ViewStyle } from 'react-native';

export const C = {
  green: '#57AE47',
  greenDark: '#2F7A3B',
  greenSoft: '#EEF7EC',
  greenTab: '#E4F3E0',
  greenBubble: '#D6EED0',
  greenChipBorder: '#BFE0B8',
  ink: '#1C2A22',
  body: '#4A554E',
  muted: '#6B7280',
  faint: '#8A94A0',
  placeholder: '#A3AAB3',
  bg: '#F7F8FA',
  white: '#FFFFFF',
  border: '#E6EAEE',
  borderInput: '#DADFE5',
  divider: '#EEF1F4',
  line: '#E3ECE6',
  orange: '#B8641A',
  orangeSoft: '#FDF1E1',
  red: '#C0392B',
  redSoft: '#FDEAEA',
  redBorder: '#F1D5D5',
  redDot: '#E5533D',
  blue: '#2D7FD3',
  blueSoft: '#E8F2FC',
  star: '#F2B33D',
  starDark: '#E0A21B',
  starSoft: '#FFF6E0',
  gray: '#F1F4F2',
  grayIcon: '#6B7A72',
  toggleOff: '#DCE4DF',
  offline: '#9AA9A2',
  offlineBg: '#F4F6F5',
  onlineBg: '#EAF6EC',
  track: '#EEF2F0',
  mapBg: '#EEF1EC',
  toastSub: '#D8E4DC',
} as const;

// Poppins: en RN cada peso es una familia distinta (fontWeight no aplica a fuentes custom en Android).
export const F = {
  400: 'Poppins_400Regular',
  500: 'Poppins_500Medium',
  600: 'Poppins_600SemiBold',
  700: 'Poppins_700Bold',
} as const;
export type Peso = keyof typeof F;

/** Estilo de texto: t(13, 700, C.ink) */
export const t = (size: number, w: Peso = 400, color: string = C.ink, extra: TextStyle = {}): TextStyle => ({
  fontSize: size,
  fontFamily: F[w],
  color,
  ...extra,
});

/** Etiqueta en mayúsculas con tracking (.08em) */
export const mayus = (size = 11, w: Peso = 600, color: string = C.faint): TextStyle =>
  t(size, w, color, { letterSpacing: size * 0.08, textTransform: 'uppercase' });

export const SOMBRAS = {
  tarjeta: '0px 3px 8px rgba(28,42,34,0.06)',
  input: '0px 3px 8px rgba(28,42,34,0.10)',
  btn: '0px 4px 12px rgba(87,174,71,0.35)',
  tab: '0px -4px 12px rgba(28,42,34,0.04)',
  avatar: '0px 4px 12px rgba(28,42,34,0.12)',
  pin: '0px 4px 12px rgba(0,0,0,0.25)',
  badge: '0px 2px 8px rgba(0,0,0,0.12)',
  aviso: '0px 12px 24px rgba(0,0,0,0.25)',
};

export const tarjeta: ViewStyle = {
  backgroundColor: C.white,
  borderWidth: 1,
  borderColor: C.border,
  borderRadius: 14,
  boxShadow: SOMBRAS.card,
};
