import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Icono } from '@/components/perrubi/icono';
import { useAviso } from '@/components/perrubi/aviso';
import { Tarjeta, Encabezado, Fila, Pantalla, TituloSeccion } from '@/components/perrubi/piezas';
import { C, t } from '@/components/perrubi/estilos';
import { PREGUNTAS } from '@/lib/datos-paseador';

export default function Ayuda() {
  const aviso = useAviso();
  const [open, setOpen] = useState(0);
  return (
    <Pantalla pad={{ paddingTop: 18, paddingHorizontal: 20, paddingBottom: 24 }}>
      <Encabezado title="Ayuda y soporte" fallback="/paseador/perfil" style={{ marginBottom: 16 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.white, borderWidth: 1, borderColor: C.borderInput, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, boxShadow: '0px 3px 8px rgba(28,42,34,0.08)' }}>
        <Icono name="solar:magnifer-linear" size={18} color={C.faint} />
        <TextInput placeholder="Buscar en la ayuda" placeholderTextColor={C.placeholder} style={[t(14), { flex: 1, padding: 0 }]} />
      </View>

      <TituloSeccion>Preguntas frecuentes</TituloSeccion>
      <Tarjeta style={{ overflow: 'hidden' }}>
        {PREGUNTAS.map(([q, a], i) => (
          <Pressable key={q} onPress={() => setOpen(open === i ? -1 : i)} style={{ paddingVertical: 13, paddingHorizontal: 14, borderBottomWidth: i < PREGUNTAS.length - 1 ? 1 : 0, borderBottomColor: C.divider }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={t(13.5, 600, C.ink, { flex: 1 })}>{q}</Text>
              <Icono name={open === i ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'} size={16} color={C.faint} />
            </View>
            {open === i && <Text style={t(12.5, 400, C.muted, { lineHeight: 19, marginTop: 8 })}>{a}</Text>}
          </Pressable>
        ))}
      </Tarjeta>

      <TituloSeccion>Contacto</TituloSeccion>
      <Tarjeta style={{ overflow: 'hidden' }}>
        <Fila icon="solar:chat-round-dots-bold" title="Chat con soporte" sub="Respuesta en menos de 5 min" onPress={() => aviso('Soporte', 'Un agente se va a comunicar en breve.')} />
        <Fila icon="solar:danger-triangle-bold" tone="red" title="Reportar un incidente" sub="Durante o después de un paseo" onPress={() => aviso('Reporte iniciado', 'Te contactamos en menos de 5 min.')} last />
      </Tarjeta>
    </Pantalla>
  );
}
