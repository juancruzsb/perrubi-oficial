import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Tarjeta, Opcion, Encabezado, Foto, Pantalla, FilaMetricas } from '@/components/perrubi/piezas';
import { C, t } from '@/components/perrubi/estilos';
import { HISTORIAL } from '@/lib/datos-paseador';

const FILTERS = ['Todos', 'Completados', 'Cancelados'] as const;

export default function Historial() {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Todos');
  const items = HISTORIAL.map((w, i) => ({ ...w, i })).filter((w) =>
    filter === 'Todos' || (filter === 'Completados' ? w.status === 'Completado' : w.status === 'Cancelado'));

  return (
    <Pantalla>
      <Encabezado title="Historial de paseos" fallback="/paseador/perfil" />
      <Tarjeta style={{ marginBottom: 14 }}>
        <FilaMetricas valueSize={17} items={[
          { label: 'Este mes', value: '24 paseos' },
          { label: 'Distancia', value: '61,4 km' },
          { label: 'Cobrado', value: '$168k', color: C.orange },
        ]} />
      </Tarjeta>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
        {FILTERS.map((f) => <Opcion key={f} label={f} on={filter === f} onPress={() => setFilter(f)} />)}
      </View>
      {items.map((w, k) => (
        <View key={w.i} style={{ marginBottom: 6 }}>
          {(k === 0 || items[k - 1].day !== w.day) && <Text style={t(12, 700, C.ink, { marginTop: 8, marginBottom: 6 })}>{w.day}</Text>}
          <Tarjeta onPress={() => router.push({ pathname: '/paseador/detalle-del-paseo', params: { i: w.i } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 12 }}>
            <Foto uri={w.img} size={42} radius={12} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={t(13.5, 600)}>{w.dog} · {w.duration}</Text>
              <Text style={t(11.5, 400, C.muted, { marginTop: 1 })}>{w.time} · {w.distance} · {w.person}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={t(13, 700)}>{w.pay}</Text>
              <Text style={t(11, 700, w.status === 'Completado' ? C.greenDark : C.red)}>{w.status}</Text>
            </View>
          </Tarjeta>
        </View>
      ))}
    </Pantalla>
  );
}
