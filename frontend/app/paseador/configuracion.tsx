import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAviso } from '@/components/perrubi/aviso';
import { Tarjeta, Encabezado, Fila, Pantalla, TituloSeccion, Interruptor } from '@/components/perrubi/piezas';
import { C, t } from '@/components/perrubi/estilos';
import { PREFERENCIAS } from '@/lib/datos-paseador';

type K = (typeof PREFERENCIAS)[number][0];

export default function Configuracion() {
  const aviso = useAviso();
  const [prefs, setPrefs] = useState<Record<K, boolean>>({ push: true, sound: true, location: true, auto: false });
  const soon = () => aviso('Próximamente', 'Esta sección todavía no está disponible.');

  return (
    <Pantalla pad={{ paddingTop: 18, paddingHorizontal: 20, paddingBottom: 24 }}>
      <Encabezado title="Configuración" fallback="/paseador/perfil" style={{ marginBottom: 16 }} />
      <TituloSeccion style={{ marginTop: 0 }}>Preferencias</TituloSeccion>
      <Tarjeta style={{ overflow: 'hidden' }}>
        {PREFERENCIAS.map(([k, label, sub], i) => (
          <Pressable key={k} onPress={() => setPrefs((p) => ({ ...p, [k]: !p[k] }))} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 14, borderBottomWidth: i < PREFERENCIAS.length - 1 ? 1 : 0, borderBottomColor: C.divider }}>
            <View style={{ flex: 1 }}>
              <Text style={t(13.5, 600)}>{label}</Text>
              <Text style={t(11.5, 400, C.muted, { marginTop: 2 })}>{sub}</Text>
            </View>
            <Interruptor on={prefs[k]} w={40} h={22} shadow />
          </Pressable>
        ))}
      </Tarjeta>

      <TituloSeccion>General</TituloSeccion>
      <Tarjeta style={{ overflow: 'hidden' }}>
        <Fila icon="solar:global-bold" title="Idioma" sub="Español (Argentina)" onPress={soon} />
        <Fila icon="solar:lock-keyhole-bold" title="Cambiar contraseña" onPress={soon} />
        <Fila icon="solar:shield-user-bold" title="Privacidad" onPress={soon} last />
      </Tarjeta>

      <Pressable onPress={() => aviso('Eliminar cuenta', 'Esta acción requiere confirmar por correo.')} style={{ marginTop: 22, alignSelf: 'center' }}>
        <Text style={t(13, 600, C.red)}>Eliminar cuenta</Text>
      </Pressable>
      <Text style={t(11, 400, C.placeholder, { textAlign: 'center', marginTop: 8 })}>Perrubi Paseador · v1.4.2</Text>
    </Pantalla>
  );
}
