import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Boton, Tarjeta, Encabezado, CuadroIcono, Etiqueta, Fila, Pantalla, TituloSeccion, Espacio } from '@/components/perrubi/piezas';
import { C, t } from '@/components/perrubi/estilos';

export default function Documentacion() {
  const router = useRouter();
  const upload = () => router.push('/paseador/verificacion');
  return (
    <Pantalla pad={{ paddingTop: 18, paddingHorizontal: 20, paddingBottom: 24 }}>
      <Encabezado title="Documentación" fallback="/paseador/perfil" style={{ marginBottom: 16 }} />
      <Tarjeta style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <CuadroIcono icon="solar:shield-check-bold" />
        <View style={{ flex: 1 }}>
          <Text style={t(13.5, 600)}>Perfil verificado</Text>
          <Text style={t(11.5, 400, C.muted, { marginTop: 2 })}>2 de 3 documentos aprobados</Text>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: C.divider, marginTop: 8, overflow: 'hidden' }}>
            <View style={{ width: '66%', height: '100%', backgroundColor: C.green, borderRadius: 3 }} />
          </View>
        </View>
      </Tarjeta>

      <TituloSeccion>Documentos</TituloSeccion>
      <Tarjeta style={{ overflow: 'hidden' }}>
        <Fila icon="solar:card-2-bold" title="DNI (frente y dorso)" sub="Subido el 12/05" right={<Etiqueta label="Aprobado" />} />
        <Fila icon="solar:document-text-bold" title="Certificado de antecedentes" sub="Vence el 12/11/2026" right={<Etiqueta label="Aprobado" />} />
        <Fila icon="solar:home-2-bold" tone="orange" title="Constancia de domicilio" sub="Requerido para paseos largos" onPress={upload} right={<Etiqueta label="Pendiente" tone="orange" />} last />
      </Tarjeta>
      <Text style={t(11.5, 400, C.faint, { lineHeight: 17, marginTop: 12, marginHorizontal: 4 })}>
        Los documentos se usan solo para validar tu identidad. No se comparten con los dueños.
      </Text>

      <Espacio />
      <Boton label="Subir documento" size={14} weight={600} style={{ marginTop: 20 }} onPress={upload} />
    </Pantalla>
  );
}
