import React, { memo } from 'react';
import { SvgXml } from 'react-native-svg';
import { ICONOS, type NombreIcono } from './iconos-datos';
import { C } from './estilos';

type Props = { name: NombreIcono; size?: number; color?: string };

/** Íconos Solar/MDI idénticos al prototipo, embebidos (no requieren red). */
export const Icono = memo(function Icono({ name, size = 18, color = C.ink }: Props) {
  const d = ICONOS[name];
  if (!d) return null;
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${d.w} ${d.h}">${d.body.replace(/currentColor/g, color)}</svg>`;
  return <SvgXml xml={xml} width={size} height={size} />;
});

export type { NombreIcono };
