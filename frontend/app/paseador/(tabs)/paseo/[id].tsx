import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router/react-navigation';
import { Ionicons } from '@expo/vector-icons';
import { getWalkAsWalker, changeWalkStatusAsWalker } from '../../../../api/walker';
import { dogsOf } from '../../../../api/walks';
import { useUbicacionCompartida } from '../../../../context/ubicacion-paseador';
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
  const idValido = !!id && !Number.isNaN(walkId);
  const ubicacion = useUbicacionCompartida();

  const [walkCargado, setWalkCargado] = useState<Walk | null>(null);
  const [error, setError] = useState('');
  const [actualizando, setActualizando] = useState(false);
  const [confirmando, setConfirmando] = useState<WalkStatus | null>(null);

  // Esta pantalla de Tabs no se desmonta entre un paseo y otro: si el que
  // está en estado es de otro id, se ignora hasta que llegue el nuevo (si no,
  // se verían —y se podrían cambiar— los datos del paseo anterior).
  const walk = walkCargado && walkCargado.id === walkId ? walkCargado : null;

  const cargar = useCallback(async () => {
    if (!idValido) {
      setError('No encontramos el paseo.');
      return;
    }
    try {
      setError('');
      const data = await getWalkAsWalker(walkId);
      setWalkCargado(data);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar el paseo.');
    }
  }, [walkId, idValido]);

  useFocusEffect(
    useCallback(() => {
      setConfirmando(null);
      cargar();
    }, [cargar])
  );

  useEffect(() => {
    if (!confirmando) return;
    const t = setTimeout(() => setConfirmando(null), 4000);
    return () => clearTimeout(t);
  }, [confirmando]);

  // Iniciar/finalizar no tienen vuelta atrás: el primer toque pide confirmar
  // (inline, no Alert: Alert.alert no hace nada en web) y el segundo ejecuta.
  const pedirCambio = (nuevoEstado: WalkStatus) => {
    if (confirmando === nuevoEstado) {
      setConfirmando(null);
      avanzarEstado(nuevoEstado);
    } else {
      setConfirmando(nuevoEstado);
    }
  };

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
      <SafeAreaView edges={['top']} style={styles.safe}>
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
    <SafeAreaView edges={['top']} style={styles.safe}>
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

        {ubicacion.walkId === walk.id && ubicacion.estado === 'compartiendo' ? (
          <View style={styles.ubicacionOk}>
            <Ionicons name="navigate" size={14} color={GREEN} />
            <Text style={styles.ubicacionOkText}>Compartiendo tu ubicación con el dueño</Text>
          </View>
        ) : null}
        {ubicacion.walkId === walk.id && ubicacion.estado === 'sin-permiso' ? (
          <Text style={styles.errorText}>
            Sin permiso de ubicación: el dueño no puede verte en el mapa. Habilitalo en los ajustes del dispositivo.
          </Text>
        ) : null}

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
            onPress={() => pedirCambio('in_progress')}
            disabled={actualizando}
          >
            {actualizando ? <ActivityIndicator color={WHITE} /> : <Text style={styles.btnText}>{confirmando === 'in_progress' ? '¿Confirmar? Tocá de nuevo' : 'Iniciar paseo'}</Text>}
          </TouchableOpacity>
        )}

        {estado === 'in_progress' && (
          <TouchableOpacity
            style={[styles.btn, styles.btnGreen, actualizando && styles.btnDisabled]}
            onPress={() => pedirCambio('finished')}
            disabled={actualizando}
          >
            {actualizando ? <ActivityIndicator color={WHITE} /> : <Text style={styles.btnText}>{confirmando === 'finished' ? '¿Confirmar? Tocá de nuevo' : 'Finalizar paseo'}</Text>}
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

  ubicacionOk: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 },
  ubicacionOkText: { fontSize: 13, color: GREEN, fontWeight: '600' },

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
