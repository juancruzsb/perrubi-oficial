import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icono } from '@/components/perrubi/icono';
import { MapaEstatico, MOSAICOS } from '@/components/perrubi/mapa-estatico';
import { useAviso } from '@/components/perrubi/aviso';
import { Boton, Encabezado, Foto, Pantalla } from '@/components/perrubi/piezas';
import { C, tarjeta, t } from '@/components/perrubi/estilos';
import { PERRO_TOBY } from '@/lib/datos-paseador';

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.greenSoft, borderRadius: 12, padding: 12, alignItems: 'center' }}>
      <Text style={t(11, 600, C.greenDark)}>{label}</Text>
      <Text style={t(15, 700)}>{value}</Text>
    </View>
  );
}

export default function Solicitud() {
  const router = useRouter();
  const aviso = useAviso();
  return (
    <Pantalla>
      <Encabezado title="Solicitud de paseo" fallback="/paseador" />
      <MapaEstatico height={160} tile={MOSAICOS.z15} bordered={false} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 }}>
        <Foto uri={PERRO_TOBY} size={48} />
        <View style={{ flex: 1 }}>
          <Text style={t(15, 700)}>Toby · Labrador</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={t(12, 400, C.muted)}>Dueño: Noah ·</Text>
            <Icono name="solar:star-bold" size={12} color={C.star} />
            <Text style={t(12, 400, C.muted)}>5.0</Text>
          </View>
        </View>
        <Text style={t(16, 700, C.orange)}>$6.500</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Dato label="DURACIÓN" value="30 min" />
        <Dato label="DISTANCIA" value="0.8 km" />
      </View>
      <View style={{ marginTop: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Icono name="solar:map-point-bold" size={16} color={C.green} /><Text style={t(13, 700)}>Punto de recogida</Text>
        </View>
        <Text style={t(13, 400, C.body)}>Av. Santa Fe 1234, CABA</Text>
      </View>
      <View style={{ marginTop: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Icono name="solar:notes-bold" size={16} color={C.green} /><Text style={t(13, 700)}>Notas del dueño</Text>
        </View>
        <Text style={[t(13, 400, C.body), tarjeta, { borderRadius: 10, padding: 10, boxShadow: undefined }]}>Toby es muy sociable, puede socializar con otros perros en el parque.</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
        <Boton label="Rechazar" variant="danger" size={14} py={14} style={{ flex: 1 }} onPress={() => { aviso('Solicitud rechazada', 'Seguí buscando otros paseos cerca.'); router.replace('/paseador'); }} />
        <Boton label="Aceptar" size={14} py={14} style={{ flex: 1 }} onPress={() => router.replace('/paseador/en-camino')} />
      </View>
    </Pantalla>
  );
}
