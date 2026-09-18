import React, { useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router/react-navigation';
import { Ionicons } from '@expo/vector-icons';
import { getWalkAsWalker, changeWalkStatusAsWalker } from '../../../../api/walker';
import { dogsOf } from '../../../../api/walks';
import type { Walk, WalkStatus } from '../../../../api/types';

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

export default function DetallePaseoPaseadorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const walkId = Number(id);

  const [walk, setWalk] = useState<Walk | null>(null);
  const [error, setError] = useState('');
  const [actualizando, setActualizando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setError('');
      const data = await getWalkAsWalker(walkId);
      setWalk(data);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar el paseo.');
    }
  }, [walkId]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const avanzarEstado = async (nuevoEstado: WalkStatus) => {
    try {
      setActualizando(true);
      await changeWalkStatusAsWalker(walkId, nuevoEstado);
      await cargar();
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar el estado del paseo.');
    } finally {
      setActualizando(false);
    }
  };

  if (!walk) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color={TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>
        <View style={styles.cargandoWrap}>
          {error ? <Text style={styles.errorText}>{error}</Text> : <ActivityIndicator color={ORANGE} />}
        </View>
      </SafeAreaView>
    );
  }

  const perros = dogsOf(walk);
  const estado = walk.status ?? 'searching';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paseo #{walk.id}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.estadoBadge}>{ESTADO_LABEL[estado] ?? estado}</Text>

          <Text style={styles.sectionLabel}>Perros</Text>
          <Text style={styles.sectionValue}>
            {perros.map((d) => d.name).join(', ') || 'Sin perros cargados'}
          </Text>

          <Text style={styles.sectionLabel}>Dirección</Text>
          <Text style={styles.sectionValue}>
            {walk.address?.street ?? walk.address?.label ?? 'Sin dirección'}
          </Text>

          <Text style={styles.sectionLabel}>Duración</Text>
          <Text style={styles.sectionValue}>
            {walk.duration != null ? `${walk.duration} min` : 'Sin definir'}
          </Text>

          {walk.notes ? (
            <>
              <Text style={styles.sectionLabel}>Notas</Text>
              <Text style={styles.sectionValue}>{walk.notes}</Text>
            </>
          ) : null}
        </View>

        {estado === 'accepted' && (
          <TouchableOpacity
            style={[styles.btn, actualizando && styles.btnDisabled]}
            onPress={() => avanzarEstado('in_progress')}
            disabled={actualizando}
          >
            {actualizando ? <ActivityIndicator color={WHITE} /> : <Text style={styles.btnText}>Iniciar paseo</Text>}
          </TouchableOpacity>
        )}

        {estado === 'in_progress' && (
          <TouchableOpacity
            style={[styles.btn, styles.btnGreen, actualizando && styles.btnDisabled]}
            onPress={() => avanzarEstado('finished')}
            disabled={actualizando}
          >
            {actualizando ? <ActivityIndicator color={WHITE} /> : <Text style={styles.btnText}>Finalizar paseo</Text>}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: WHITE, borderBottomWidth: 0.5, borderBottomColor: BORDER,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: TEXT_PRIMARY },

  cargandoWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, paddingBottom: 40 },
  errorText: { fontSize: 13, color: RED, textAlign: 'center', marginBottom: 12 },

  card: { backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER, borderRadius: 14, padding: 18 },
  estadoBadge: { fontSize: 13, fontWeight: '700', color: ORANGE, marginBottom: 14 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: TEXT_MUTED, marginTop: 12 },
  sectionValue: { fontSize: 15, color: TEXT_PRIMARY, marginTop: 4 },

  btn: {
    backgroundColor: ORANGE, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center', marginTop: 20,
  },
  btnGreen: { backgroundColor: GREEN },
  btnDisabled: { opacity: 0.7 },
  btnText: { fontSize: 15, fontWeight: '700', color: WHITE },
});
