import React from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MapaEstatico } from '@/components/perrubi/mapa-estatico';
import { useAviso } from '@/components/perrubi/aviso';
import { Boton, Tarjeta, Encabezado, Foto, Etiqueta, Pantalla, TituloSeccion, Estrellas, FilaMetricas } from '@/components/perrubi/piezas';
import { C, SOMBRAS, t } from '@/components/perrubi/estilos';
import { HISTORIAL } from '@/lib/datos-paseador';

function Linea({ k, v, total }: { k: string; v: string; total?: boolean }) {
  return (
    <View style={[{ flexDirection: 'row', justifyContent: 'space-between' }, total && { borderTopWidth: 1, borderTopColor: C.divider, paddingTop: 8 }]}>
      <Text style={t(12.5, total ? 600 : 400, total ? C.ink : C.muted)}>{k}</Text>
      <Text style={t(12.5, total ? 700 : 600, total ? C.orange : C.ink)}>{v}</Text>
    </View>
  );
}

export default function DetalleDelPaseo() {
  const { i } = useLocalSearchParams<{ i?: string }>();
  const aviso = useAviso();
  const hd = HISTORIAL[Number(i) || 0] ?? HISTORIAL[0];
  const ok = hd.status === 'Completado';

  return (
    <Pantalla pad={{ paddingTop: 18, paddingHorizontal: 20, paddingBottom: 24 }}>
      <Encabezado title="Detalle del paseo" fallback="/paseador/historial" style={{ marginBottom: 16 }} />
      <Tarjeta style={{ overflow: 'hidden' }}>
        <MapaEstatico height={150} radius={0} bordered={false} route={[[14, 70], [34, 40], [56, 52], [78, 26], [88, 60]]} routeWidth={1.8} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 }}>
          <Foto uri={hd.img} size={44} radius={12} />
          <View style={{ flex: 1 }}>
            <Text style={t(14, 700)}>{hd.dog}</Text>
            <Text style={t(11.5, 400, C.muted)}>Dueño: {hd.person} · {hd.day} {hd.time}</Text>
          </View>
          <Etiqueta label={hd.status} tone={ok ? 'green' : 'red'} />
        </View>
      </Tarjeta>
      <Tarjeta style={{ marginTop: 12 }}>
        <FilaMetricas items={[
          { label: 'Duración', value: hd.duration },
          { label: 'Distancia', value: hd.distance },
          { label: 'Ritmo', value: hd.pace },
        ]} />
      </Tarjeta>
      <TituloSeccion>Pago</TituloSeccion>
      <Tarjeta style={{ paddingVertical: 12, paddingHorizontal: 14, gap: 8 }}>
        <Linea k="Tarifa del paseo" v={hd.gross} />
        <Linea k="Comisión Perrubi (10%)" v={hd.fee} />
        <Linea k="Total cobrado" v={hd.pay} total />
      </Tarjeta>
      {!!hd.review && (
        <>
          <TituloSeccion>Reseña recibida</TituloSeccion>
          <Tarjeta style={{ paddingVertical: 12, paddingHorizontal: 14 }}>
            <Estrellas />
            <Text style={t(12.5, 400, C.ink, { lineHeight: 19, marginTop: 6 })}>{hd.review}</Text>
          </Tarjeta>
        </>
      )}
      <Boton label="Reportar un problema" variant="outline" size={13.5} weight={600} py={13} style={{ marginTop: 16, boxShadow: SOMBRAS.input }} onPress={() => aviso('Soporte', 'Un agente se va a comunicar en breve.')} />
    </Pantalla>
  );
}
