import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router/react-navigation';
import { Ionicons } from '@expo/vector-icons';
import { getMyAddresses, createAddress, updateAddress, deleteAddress } from '../../api/addresses';
import type { Address } from '../../api/types';

// ─── COLORES ────────────────────────────────────────────────
const GREEN       = '#4caf50';
const GREEN_LIGHT = '#e8f5e9';
const BG          = '#f5f5f5';
const WHITE       = '#ffffff';
const TEXT_PRIMARY   = '#1a1a1a';
const TEXT_SECONDARY = '#666666';
const TEXT_MUTED     = '#aaaaaa';
const BORDER         = '#e0e0e0';
const CHEVRON_COLOR  = '#c2c7c2';

// Las tres direcciones "fijas" del mockup — siempre se muestran, aunque
// todavía no tengan una fila en la tabla Address (se crean recién al guardar).
const FIJAS: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Casa',            icon: 'home-outline' },
  { label: 'Trabajo',         icon: 'briefcase-outline' },
  { label: 'Parque favorito', icon: 'leaf-outline' },
];

function formatearDireccion(a: Address): string {
  return [a.street, a.number].filter(Boolean).join(' ') + (a.city ? `, ${a.city}` : '');
}

type Editando = { label: string; id: number | null; texto: string };

export default function DireccionesScreen() {
  const router = useRouter();

  const [direcciones, setDirecciones] = useState<Address[] | null>(null);
  const [error, setError] = useState('');

  const [editando, setEditando] = useState<Editando | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [modalError, setModalError] = useState('');

  const cargar = useCallback(() => {
    getMyAddresses()
      .then(setDirecciones)
      .catch((err: any) => setError(err.message || 'No pudimos cargar tus direcciones.'));
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const buscarPorLabel = (label: string) => direcciones?.find((a) => a.label === label) ?? null;

  const extras = direcciones?.filter((a) => !FIJAS.some((f) => f.label === a.label)) ?? [];

  const abrirEdicion = (label: string) => {
    const existente = buscarPorLabel(label);
    setModalError('');
    setEditando({
      label,
      id: existente?.id ?? null,
      texto: existente ? formatearDireccion(existente) : '',
    });
  };

  const guardarEdicion = async () => {
    if (!editando) return;
    const texto = editando.texto.trim();
    if (!texto) {
      setModalError('Escribí una dirección.');
      return;
    }

    try {
      setGuardando(true);
      setModalError('');
      if (editando.id) {
        await updateAddress(editando.id, { label: editando.label, street: texto });
      } else {
        await createAddress({ label: editando.label, street: texto });
      }
      setEditando(null);
      cargar();
    } catch (err: any) {
      setModalError(
        err.message === 'Dirección no encontrada'
          ? 'No pudimos encontrar esa dirección. Probá agregando calle, altura y ciudad.'
          : err.message || 'No pudimos guardar la dirección.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const eliminarExtra = async (id: number) => {
    try {
      await deleteAddress(id);
      cargar();
    } catch (err: any) {
      setError(err.message || 'No pudimos eliminar la dirección.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis direcciones</Text>
        <View style={styles.backBtn}>
          <Ionicons name="paw-outline" size={20} color={GREEN_LIGHT} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {direcciones === null ? (
          <ActivityIndicator color={GREEN} style={{ marginTop: 24 }} />
        ) : (
          <View style={styles.list}>
            {FIJAS.map((f) => {
              const existente = buscarPorLabel(f.label);
              return (
                <TouchableOpacity
                  key={f.label}
                  style={styles.row}
                  activeOpacity={0.7}
                  onPress={() => abrirEdicion(f.label)}
                >
                  <View style={styles.iconWrap}>
                    <Ionicons name={f.icon} size={20} color={GREEN} />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowLabel}>{f.label}</Text>
                    <Text style={styles.rowValue} numberOfLines={1}>
                      {existente ? formatearDireccion(existente) : 'Agregar dirección'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={CHEVRON_COLOR} />
                </TouchableOpacity>
              );
            })}

            {extras.map((a) => (
              <View key={a.id} style={styles.row}>
                <View style={styles.iconWrap}>
                  <Ionicons name="location-outline" size={20} color={GREEN} />
                </View>
                <TouchableOpacity
                  style={styles.rowInfo}
                  activeOpacity={0.7}
                  onPress={() => abrirEdicion(a.label || 'Dirección')}
                >
                  <Text style={styles.rowLabel}>{a.label || 'Dirección'}</Text>
                  <Text style={styles.rowValue} numberOfLines={1}>
                    {formatearDireccion(a)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() => eliminarExtra(a.id)}
                >
                  <Ionicons name="trash-outline" size={18} color={TEXT_MUTED} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.agregarBtn}
          activeOpacity={0.7}
          onPress={() =>
            setEditando({ label: '', id: null, texto: '' })
          }
        >
          <Ionicons name="add-circle-outline" size={20} color={GREEN} />
          <Text style={styles.agregarBtnText}>Agregar dirección</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── MODAL EDICIÓN ── */}
      <Modal
        visible={editando !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditando(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editando?.id ? `Editar ${editando.label}` : editando?.label ? `Agregar ${editando.label}` : 'Nueva dirección'}
            </Text>

            {modalError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{modalError}</Text>
              </View>
            ) : null}

            {!editando?.label && (
              <>
                <Text style={styles.modalLabel}>Nombre</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Casa de mis padres"
                    placeholderTextColor={TEXT_MUTED}
                    value={editando?.label ?? ''}
                    onChangeText={(v) => setEditando((prev) => (prev ? { ...prev, label: v } : prev))}
                  />
                </View>
              </>
            )}

            <Text style={styles.modalLabel}>Dirección</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.textInput}
                placeholder="Calle, altura, ciudad"
                placeholderTextColor={TEXT_MUTED}
                value={editando?.texto ?? ''}
                onChangeText={(v) => setEditando((prev) => (prev ? { ...prev, texto: v } : prev))}
                autoFocus
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setEditando(null)}
                disabled={guardando}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnGuardar]}
                onPress={guardarEdicion}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator color={WHITE} />
                ) : (
                  <Text style={styles.modalBtnGuardarText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingBottom: 24 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: WHITE, paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 0.5, borderBottomColor: BORDER,
  },
  backBtn:     { width: 32, alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: TEXT_PRIMARY },

  errorBanner: {
    marginHorizontal: 16, marginTop: 14, padding: 12,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10,
  },
  errorText: { fontSize: 13, color: '#ef4444', textAlign: 'center' },

  // Lista
  list: { marginHorizontal: 16, marginTop: 16, gap: 12 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: GREEN_LIGHT, alignItems: 'center', justifyContent: 'center',
  },
  rowInfo:  { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY },
  rowValue: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 2 },

  // Agregar dirección
  agregarBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 16,
    borderWidth: 1.5, borderColor: GREEN, borderStyle: 'dashed', borderRadius: 16,
    paddingVertical: 16,
  },
  agregarBtnText: { fontSize: 15, fontWeight: '700', color: GREEN },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  modalCard: {
    width: '100%', maxWidth: 380,
    backgroundColor: WHITE, borderRadius: 18, padding: 20,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: TEXT_PRIMARY, marginBottom: 14 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 6, marginTop: 6 },
  inputWrap: {
    borderWidth: 1.5, borderColor: BORDER, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    backgroundColor: BG,
  },
  textInput: { fontSize: 14, color: TEXT_PRIMARY },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center',
  },
  modalBtnCancel:     { backgroundColor: BG, borderWidth: 1.5, borderColor: BORDER },
  modalBtnCancelText: { fontSize: 14, fontWeight: '700', color: TEXT_SECONDARY },
  modalBtnGuardar:     { backgroundColor: GREEN },
  modalBtnGuardarText: { fontSize: 14, fontWeight: '700', color: WHITE },
});
