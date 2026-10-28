import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Icono } from '@/components/perrubi/icono';
import { useAviso } from '@/components/perrubi/aviso';
import { Boton, Pantalla } from '@/components/perrubi/piezas';
import { C, t } from '@/components/perrubi/estilos';

export default function VerificacionPaseador() {
  const router = useRouter();
  const aviso = useAviso();
  return (
    <Pantalla pad={{ paddingVertical: 24, paddingHorizontal: 28, alignItems: 'center' }}>
      <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none"><Path d="M12 2l7 3v6c0 5-3.5 8-7 11-3.5-3-7-6-7-11V5l7-3z" stroke={C.green} strokeWidth={2} /></Svg>
      </View>
      <Text style={t(19, 700, C.ink, { marginTop: 14 })}>Verificá tu identidad</Text>
      <Text style={t(13, 400, C.muted, { marginTop: 6, maxWidth: 280, textAlign: 'center' })}>Subí una foto de tu documento para poder recibir paseos.</Text>
      {/* TODO: expo-image-picker → subir a endpoint de documentos */}
      <Pressable style={{ width: 200, height: 130, marginTop: 20, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.borderInput, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Icono name="solar:camera-bold" size={22} color={C.faint} />
        <Text style={t(12, 500, C.faint)}>Foto del documento</Text>
      </Pressable>
      <Boton
        label="Enviar para revisión"
        style={{ alignSelf: 'stretch', marginTop: 24 }}
        onPress={() => { aviso('Documento enviado', 'Revisión en curso · tiempo estimado 24 h (demo: acceso inmediato).'); router.replace('/paseador'); }}
      />
    </Pantalla>
  );
}
