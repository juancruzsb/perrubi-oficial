import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ─── COLORES ────────────────────────────────────────────────
const GREEN         = '#4caf50';
const GREEN_LIGHT   = '#eaf7eb';
const GREEN_SOFT    = '#dcefdd';
const BG            = '#f5f5f5';
const WHITE         = '#ffffff';
const TEXT_DARK       = '#1a1a1a';
const TEXT_SECONDARY  = '#8a8f8a';
const BORDER          = '#e8ebe8';
const CHEVRON_COLOR   = '#c2c7c2';
const LEAF_COLOR      = '#cfe9cf';
const LEAF_COLOR_DARK = '#a9d6ab';

type Genero = 'macho' | 'hembra';

type Perro = {
  id: string;
  nombre: string;
  raza: string;
  edad: number;
  genero: Genero;
  foto: string;
  verificado: boolean;
};

const perros: Perro[] = [
  {
    id: '1',
    nombre: 'Toby',
    raza: 'Labrador',
    edad: 3,
    genero: 'macho',
    foto: 'https://images.dog.ceo/breeds/labrador/n02099712_1234.jpg',
    verificado: true,
  },
  {
    id: '2',
    nombre: 'Luna',
    raza: 'Beagle',
    edad: 2,
    genero: 'hembra',
    foto: 'https://images.dog.ceo/breeds/beagle/n02088364_1234.jpg',
    verificado: true,
  },
];

export default function MisPerrosScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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

          {/* Lista de perros */}
          <View style={styles.list}>
            {perros.map((perro) => (
              <TouchableOpacity key={perro.id} style={styles.dogCard} activeOpacity={0.7}>
                <View style={styles.avatarWrap}>
                  <View style={styles.avatar}>
                    {/* TODO: <Image source={{ uri: perro.foto }} style={styles.avatarImg} /> */}
                    <Text style={styles.avatarEmoji}>🐕</Text>
                  </View>
                  {perro.verificado && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color={WHITE} />
                    </View>
                  )}
                </View>

                <View style={styles.dogInfo}>
                  <View style={styles.dogNameRow}>
                    <Text style={styles.dogName}>{perro.nombre}</Text>
                    <Text style={styles.dogPaw}>🐶</Text>
                  </View>
                  <Text style={styles.dogMeta}>
                    {perro.raza} • {perro.edad} años • {perro.genero === 'macho' ? 'Macho' : 'Hembra'}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color={CHEVRON_COLOR} />
              </TouchableOpacity>
            ))}
          </View>

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
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: WHITE,
  },

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
