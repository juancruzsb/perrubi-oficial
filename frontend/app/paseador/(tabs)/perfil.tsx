import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icono } from '@/components/perrubi/icono';
import { AvatarEditable, Boton, Tarjeta, Fila, Pantalla, TituloSeccion, FilaMetricas } from '@/components/perrubi/piezas';
import { C, t } from '@/components/perrubi/estilos';
import { useSessionPaseador } from '../../../context/session-paseador';

export default function PerfilPaseador() {
  const router = useRouter();
  const { walker, salir } = useSessionPaseador();

  const nombre = [walker?.firstName, walker?.lastName].filter(Boolean).join(' ') || 'Paseador';
  const rating = walker?.averageRating ? Number(walker.averageRating).toFixed(1) : '—';

  return (
    <Pantalla pad={{ paddingTop: 18, paddingHorizontal: 18, paddingBottom: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <Text style={t(20, 700)}>Perfil</Text>
        <Pressable onPress={() => router.push('/paseador/editar-perfil')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }}>
          <Icono name="solar:pen-bold" size={16} />
        </Pressable>
      </View>

      <View style={{ alignItems: 'center' }}>
        <AvatarEditable size={88} uri={walker?.profilePicture ?? ''} />
        <Text style={t(18, 700, C.ink, { marginTop: 12 })}>{nombre}</Text>
        {!!walker?.email && <Text style={t(12, 400, C.muted, { marginTop: 2 })}>{walker.email}</Text>}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.greenSoft, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 }}>
            <Icono name="solar:verified-check-bold" size={13} color={C.greenDark} />
            <Text style={t(11, 600, C.greenDark)}>Paseador</Text>
          </View>
          {!!walker?.id && <Text style={t(11, 400, C.muted)}>ID {walker.id}</Text>}
        </View>
      </View>

      <Tarjeta style={{ marginTop: 18, overflow: 'hidden' }}>
        <FilaMetricas centered items={[
          { label: 'Calificación', value: rating },
          { label: 'Reseñas', value: String(walker?.reviewCount ?? 0) },
        ]} />
      </Tarjeta>

      {!!walker?.description && (
        <>
          <TituloSeccion style={{ marginTop: 20 }}>Sobre mí</TituloSeccion>
          <Tarjeta style={{ padding: 14 }}>
            <Text style={t(13.5, 400, C.ink, { lineHeight: 20 })}>{walker.description}</Text>
          </Tarjeta>
        </>
      )}

      <TituloSeccion style={{ marginTop: 20 }}>Actividad</TituloSeccion>
      <Tarjeta style={{ overflow: 'hidden' }}>
        <Fila kind="menu" icon="solar:clipboard-list-bold" title="Mis paseos" onPress={() => router.push('/paseador/mis-paseos')} />
        <Fila kind="menu" icon="solar:wallet-money-bold" title="Ganancias y pagos" onPress={() => router.navigate('/paseador/ganancias')} />
        <Fila kind="menu" icon="solar:calendar-bold" title="Disponibilidad" onPress={() => router.push('/paseador/disponibilidad')} last />
      </Tarjeta>

      <TituloSeccion>Cuenta</TituloSeccion>
      <Tarjeta style={{ overflow: 'hidden' }}>
        <Fila kind="menu" icon="solar:document-text-bold" title="Documentación" onPress={() => router.push('/paseador/documentacion')} />
        <Fila kind="menu" icon="solar:question-circle-bold" title="Ayuda y soporte" onPress={() => router.push('/paseador/ayuda')} />
        <Fila kind="menu" icon="solar:settings-bold" title="Configuración" onPress={() => router.push('/paseador/configuracion')} last />
      </Tarjeta>

      {/* El guard de (tabs)/_layout.tsx redirige solo al login al limpiar la sesión. */}
      <Boton label="Cerrar sesión" variant="danger" icon="solar:logout-2-bold" size={14} weight={600} py={14} onPress={salir} style={{ marginTop: 20 }} />
    </Pantalla>
  );
}
