import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyDogs } from '../../api/dogs';
import type { Dog } from '../../api/types';

// ─── COLORES ────────────────────────────────────────────────
const GREEN         = '#4caf50';
const GREEN_LIGHT   = '#eaf7eb';
const GREEN_SOFT    = '#dcefdd';
const BG            = '#f5f5f5';
const WHITE         = '#ffffff';
const TEXT_DARK       = '#1a1a1a';
const TEXT_SECONDARY  = '#8a8f8a';
const BORDER          = '#e8ebe8';
const RED             = '#ef4444';
const LEAF_COLOR      = '#cfe9cf';
const LEAF_COLOR_DARK = '#a9d6ab';

function metaPerro(perro: Dog): string {
  const partes = [
    perro.breed ?? 'Raza no especificada',
    perro.age != null ? `${perro.age} ${perro.age === 1 ? 'año' : 'años'}` : null,
    perro.gender ? (perro.gender === 'macho' || perro.gender === 'male' ? 'Macho' : 'Hembra') : null,
  ].filter(Boolean);
  return partes.join(' • ');
}

export default function MisPerrosScreen() {
  const router = useRouter();

  // null = todavía no cargó (evita flashear el estado vacío antes de tiempo)
  const [perros, setPerros] = useState<Dog[] | null>(null);
  const [error, setError] = useState('');
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async (esRefresh = false) => {
    try {
      setError('');
      if (esRefresh) setRefrescando(true);
      const d = await getMyDogs();
      setPerros(d);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar tus perros.');
    } finally {
      if (esRefresh) setRefrescando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const cargando = perros === null;
  const tienePerros = (perros?.length ?? 0) > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={() => cargar(true)} colors={[GREEN]} />
        }
      >
        {/* ── CARD PRINCIPAL ── */}
        <View style={styles.card}>
          {/* Header */}
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={styles.title}>Mis perros</Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {cargando ? (
            <View style={styles.cargandoWrap}>
              <ActivityIndicator color={GREEN} />
            </View>
          ) : tienePerros ? (
            <View style={styles.list}>
              {perros!.map((perro) => (
                <View key={perro.id} style={styles.dogCard}>
                  <View style={styles.avatarWrap}>
                    <View style={styles.avatar}>
                      {perro.photo ? (
                        <Image source={{ uri: perro.photo }} style={styles.avatarImg} />
                      ) : (
                        <Text style={styles.avatarEmoji}>🐕</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.dogInfo}>
                    <View style={styles.dogNameRow}>
                      <Text style={styles.dogName}>{perro.name}</Text>
                      <Text style={styles.dogPaw}>🐶</Text>
                    </View>
                    <Text style={styles.dogMeta}>{metaPerro(perro)}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.vacioWrap}>
              <Text style={styles.vacioEmoji}>😴🐕</Text>
              <Text style={styles.vacioTitulo}>Aún no agregaste un perro</Text>
              <Text style={styles.vacioSubtitulo}>
                Agregá a tu compañero para empezar a planificar sus paseos.
              </Text>
            </View>
          )}

          {/* Agregar perro */}
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/agregar-perro')}
          >
            <View style={styles.addIconWrap}>
              <Ionicons name="add" size={18} color={GREEN} />
            </View>
            <Text style={styles.addBtnText}>Agregar perro</Text>
          </TouchableOpacity>
        </View>

        {/* ── DECORACIÓN INFERIOR ── */}
        <View style={styles.bottomWave} pointerEvents="none">
          <View style={styles.leafClusterLeft}>
            <Ionicons name="leaf" size={26} color={LEAF_COLOR_DARK} style={styles.leafBack} />
            <Ionicons name="leaf" size={18} color={LEAF_COLOR} style={styles.leafFront} />
          </View>
          <Ionicons name="leaf" size={16} color={LEAF_COLOR} style={styles.leafCenter} />
          <View style={styles.leafClusterRight}>
            <Ionicons name="leaf" size={26} color={LEAF_COLOR_DARK} style={styles.leafBack} />
            <Ionicons name="leaf" size={18} color={LEAF_COLOR} style={styles.leafFront} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },

  errorBanner: {
    marginTop: 4,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
  },
  errorText: { fontSize: 13, color: RED, textAlign: 'center' },
  cargandoWrap: { paddingVertical: 32, alignItems: 'center' },

  // Card principal
  card: {
    marginTop: 14,
    marginHorizontal: 14,
    backgroundColor: WHITE,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backBtn: { alignSelf: 'flex-start' },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_DARK,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },

  // Vacío
  vacioWrap: { alignItems: 'center', paddingVertical: 24 },
  vacioEmoji: { fontSize: 36, marginBottom: 12 },
  vacioTitulo: { fontSize: 15, fontWeight: '700', color: TEXT_DARK, textAlign: 'center' },
  vacioSubtitulo: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 12,
  },

  // Lista
  list: { gap: 12 },
  dogCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  avatarWrap: { position: 'relative', width: 56, height: 56, marginRight: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: 56, height: 56, borderRadius: 28 },
  avatarEmoji: { fontSize: 26 },

  dogInfo: { flex: 1 },
  dogNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dogName: { fontSize: 16, fontWeight: '700', color: TEXT_DARK },
  dogPaw: { fontSize: 14 },
  dogMeta: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 4 },

  // Agregar perro
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: GREEN,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 16,
  },
  addIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 15, fontWeight: '700', color: GREEN },

  // Decoración inferior
  bottomWave: {
    marginTop: 'auto',
    paddingTop: 60,
    height: 110,
    backgroundColor: GREEN_SOFT,
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
    opacity: 0.6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 32,
    paddingBottom: 18,
  },
  leafClusterLeft: { width: 50, height: 50 },
  leafClusterRight: { width: 50, height: 50, alignItems: 'flex-end' },
  leafBack: { position: 'absolute', bottom: 0, transform: [{ rotate: '-15deg' }] },
  leafFront: { position: 'absolute', bottom: 4, left: 14, transform: [{ rotate: '20deg' }] },
  leafCenter: { marginBottom: 30, transform: [{ rotate: '-10deg' }] },
});
