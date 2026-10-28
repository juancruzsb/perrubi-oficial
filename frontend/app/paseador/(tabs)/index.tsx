import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router/react-navigation';
import { Icono } from '@/components/perrubi/icono';
import { Boton, Tarjeta, InsigniaModo, Foto, FilaMetricas } from '@/components/perrubi/piezas';
import { useAviso } from '@/components/perrubi/aviso';
import { C, t } from '@/components/perrubi/estilos';
import { usePaseoPaseador } from '@/context/paseo-paseador';
import { useSessionPaseador } from '../../../context/session-paseador';
import { getAvailableWalks, getMyWalksAsWalker, acceptWalk } from '../../../api/walker';
import { dogsOf } from '../../../api/walks';
import type { Walk } from '../../../api/types';

const pesos = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;
const hora = (iso: string) => { const d = new Date(iso); return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; };
const esHoy = (iso: string | null) => !!iso && new Date(iso).toDateString() === new Date().toDateString();

// Resumen del día a partir de GET /walks/me (paseos asignados a este paseador).
function resumenDelDia(mios: Walk[]) {
  const hoy = mios.filter((w) => esHoy(w.startTime ?? w.createdAt) && w.status !== 'canceled');
  const ganado = hoy.filter((w) => w.status === 'finished').reduce((s, w) => s + Number(w.price ?? 0), 0);
  const proximo = mios
    .filter((w) => w.status === 'accepted' && w.startTime)
    .sort((a, b) => a.startTime!.localeCompare(b.startTime!))[0];
  return {
    hechos: hoy.filter((w) => w.status === 'finished').length,
    total: hoy.length,
    ganado,
    proximo: proximo ? hora(proximo.startTime!) : '—',
  };
}

