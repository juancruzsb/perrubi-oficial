import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ─── COLORES ────────────────────────────────────────────────
const GREEN         = '#4caf50';
const GREEN_DARK     = '#1b5e20';
const GREEN_LIGHT    = '#eaf7eb';
const GREEN_BORDER   = '#e3ede3';
const BORDER         = '#e6e9e6';
const BG             = '#fbfdfb';
const WHITE          = '#ffffff';
const TEXT_DARK       = '#1c1c1c';
const TEXT_SECONDARY  = '#6b6b6b';
const TEXT_PLACEHOLDER = '#a7ada7';
const LEAF_COLOR      = '#cfe9cf';
const LEAF_COLOR_DARK  = '#a9d6ab';
const PAW_COLOR        = '#d8ecd8';

export default function CalificacionScreen() {
  const router = useRouter();

  const [paseoRating, setPaseoRating] = useState(5);
  const [mascotaRating, setMascotaRating] = useState(5);
  const [comentario, setComentario] = useState('');

  const enviarCalificacion = () => {
    router.back();
  };

  const renderStars = (
    rating: number,
    setRating: (value: number) => void
  ) => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity key={i} onPress={() => setRating(i)} activeOpacity={0.7}>
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={30}
            color={GREEN}
            style={styles.starIcon}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <View style={styles.container}>
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calificación</Text>
          <View style={styles.backBtn} />
        </View>

        {/* ── CARD ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Califica a Juan</Text>

          <Text style={styles.question}>¿Cómo fue el paseo?</Text>
          {renderStars(paseoRating, setPaseoRating)}

          <Text style={[styles.question, styles.questionSpacing]}>
            ¿Qué tal se portó Toby?
          </Text>
          {renderStars(mascotaRating, setMascotaRating)}

          <Text style={styles.commentLabel}>Comentario (opcional)</Text>
          <View style={styles.commentBox}>
            <TextInput
              style={styles.commentInput}
              placeholder="Cuéntanos más sobre tu experiencia..."
              placeholderTextColor={TEXT_PLACEHOLDER}
              multiline
              value={comentario}
              onChangeText={setComentario}
              textAlignVertical="top"
            />
            <Ionicons name="paw" size={26} color={PAW_COLOR} style={styles.commentPaw} />
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={enviarCalificacion}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>Enviar calificación</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        {/* ── DECORACIÓN INFERIOR ── */}
        <View style={styles.bottomWave} pointerEvents="none">
          <View style={styles.leafClusterLeft}>
            <Ionicons name="leaf" size={26} color={LEAF_COLOR_DARK} style={styles.leafBack} />
            <Ionicons name="leaf" size={18} color={LEAF_COLOR} style={styles.leafFront} />
          </View>
          <Ionicons name="paw" size={22} color={LEAF_COLOR} style={styles.pawDecor} />
          <View style={styles.leafClusterRight}>
            <Ionicons name="leaf" size={26} color={LEAF_COLOR_DARK} style={styles.leafBack} />
            <Ionicons name="leaf" size={18} color={LEAF_COLOR} style={styles.leafFront} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },

  // Header
  header: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 22, height: 22, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },

  // Card
  card: {
    marginTop: 24,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 22,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_DARK,
    textAlign: 'center',
    marginBottom: 20,
  },
  question: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 12,
  },
  questionSpacing: { marginTop: 20 },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starIcon: { marginHorizontal: 4 },

  commentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_DARK,
    marginTop: 24,
    marginBottom: 8,
  },
  commentBox: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    minHeight: 90,
    padding: 12,
    justifyContent: 'space-between',
  },
  commentInput: {
    fontSize: 14,
    color: TEXT_DARK,
    minHeight: 44,
  },
  commentPaw: {
    alignSelf: 'flex-end',
    opacity: 0.9,
  },

  submitBtn: {
    marginTop: 24,
    backgroundColor: GREEN,
    borderRadius: 28,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: GREEN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: WHITE },

  // Decoración inferior
  bottomWave: {
    position: 'absolute',
    left: -20,
    right: -20,
    bottom: Platform.OS === 'ios' ? -10 : -20,
    height: 130,
    backgroundColor: GREEN_LIGHT,
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
    opacity: 0.6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  leafClusterLeft: { width: 50, height: 50 },
  leafClusterRight: { width: 50, height: 50, alignItems: 'flex-end' },
  leafBack: { position: 'absolute', bottom: 0, transform: [{ rotate: '-15deg' }] },
  leafFront: { position: 'absolute', bottom: 4, left: 14, transform: [{ rotate: '20deg' }] },
  pawDecor: { marginBottom: 30, transform: [{ rotate: '-10deg' }] },
});
