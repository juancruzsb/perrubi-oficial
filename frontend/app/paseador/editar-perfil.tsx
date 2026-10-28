import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAviso } from '@/components/perrubi/aviso';
import { AvatarEditable, Boton, Campo, Encabezado, Pantalla } from '@/components/perrubi/piezas';
import { C, t } from '@/components/perrubi/estilos';
import { PASEADOR } from '@/lib/datos-paseador';

export default function EditarPerfil() {
  const router = useRouter();
  const aviso = useAviso();
  const lbl = { marginTop: 12 };
  return (
    <Pantalla pad={{ paddingTop: 18, paddingHorizontal: 20, paddingBottom: 24 }}>
      <Encabezado title="Editar perfil" fallback="/paseador/perfil" style={{ marginBottom: 16 }} />
      <View style={{ alignItems: 'center' }}>
        <AvatarEditable size={84} />
        <Text style={t(12, 600, C.green, { marginTop: 8 })}>Cambiar foto</Text>
      </View>
      <Campo label="Nombre completo" defaultValue={PASEADOR.name} labelStyle={{ marginTop: 8 }} />
      <Campo label="Teléfono" defaultValue={PASEADOR.phone} keyboardType="phone-pad" labelStyle={lbl} />
      <Campo label="Correo" defaultValue={PASEADOR.email} keyboardType="email-address" autoCapitalize="none" labelStyle={lbl} />
      <Campo label="Sobre mí" defaultValue={PASEADOR.bio} multiline labelStyle={lbl} />
      <Boton label="Guardar cambios" size={14} weight={600} style={{ marginTop: 20 }} onPress={() => { aviso('Perfil actualizado', 'Los cambios ya son visibles para los dueños.'); router.back(); }} />
    </Pantalla>
  );
}