export default function InicioPaseador() {
  const router = useRouter();
  const aviso = useAviso();
  const { walker } = useSessionPaseador();
  // "Disponible" es solo local: el back todavía no tiene un campo para esto.
  const { disponible, alternarDisponible } = usePaseoPaseador();
  const [walks, setWalks] = useState<Walk[] | null>(null);
  const [mios, setMios] = useState<Walk[]>([]);
  const [error, setError] = useState('');
  const [refrescando, setRefrescando] = useState(false);
  const [aceptandoId, setAceptandoId] = useState<number | null>(null);

  const cargar = useCallback(async (esRefresh = false) => {
    try {
      setError('');
      if (esRefresh) setRefrescando(true);
      const [disp, propios] = await Promise.all([getAvailableWalks(), getMyWalksAsWalker()]);
      setWalks(disp);
      setMios(propios);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar los paseos disponibles.');
    } finally {
      if (esRefresh) setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const handleAceptar = async (walkId: number) => {
    try {
      setAceptandoId(walkId);
      await acceptWalk(walkId);
      aviso('¡Paseo aceptado!', 'Ya podés ver el detalle y coordinar con el dueño.');
      router.push(`/paseador/paseo/${walkId}`);
    } catch (err: any) {
      aviso('No se pudo aceptar', err.message || 'Puede que otro paseador ya lo haya tomado.');
    } finally {
      setAceptandoId(null);
      cargar();
    }
  };

  const nombre = [walker?.firstName, walker?.lastName].filter(Boolean).join(' ') || 'Paseador';
  const rating = walker?.averageRating ? Number(walker.averageRating).toFixed(1) : 'Nuevo';
  const resumen = resumenDelDia(mios);
  const lista = walks ?? [];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => cargar(true)} colors={[C.green]} tintColor={C.green} />}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingHorizontal: 20, paddingBottom: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={require('@/assets/perrubi/logo-perrubi.png')} resizeMode="contain" style={{ width: 30, height: 30 }} />
            <Image source={require('@/assets/perrubi/texto-perrubi.png')} resizeMode="contain" style={{ width: 76, height: 20 }} />
            <InsigniaModo label="Paseador" small />
          </View>
          <Pressable onPress={() => router.push('/paseador/notificaciones')} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }}>
            <Icono name="solar:bell-bold" size={18} />
          </Pressable>
        </View>

        <Tarjeta style={{ marginTop: 10, marginHorizontal: 20, overflow: 'hidden' }}>
          <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Foto uri={walker?.profilePicture ?? ''} size={44} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={t(14, 700)} numberOfLines={1}>{nombre}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Icono name="solar:star-bold" size={12} color={C.star} />
                <Text style={t(11, 400, C.muted)}>{rating} · {walker?.reviewCount ?? 0} reseñas</Text>
              </View>
            </View>
            <Pressable onPress={alternarDisponible} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: disponible ? C.onlineBg : C.offlineBg, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: disponible ? C.green : C.offline }} />
              <Text style={t(12, 600, disponible ? C.greenDark : C.grayIcon)}>{disponible ? 'Disponible' : 'Desconectado'}</Text>
            </Pressable>
          </View>
          <FilaMetricas
            style={{ borderTopWidth: 1, borderTopColor: C.divider }}
            items={[
              { label: 'Paseos hoy', value: String(resumen.hechos), suffix: `de ${resumen.total}` },
              { label: 'Ganado hoy', value: pesos(resumen.ganado), color: C.orange },
              { label: 'Próximo', value: resumen.proximo },
            ]}
          />
        </Tarjeta>

        {!!error && (
          <Pressable onPress={() => cargar()} style={{ marginTop: 14, marginHorizontal: 20, backgroundColor: C.redSoft, borderWidth: 1, borderColor: C.redBorder, borderRadius: 12, padding: 12 }}>
            <Text style={t(13, 500, C.red, { textAlign: 'center' })}>{error} Tocá para reintentar.</Text>
          </Pressable>
        )}

        {disponible ? (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, marginHorizontal: 20 }}>
              <Text style={t(15, 700)}>Paseos disponibles cerca</Text>
              {lista.length > 0 && (
                <View style={{ backgroundColor: C.greenSoft, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999 }}>
                  <Text style={t(11, 600, C.greenDark)}>{lista.length} {lista.length === 1 ? 'nuevo' : 'nuevos'}</Text>
                </View>
              )}
            </View>

            {walks === null && !error ? (
              <ActivityIndicator color={C.green} style={{ marginTop: 32 }} />
            ) : lista.length === 0 ? (
              <Text style={t(13, 400, C.muted, { textAlign: 'center', marginTop: 28, marginHorizontal: 32, lineHeight: 19 })}>
                No hay paseos disponibles por ahora. Deslizá hacia abajo para actualizar.
              </Text>
            ) : (
              lista.map((w) => {
                const perros = dogsOf(w);
                const titulo = perros.map((d) => d.name).join(', ') || 'Sin perros cargados';
                const raza = perros.length === 1 && perros[0].breed ? ` · ${perros[0].breed}` : '';
                const dueno = w.users[0]?.user.firstName;
                const lugar = w.address?.street ?? w.address?.label ?? 'Sin dirección';
                const detalle = [dueno && `Con ${dueno}`, lugar, w.duration != null && `${w.duration} min`].filter(Boolean).join(' · ');
                const aceptando = aceptandoId === w.id;
                return (
                  <Tarjeta key={w.id} style={{ marginTop: 10, marginHorizontal: 20, paddingVertical: 12, paddingHorizontal: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Foto uri={perros[0]?.photo ?? ''} size={44} radius={12} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={t(13, 700)} numberOfLines={1}>{titulo}{raza}</Text>
                        <Text style={t(11, 400, C.muted, { marginTop: 2 })} numberOfLines={2}>{detalle}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        {!!w.price && <Text style={t(13, 700, C.orange)}>{pesos(Number(w.price))}</Text>}
                        {!!w.startTime && <Text style={t(10, 400, C.faint)}>{hora(w.startTime)}</Text>}
                      </View>
                    </View>
                    {!!w.notes && <Text style={t(12, 400, C.muted, { marginTop: 8, fontStyle: 'italic' })}>{w.notes}</Text>}
                    <Boton
                      label={aceptando ? 'Aceptando…' : 'Aceptar paseo'}
                      left={aceptando ? <ActivityIndicator color={C.white} size="small" /> : undefined}
                      onPress={aceptandoId === null ? () => handleAceptar(w.id) : undefined}
                      size={13} weight={600} py={10}
                      style={[{ marginTop: 12 }, aceptandoId !== null && { opacity: 0.7 }]}
                    />
                  </Tarjeta>
                );
              })
            )}
          </>
        ) : (
          <Tarjeta style={{ marginTop: 18, marginHorizontal: 20, paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center' }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: C.gray, alignItems: 'center', justifyContent: 'center' }}>
              <Icono name="solar:moon-sleep-bold" size={30} color={C.faint} />
            </View>
            <Text style={t(14, 700, C.ink, { marginTop: 14 })}>Estás desconectado</Text>
            <Text style={t(12, 400, C.muted, { marginTop: 4, lineHeight: 18, textAlign: 'center' })}>No vas a recibir solicitudes hasta que actives tu disponibilidad.</Text>
            <Boton label="Conectarme" onPress={alternarDisponible} size={13} weight={600} py={11} style={{ marginTop: 16, paddingHorizontal: 18 }} />
          </Tarjeta>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
