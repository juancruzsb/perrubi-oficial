import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icono, type NombreIcono } from '@/components/perrubi/icono';
import { MapaEstatico } from '@/components/perrubi/mapa-estatico';
import { useAviso } from '@/components/perrubi/aviso';
import { Boton, Tarjeta, Encabezado, Pantalla, Espacio } from '@/components/perrubi/piezas';
import { C, tarjeta, t } from '@/components/perrubi/estilos';
import { usePaseoPaseador } from '@/context/paseo-paseador';
import { PERRO_TOBY } from '@/lib/datos-paseador';

function AccionCuadro({ icon, label, onPress }: { icon: NombreIcono; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[tarjeta, { flex: 1, borderRadius: 12, padding: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }]}>
      <Icono name={icon} size={16} /><Text style={t(13, 700)}>{label}</Text>
    </Pressable>
  );
}

export default function EnCamino() {
  const router = useRouter();
  const aviso = useAviso();
  const { reiniciarPaseo, iniciarPaseo } = usePaseoPaseador();
  return (
    <Pantalla pad={{}}>
      <Encabezado title="Camino a la recogida" fallback="/paseador" style={{ paddingVertical: 14, paddingHorizontal: 16, marginBottom: 0 }} onBack={() => router.navigate('/paseador')} />
      <View style={{ marginHorizontal: 16, backgroundColor: C.greenSoft, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Icono name="solar:walking-bold" size={18} color={C.green} />
        <Text style={t(13, 700, C.ink, { flex: 1 })}>Yendo a buscar a Toby</Text>
        <Text style={t(12, 700, C.greenDark)}>6 min · 0.8 km</Text>
      </View>
      <MapaEstatico
        height={240} style={{ marginTop: 12, marginHorizontal: 16 }}
        route={[[22, 80], [38, 62], [52, 50], [70, 28]]} dashed routeWidth={1.4}
        pins={[{ kind: 'me', x: 22, y: 80 }, { kind: 'dog', x: 70, y: 28, uri: PERRO_TOBY }]}
        gps="GPS activo · ±5 m"
      />
      <Tarjeta style={{ marginTop: 14, marginHorizontal: 16, paddingVertical: 12, paddingHorizontal: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icono name="solar:map-point-bold" size={14} color={C.green} /><Text style={t(12, 700)}>Av. Santa Fe 1234, CABA</Text>
        </View>
        <Text style={t(11, 400, C.muted, { marginTop: 2 })}>Timbre azul, 4° B</Text>
      </Tarjeta>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, marginHorizontal: 16 }}>
        <AccionCuadro icon="solar:chat-round-dots-bold" label="Chat" onPress={() => router.navigate('/paseador/chat')} />
        <AccionCuadro icon="solar:phone-bold" label="Llamar" onPress={() => aviso('Llamando a Noah', '+54 11 5555 0198 · llamada enmascarada')} />
      </View>
      <Espacio />
      <View style={{ padding: 16 }}>
        <Boton label="Llegué, iniciar paseo" onPress={() => { reiniciarPaseo(); iniciarPaseo(); router.replace('/paseador/paseo-activo'); }} />
      </View>
    </Pantalla>
  );
}
