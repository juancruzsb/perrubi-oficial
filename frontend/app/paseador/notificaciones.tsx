import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Icono, type NombreIcono } from '@/components/perrubi/icono';
import { Tarjeta, Encabezado, Pantalla, TituloSeccion } from '@/components/perrubi/piezas';
import { C, t } from '@/components/perrubi/estilos';

type N = { icon: NombreIcono; bg: string; fg: string; title: string; body: string; time: string; to: Href; strong?: boolean };

const HOY: N[] = [
  { icon: 'mdi:paw', bg: C.greenSoft, fg: C.green, title: 'Nueva solicitud cerca', body: 'Noah te necesita para pasear a Toby', time: 'Ahora', to: '/paseador/solicitud', strong: true },
  { icon: 'solar:wallet-money-bold', bg: C.onlineBg, fg: C.green, title: 'Pago recibido', body: '$6.500 acreditados en tu cuenta', time: '15:20', to: '/paseador/ganancias', strong: true },
  { icon: 'solar:alarm-bold', bg: C.gray, fg: C.grayIcon, title: 'Recordatorio', body: 'Tenés un paseo agendado a las 16:00', time: 'Hoy', to: '/paseador', strong: true },
];
const SEMANA: N[] = [
  { icon: 'solar:star-bold', bg: C.starSoft, fg: C.starDark, title: 'Nueva reseña de 5 estrellas', body: 'Ana Gómez: “Muy puntual y atento con Luna.”', time: 'Ayer', to: '/paseador/historial' },
  { icon: 'solar:verified-check-bold', bg: C.greenSoft, fg: C.green, title: 'Antecedentes verificados', body: 'Tu certificado fue aprobado', time: 'Lun', to: '/paseador/documentacion' },
  { icon: 'solar:wallet-money-bold', bg: C.greenSoft, fg: C.green, title: 'Resumen semanal disponible', body: '$42.300 en 7 paseos', time: 'Dom', to: '/paseador/ganancias' },
];

function Grupo({ items }: { items: N[] }) {
  const router = useRouter();
  return (
    <Tarjeta style={{ paddingVertical: 6, paddingHorizontal: 18 }}>
      {items.map((n, i) => (
        <Pressable key={n.title} onPress={() => router.navigate(n.to)} style={{ flexDirection: 'row', gap: 10, paddingVertical: 14, borderBottomWidth: i < items.length - 1 ? 1 : 0, borderBottomColor: C.track }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: n.bg, alignItems: 'center', justifyContent: 'center' }}>
            <Icono name={n.icon} size={17} color={n.fg} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={t(13, n.strong ? 700 : 600)}>{n.title}</Text>
            <Text style={t(12, 400, C.muted, { marginTop: 2 })}>{n.body}</Text>
          </View>
          <Text style={t(11, 400, C.faint)}>{n.time}</Text>
        </Pressable>
      ))}
    </Tarjeta>
  );
}

export default function Notificaciones() {
  return (
    <Pantalla>
      <Encabezado title="Notificaciones" fallback="/paseador" />
      <TituloSeccion style={{ marginTop: 0 }}>Hoy</TituloSeccion>
      <Grupo items={HOY} />
      <TituloSeccion>Esta semana</TituloSeccion>
      <Grupo items={SEMANA} />
    </Pantalla>
  );
}
