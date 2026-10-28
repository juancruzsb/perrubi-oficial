import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MapaEstatico } from '@/components/perrubi/mapa-estatico';
import { useAviso } from '@/components/perrubi/aviso';
import { Boton, Encabezado, Pantalla, Espacio } from '@/components/perrubi/piezas';
import { C, tarjeta, t } from '@/components/perrubi/estilos';
import { usePaseoPaseador } from '@/context/paseo-paseador';
import { PERRO_TOBY, RUTA_PASEO, posicionMarcador } from '@/lib/datos-paseador';

function PuntoPulso({ active, color }: { active: boolean; color: string }) {
  const o = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!active) { o.setValue(1); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(o, { toValue: 0.35, duration: 600, useNativeDriver: true }),
      Animated.timing(o, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [active, o]);
  return <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, opacity: o }} />;
}

function Metrica({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={[accent ? { backgroundColor: C.orangeSoft, borderRadius: 12 } : [tarjeta, { borderRadius: 12 }], { flex: 1, padding: 10, alignItems: 'center' }]}>
      <Text style={t(11, 600, accent ? C.orange : C.muted)}>{label}</Text>
      <Text style={t(18, 700)}>{value}</Text>
    </View>
  );
}

export default function PaseoActivo() {
  const router = useRouter();
  const aviso = useAviso();
  const { estadoPaseo, progreso, iniciarPaseo, pausarPaseo, reanudarPaseo, reiniciarPaseo } = usePaseoPaseador();
  const pos = posicionMarcador(progreso);
  const active = estadoPaseo === 'activo', paused = estadoPaseo === 'pausado', done = estadoPaseo === 'terminado';
  const status = active ? 'GPS activo · Paseando' : paused ? 'En pausa' : done ? 'Paseo completado' : 'Listo para iniciar';
  const finish = () => { aviso('Paseo finalizado', '$6.500 acreditados a tu cuenta.'); reiniciarPaseo(); router.replace('/paseador'); };

  return (
    <Pantalla pad={{}}>
      <Encabezado title="Paseo con Toby" fallback="/paseador" onBack={() => router.navigate('/paseador')} style={{ paddingVertical: 14, paddingHorizontal: 16, marginBottom: 0 }} />
      <View style={{ marginHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <PuntoPulso active={active} color={active || paused ? C.green : C.offline} />
        <Text style={t(12, 700)}>{status}</Text>
      </View>
      <MapaEstatico
        height={210} style={{ marginTop: 10, marginHorizontal: 16 }}
        route={RUTA_PASEO}
        pins={[{ kind: 'dog', x: pos.x, y: pos.y, uri: PERRO_TOBY, anchor: 'center' }]}
        gps="GPS · ±5 m"
      />
      <View style={{ marginTop: 14, marginHorizontal: 16, flexDirection: 'row', gap: 10 }}>
        <Metrica label="TIEMPO" value={`${Math.round(progreso * 30)} min`} />
        <Metrica label="DISTANCIA" value={`${(progreso * 2.3).toFixed(1)} km`} />
        <Metrica label="GANANCIA" value="$6.500" accent />
      </View>
      <View style={{ marginTop: 14, marginHorizontal: 16, height: 6, backgroundColor: C.track, borderRadius: 3 }}>
        <View style={{ height: '100%', width: `${Math.round(progreso * 100)}%`, backgroundColor: C.green, borderRadius: 3 }} />
      </View>
      <Espacio />
      <View style={{ padding: 16, flexDirection: 'row', gap: 10 }}>
        {estadoPaseo === 'espera' && <Boton label="Iniciar paseo" icon="solar:play-bold" style={{ flex: 1 }} onPress={iniciarPaseo} />}
        {active && (
          <>
            <Boton label="Pausar" variant="outline" icon="solar:pause-bold" style={{ flex: 1 }} onPress={pausarPaseo} />
            <Boton label="Finalizar" icon="solar:stop-bold" iconColor={C.red} style={{ flex: 1 }} onPress={finish} />
          </>
        )}
        {paused && (
          <>
            <Boton label="Reanudar" icon="solar:play-bold" style={{ flex: 1 }} onPress={reanudarPaseo} />
            <Boton label="Finalizar" variant="danger" icon="solar:stop-bold" style={{ flex: 1 }} onPress={finish} />
          </>
        )}
        {done && <Boton label="Entregar y cobrar" style={{ flex: 1 }} onPress={finish} />}
      </View>
    </Pantalla>
  );
}
