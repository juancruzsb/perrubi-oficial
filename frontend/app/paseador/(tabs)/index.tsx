import React, { useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, StatusBar,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router/react-navigation';
import { getAvailableWalks, acceptWalk } from '../../../api/walker';
import { dogsOf } from '../../../api/walks';
import type { Walk } from '../../../api/types';

const ORANGE       = '#f5a623';
const BG           = '#f5f5f5';
const WHITE        = '#ffffff';
const TEXT_PRIMARY = '#1a1a1a';
const TEXT_MUTED   = '#888888';
const BORDER       = '#e0e0e0';
const RED          = '#ef4444';

export default function DisponiblesScreen() {
  const [walks, setWalks] = useState<Walk[] | null>(null);
  const [error, setError] = useState('');
  const [refrescando, setRefrescando] = useState(false);
  const [aceptandoId, setAceptandoId] = useState<number | null>(null);

  const cargar = useCallback(async (esRefresh = false) => {
    try {
      setError('');
      if (esRefresh) setRefrescando(true);
      const data = await getAvailableWalks();
      setWalks(data);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar los paseos disponibles.');
    } finally {
      if (esRefresh) setRefrescando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const handleAceptar = async (walkId: number) => {
    try {
      setAceptandoId(walkId);
      await acceptWalk(walkId);
      Alert.alert('¡Listo!', 'Aceptaste el paseo. Lo vas a ver en "Mis paseos".');
      await cargar();
    } catch (err: any) {
      Alert.alert('No se pudo aceptar', err.message || 'Puede que otro paseador ya lo haya tomado.');
      await cargar();
    } finally {
      setAceptandoId(null);
    }
  };

  const cargando = walks === null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Paseos disponibles</Text>
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
          ListEmptyComponent={
            <Text style={styles.empty}>No hay paseos disponibles por ahora. Deslizá para actualizar.</Text>
          }
          renderItem={({ item }) => {
            const perros = dogsOf(item).map((d) => d.name).join(', ') || 'Sin perros cargados';
            const lugar = item.address?.street ?? item.address?.label ?? 'Sin dirección';
            const duracion = item.duration != null ? `${item.duration} min` : 'Duración sin definir';
            const aceptando = aceptandoId === item.id;
            return (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{perros}</Text>
                <Text style={styles.cardSub}>{duracion} · {lugar}</Text>
                {item.notes ? <Text style={styles.cardNotes}>{item.notes}</Text> : null}
                <TouchableOpacity
                  style={[styles.btn, aceptando && styles.btnDisabled]}
                  onPress={() => handleAceptar(item.id)}
                  disabled={aceptando}
                  activeOpacity={0.85}
                >
                  {aceptando
                    ? <ActivityIndicator color={WHITE} />
                    : <Text style={styles.btnText}>Aceptar paseo</Text>}
                </TouchableOpacity>
              </View>
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
  cardTitle: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY },
  cardSub:   { fontSize: 13, color: TEXT_MUTED, marginTop: 4 },
  cardNotes: { fontSize: 13, color: TEXT_PRIMARY, marginTop: 8, fontStyle: 'italic' },

  btn: {
    backgroundColor: ORANGE, borderRadius: 12, paddingVertical: 12,
    alignItems: 'center', justifyContent: 'center', marginTop: 14,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { fontSize: 14, fontWeight: '700', color: WHITE },
});
