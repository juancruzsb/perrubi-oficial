import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MapaEstatico } from '@/components/perrubi/mapa-estatico';
import { useAviso } from '@/components/perrubi/aviso';
import { Boton, Tarjeta, Opcion, Encabezado, Pantalla, TituloSeccion, Interruptor } from '@/components/perrubi/piezas';
import { C, tarjeta, t } from '@/components/perrubi/estilos';
import { usePaseoPaseador } from '@/context/paseo-paseador';
import { DIAS_SEMANA } from '@/lib/datos-paseador';

function BotonRedondo({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: C.borderInput, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={t(16, 400)}>{label}</Text>
    </Pressable>
  );
}

export default function Disponibilidad() {
  const router = useRouter();
  const aviso = useAviso();
  const { disponible, alternarDisponible } = usePaseoPaseador();
  const [radius, setRadius] = useState(3);
  const [sizes, setSizes] = useState<Record<string, boolean>>({ 'Pequeño': true, 'Mediano': true, 'Grande': false });

  return (
    <Pantalla>
      <Encabezado title="Disponibilidad" fallback="/paseador/perfil" />
      <Tarjeta onPress={alternarDisponible} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={t(14, 700)}>Disponible para recibir paseos</Text>
          <Text style={t(12, 400, C.muted, { marginTop: 2 })}>Activá para aparecer en las búsquedas cercanas</Text>
        </View>
        <Interruptor on={disponible} />
      </Tarjeta>

      <Text style={t(13, 700, C.ink, { marginTop: 18, marginBottom: 8 })}>Horario habitual</Text>
      {DIAS_SEMANA.map((d, i) => (
        <View key={d} style={[tarjeta, { borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 8 }]}>
          <Text style={t(13, 700, C.ink, { flex: 1 })}>{d}</Text>
          <Text style={t(12, 400, C.muted)}>{i < 5 ? '08:00 – 18:00' : 'No disponible'}</Text>
          <Interruptor on={i < 5} w={36} h={20} />
        </View>
      ))}

      <TituloSeccion>Zona de trabajo</TituloSeccion>
      <Tarjeta style={{ overflow: 'hidden' }}>
        <MapaEstatico height={110} radius={0} bordered={false} pins={[{ kind: 'zone', x: 50, y: 50 }]} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14 }}>
          <View>
            <Text style={t(13.5, 600)}>Palermo, CABA</Text>
            <Text style={t(11.5, 400, C.muted)}>Radio de búsqueda</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <BotonRedondo label="−" onPress={() => setRadius((r) => Math.max(1, r - 1))} />
            <Text style={t(14, 700, C.ink, { minWidth: 44, textAlign: 'center' })}>{radius} km</Text>
            <BotonRedondo label="+" onPress={() => setRadius((r) => Math.min(10, r + 1))} />
          </View>
        </View>
      </Tarjeta>

      <TituloSeccion>Tamaños que aceptás</TituloSeccion>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {Object.keys(sizes).map((s) => (
          <Opcion key={s} label={s} on={sizes[s]} size={13} style={{ paddingVertical: 9, paddingHorizontal: 14 }} onPress={() => setSizes((x) => ({ ...x, [s]: !x[s] }))} />
        ))}
      </View>

      <Boton label="Guardar horario" size={14} weight={600} style={{ marginTop: 20 }} onPress={() => { aviso('Horario guardado', `Lun–Vie 08:00–18:00 · radio ${radius} km`); router.back(); }} />
    </Pantalla>
  );
}
