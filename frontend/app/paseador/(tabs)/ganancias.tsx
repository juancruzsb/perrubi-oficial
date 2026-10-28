import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icono, type NombreIcono } from '@/components/perrubi/icono';
import { Boton, Tarjeta, FlechaDerecha, CuadroIcono, Pantalla } from '@/components/perrubi/piezas';
import { C, mayus, tarjeta, t } from '@/components/perrubi/estilos';
import { MOVIMIENTOS, BARRAS_SEMANA } from '@/lib/datos-paseador';

export default function Ganancias() {
  const router = useRouter();
  const withdraw = () => router.push('/paseador/retirar');
  return (
    <Pantalla>
      <Text style={t(18, 700, C.ink, { textAlign: 'center', marginBottom: 14 })}>Ganancias</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, backgroundColor: C.greenSoft, borderRadius: 14, padding: 14 }}>
          <Text style={t(11, 700, C.greenDark)}>HOY</Text>
          <Text style={t(20, 700, C.ink, { marginTop: 4 })}>$6.500</Text>
          <Text style={t(11, 400, C.muted)}>1 paseo</Text>
        </View>
        <View style={[tarjeta, { flex: 1, padding: 14 }]}>
          <Text style={t(11, 600, C.muted)}>ESTA SEMANA</Text>
          <Text style={t(20, 700, C.ink, { marginTop: 4 })}>$42.300</Text>
          <Text style={t(11, 400, C.muted)}>7 paseos</Text>
        </View>
      </View>

      <Tarjeta style={{ padding: 16, marginTop: 14 }}>
        <Text style={t(13, 700, C.ink, { marginBottom: 12 })}>Últimos 7 días</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 80 }}>
          {BARRAS_SEMANA.map((h, i) => (
            <View key={i} style={{ flex: 1, height: `${h * 100}%`, borderRadius: 4, backgroundColor: i === BARRAS_SEMANA.length - 1 ? C.green : C.greenSoft }} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <Text key={i} style={t(10, 400, C.faint)}>{d}</Text>)}
        </View>
      </Tarjeta>

      <View style={{ marginTop: 16 }}>
        <Text style={t(13, 700, C.ink, { marginBottom: 8 })}>Método de cobro</Text>
        <Tarjeta onPress={withdraw} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
          <CuadroIcono icon="solar:card-bold" tone="blue" size={34} />
          <View style={{ flex: 1 }}>
            <Text style={t(13, 600)}>Mercado Pago</Text>
            <Text style={t(11, 400, C.muted)}>CVU ···· 4821</Text>
          </View>
          <FlechaDerecha />
        </Tarjeta>
      </View>

      <Tarjeta style={{ marginTop: 8, overflow: 'hidden' }}>
        <Text style={[mayus(), { marginTop: 12, marginHorizontal: 14, marginBottom: 4 }]}>Movimientos recientes</Text>
        {MOVIMIENTOS.map((m) => (
          <View key={m.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: C.divider }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: m.income ? C.orangeSoft : C.gray, alignItems: 'center', justifyContent: 'center' }}>
              <Icono name={m.icon as NombreIcono} size={16} color={m.income ? C.orange : C.muted} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={t(13, 600)}>{m.title}</Text>
              <Text style={t(11, 400, C.muted)}>{m.sub}</Text>
            </View>
            <Text style={t(13, 700, m.income ? C.orange : C.ink)}>{m.amount}</Text>
          </View>
        ))}
      </Tarjeta>

      <Boton label="Retirar ganancias" onPress={withdraw} size={14} weight={600} style={{ marginTop: 16 }} />
    </Pantalla>
  );
}
