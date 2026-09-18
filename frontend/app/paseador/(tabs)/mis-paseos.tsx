import React, { useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, StatusBar,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router/react-navigation';
import { getMyWalksAsWalker, changeWalkStatusAsWalker } from '../../../api/walker';
import { dogsOf } from '../../../api/walks';
import type { Walk, WalkStatus } from '../../../api/types';

const GREEN        = '#4caf50';
const ORANGE       = '#f5a623';
const RED          = '#ef4444';
const BG           = '#f5f5f5';
const WHITE        = '#ffffff';
const TEXT_PRIMARY = '#1a1a1a';
const TEXT_MUTED   = '#888888';
const BORDER       = '#e0e0e0';

const ESTADO_LABEL: Record<string, string> = {
  searching: 'Buscando paseador',
  accepted: 'Aceptado',
  in_progress: 'En curso',
  finished: 'Finalizado',
  canceled: 'Cancelado',
};

const ESTADO_COLOR: Record<string, string> = {
  accepted: ORANGE,
  in_progress: GREEN,
  finished: TEXT_MUTED,
  canceled: RED,
};

export default function MisPaseosPaseadorScreen() {
  const router = useRouter();
  const [walks, setWalks] = useState<Walk[] | null>(null);
  const [error, setError] = useState('');
  const [refrescando, setRefrescando] = useState(false);
  const [actualizandoId, setActualizandoId] = useState<number | null>(null);

  const cargar = useCallback(async (esRefresh = false) => {
    try {
      setError('');
      if (esRefresh) setRefrescando(true);
      const data = await getMyWalksAsWalker();
      setWalks(data);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar tus paseos.');
    } finally {
      if (esRefresh) setRefrescando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const avanzarEstado = async (walkId: number, nuevoEstado: WalkStatus) => {
    try {
      setActualizandoId(walkId);
      await changeWalkStatusAsWalker(walkId, nuevoEstado);
      await cargar();
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar el estado del paseo.');
    } finally {
      setActualizandoId(null);
    }
  };

  const cargando = walks === null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis paseos</Text>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {cargando ? (
        <View style={styles.cargandoWrap}>
          <ActivityIndicator color={ORANGE} />
        </View>
      ) : (
        <FlatList
          data={walks}
          keyExtractor={(w) => String(w.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={() => cargar(true)} colors={[ORANGE]} />
          }
          ListEmptyComponent={<Text style={styles.empty}>Todavía no aceptaste ningún paseo.</Text>}
          renderItem={({ item }) => {
            const perros = dogsOf(item).map((d) => d.name).join(', ') || 'Sin perros cargados';
            const estado = item.status ?? 'searching';
            const actualizando = actualizandoId === item.id;
            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/paseador/paseo/[id]', params: { id: String(item.id) } })}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{perros}</Text>
                  <Text style={[styles.estado, { color: ESTADO_COLOR[estado] ?? TEXT_MUTED }]}>
                    {ESTADO_LABEL[estado] ?? estado}
                  </Text>
                </View>
                <Text style={styles.cardSub}>
                  {item.address?.street ?? item.address?.label ?? 'Sin dirección'}
                </Text>

                {estado === 'accepted' && (
                  <TouchableOpacity
                    style={[styles.btn, actualizando && styles.btnDisabled]}
                    onPress={(e) => { e.stopPropagation(); avanzarEstado(item.id, 'in_progress'); }}
                    disabled={actualizando}
                  >
                    {actualizando
                      ? <ActivityIndicator color={WHITE} />
                      : <Text style={styles.btnText}>Iniciar paseo</Text>}
                  </TouchableOpacity>
                )}

                {estado === 'in_progress' && (
                  <TouchableOpacity
                    style={[styles.btn, styles.btnGreen, actualizando && styles.btnDisabled]}
                    onPress={(e) => { e.stopPropagation(); avanzarEstado(item.id, 'finished'); }}
                    disabled={actualizando}
                  >
                    {actualizando
                      ? <ActivityIndicator color={WHITE} />
                      : <Text style={styles.btnText}>Finalizar paseo</Text>}
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: WHITE, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  headerTitle: { fontSize: 20, fontWeight: '700', color: TEXT_PRIMARY },

  errorBanner: { margin: 16, padding: 12, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10 },
  errorText: { fontSize: 13, color: RED, textAlign: 'center' },

  cargandoWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, gap: 12, flexGrow: 1 },
  empty: { textAlign: 'center', color: TEXT_MUTED, marginTop: 40, fontSize: 14 },

  card: {
    backgroundColor: WHITE, borderRadius: 14, borderWidth: 1, borderColor: BORDER,
    padding: 16, marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY, flex: 1, marginRight: 8 },
  estado: { fontSize: 12, fontWeight: '700' },
  cardSub: { fontSize: 13, color: TEXT_MUTED, marginTop: 4 },

  btn: {
    backgroundColor: ORANGE, borderRadius: 12, paddingVertical: 12,
    alignItems: 'center', justifyContent: 'center', marginTop: 14,
  },
  btnGreen: { backgroundColor: GREEN },
  btnDisabled: { opacity: 0.7 },
  btnText: { fontSize: 14, fontWeight: '700', color: WHITE },
});
