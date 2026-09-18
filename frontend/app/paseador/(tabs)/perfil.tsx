import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionPaseador } from '../../../context/session-paseador';

const ORANGE       = '#f5a623';
const ORANGE_LIGHT = '#fdf1e0';
const RED          = '#ef4444';
const BG           = '#f5f5f5';
const WHITE        = '#ffffff';
const TEXT_PRIMARY = '#1a1a1a';
const TEXT_MUTED   = '#888888';
const BORDER       = '#e0e0e0';

export default function PerfilPaseadorScreen() {
  const router = useRouter();
  const { walker, salir } = useSessionPaseador();

  const nombre = [walker?.firstName, walker?.lastName].filter(Boolean).join(' ') || 'Paseador';
  const rating = walker?.averageRating ? Number(walker.averageRating).toFixed(1) : 'Sin calificaciones';

  const handleLogout = async () => {
    await salir();
    router.replace('/paseador/login-paseador');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={ORANGE} />
          </View>
          <Text style={styles.nombre}>{nombre}</Text>
          <Text style={styles.email}>{walker?.email}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <View style={styles.statValueRow}>
              <Ionicons name="star" size={14} color={ORANGE} />
              <Text style={styles.statValue}>{rating}</Text>
            </View>
            <Text style={styles.statLabel}>Calificación</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{walker?.reviewCount ?? 0}</Text>
            <Text style={styles.statLabel}>Reseñas</Text>
          </View>
        </View>

        {walker?.description ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sobre mí</Text>
            <Text style={styles.cardText}>{walker.description}</Text>
          </View>
        ) : null}

        {walker?.phone ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Teléfono</Text>
            <Text style={styles.cardText}>{walker.phone}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.85} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { padding: 20, paddingBottom: 40 },

  header: { alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: ORANGE_LIGHT,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  nombre: { fontSize: 19, fontWeight: '700', color: TEXT_PRIMARY },
  email:  { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: {
    flex: 1, backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', gap: 4,
  },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 16, fontWeight: '700', color: TEXT_PRIMARY },
  statLabel: { fontSize: 11, color: TEXT_MUTED },

  card: {
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER, borderRadius: 14,
    padding: 16, marginBottom: 12,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: TEXT_MUTED, marginBottom: 6 },
  cardText:  { fontSize: 14, color: TEXT_PRIMARY, lineHeight: 20 },

  logoutBtn: {
    marginTop: 12, backgroundColor: WHITE, borderWidth: 1.5, borderColor: RED,
    borderRadius: 14, paddingVertical: 15, alignItems: 'center',
  },
  logoutBtnText: { fontSize: 15, fontWeight: '700', color: RED },
});
