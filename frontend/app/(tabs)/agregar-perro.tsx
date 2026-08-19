import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createDog } from '../../api/dogs';

const GREEN        = '#4caf50';
const GREEN_LIGHT  = '#e8f5e9';
const BLUE         = '#3b5bdb';
const PINK         = '#e64980';
const WHITE        = '#ffffff';
const BG           = '#f5f5f5';
const TEXT_PRIMARY = '#1a1a1a';
const TEXT_SECONDARY = '#666666';
const TEXT_MUTED   = '#aaaaaa';
const BORDER       = '#e0e0e0';
const BORDER_FOCUS = '#4caf50';

type Genero = 'macho' | 'hembra' | null;

export default function AgregarPerroScreen() {
  const router = useRouter();

  const [nombre,   setNombre]   = useState('');
  const [raza,     setRaza]     = useState('');
  const [edad,     setEdad]     = useState('');
  const [peso,     setPeso]     = useState('');
  const [genero,   setGenero]   = useState<Genero>(null);
  const [notas,    setNotas]    = useState('');

  const [nombreFocus, setNombreFocus] = useState(false);
  const [razaFocus,   setRazaFocus]   = useState(false);
  const [edadFocus,   setEdadFocus]   = useState(false);
  const [pesoFocus,   setPesoFocus]   = useState(false);
  const [notasFocus,  setNotasFocus]  = useState(false);

  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState('');

  const handleGuardar = async () => {
    setError('');

    if (!nombre.trim()) {
      setError('El nombre del perro es obligatorio.');
      return;
    }

    // El back trunca la edad con parseInt (toIntOrNull) — evitamos mandar
    // decimales que se pierdan en silencio.
    const edadNum = edad.trim() ? parseInt(edad.trim(), 10) : undefined;
    if (edad.trim() && !Number.isFinite(edadNum)) {
      setError('La edad tiene que ser un número.');
      return;
    }

    // En es-AR se escribe "7,5" — Number('7,5') da NaN, así que convertimos
    // la coma a punto antes de parsear.
    const pesoNum = peso.trim() ? Number(peso.trim().replace(',', '.')) : undefined;
    if (peso.trim() && !Number.isFinite(pesoNum)) {
      setError('El peso tiene que ser un número.');
      return;
    }

    try {
      setGuardando(true);
      await createDog({
        name: nombre.trim(),
        breed: raza.trim() || undefined,
        age: edadNum,
        gender: genero ?? undefined,
        weight: pesoNum,
        extraNotes: notas.trim() || undefined,
      });
      router.back();
    } catch (err: any) {
      setError(err.message || 'No pudimos guardar la mascota. Intentá de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar Perro</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── FOTO ── */}
        <View style={styles.fotoSection}>
          {/* Contenedor relativo solo para foto + botón cámara */}
          <View style={styles.fotoWrap}>
            {/*
              TODO: reemplazar por:
              <Image source={{ uri: fotoUri }} style={styles.fotoCirculo} />
            */}
            <View style={styles.fotoCirculo}>
              <Text style={styles.fotoEmoji}>🐕</Text>
            </View>
            <TouchableOpacity style={styles.camaraBtn}>
              {/* TODO: <Image source={require('@/assets/icons/camara.png')} style={{width:16,height:16,tintColor:'#fff'}} /> */}
              <Text style={styles.camaraEmoji}>📷</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.fotoLabel}>Sube una foto de tu perro</Text>
        </View>

        {/* ── FORM ── */}
        <View style={styles.form}>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Nombre */}
          <Text style={styles.label}>Nombre del perro</Text>
          <View style={[styles.inputWrap, nombreFocus && styles.inputWrapFocus]}>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: Toby"
              placeholderTextColor={TEXT_MUTED}
              value={nombre}
              onChangeText={setNombre}
              onFocus={() => setNombreFocus(true)}
              onBlur={() => setNombreFocus(false)}
            />
          </View>

          {/* Raza */}
          <Text style={styles.label}>Raza</Text>
          <View style={[styles.inputWrap, razaFocus && styles.inputWrapFocus]}>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: Golden Retriever"
              placeholderTextColor={TEXT_MUTED}
              value={raza}
              onChangeText={setRaza}
              onFocus={() => setRazaFocus(true)}
              onBlur={() => setRazaFocus(false)}
            />
            {/* TODO: ícono lupa */}
            <Text style={styles.inputIconRight}>🔍</Text>
          </View>

          {/* Edad + Peso en fila */}
          <View style={styles.dosColumnas}>
            <View style={styles.columna}>
              <Text style={styles.label}>Edad</Text>
              <View style={[styles.inputWrap, edadFocus && styles.inputWrapFocus]}>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  placeholder="Ej: 3"
                  placeholderTextColor={TEXT_MUTED}
                  keyboardType="numeric"
                  value={edad}
                  onChangeText={setEdad}
                  onFocus={() => setEdadFocus(true)}
                  onBlur={() => setEdadFocus(false)}
                />
                <Text style={styles.unidad}>años</Text>
              </View>
            </View>

            <View style={styles.columna}>
              <Text style={styles.label}>Peso (kg)</Text>
              <View style={[styles.inputWrap, pesoFocus && styles.inputWrapFocus]}>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  placeholder="Ej: 15"
                  placeholderTextColor={TEXT_MUTED}
                  keyboardType="numeric"
                  value={peso}
                  onChangeText={setPeso}
                  onFocus={() => setPesoFocus(true)}
                  onBlur={() => setPesoFocus(false)}
                />
                <Text style={styles.unidad}>kg</Text>
              </View>
            </View>
          </View>

          {/* Género */}
          <Text style={styles.label}>Género</Text>
          <View style={styles.generoRow}>
            <TouchableOpacity
              style={[styles.generoBtn, genero === 'macho' && styles.generoBtnMacho]}
              onPress={() => setGenero('macho')}
            >
              {/* TODO: ícono símbolo macho */}
              <Text style={[styles.generoEmoji, genero === 'macho' && { color: WHITE }]}>♂</Text>
              <Text style={[styles.generoText, genero === 'macho' && styles.generoTextActive]}>
                Macho
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.generoBtn, genero === 'hembra' && styles.generoBtnHembra]}
              onPress={() => setGenero('hembra')}
            >
              {/* TODO: ícono símbolo hembra */}
              <Text style={[styles.generoEmoji, genero === 'hembra' && { color: WHITE }]}>♀</Text>
              <Text style={[styles.generoText, genero === 'hembra' && styles.generoTextActive]}>
                Hembra
              </Text>
            </TouchableOpacity>
          </View>

          {/* Notas */}
          <Text style={styles.label}>¿Alguna nota especial?</Text>
          <View style={[styles.inputWrap, styles.notasWrap, notasFocus && styles.inputWrapFocus]}>
            <TextInput
              style={[styles.textInput, styles.notasInput]}
              placeholder={'Ej: Es alérgico al pollo o le asustan los\ncamiones...'}
              placeholderTextColor={TEXT_MUTED}
              multiline
              value={notas}
              onChangeText={setNotas}
              onFocus={() => setNotasFocus(true)}
              onBlur={() => setNotasFocus(false)}
              textAlignVertical="top"
            />
          </View>

        </View>
      </ScrollView>

      {/* ── BOTÓN GUARDAR FIJO ── */}
      <View style={styles.ctaWrap}>
        <TouchableOpacity
          style={[styles.ctaBtn, (guardando || !nombre.trim()) && styles.ctaBtnDisabled]}
          onPress={handleGuardar}
          activeOpacity={0.85}
          disabled={guardando || !nombre.trim()}
        >
          {guardando
            ? <ActivityIndicator color={WHITE} />
            : <Text style={styles.ctaBtnText}>Guardar Mascota</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: BG },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: BG, paddingHorizontal: 16, paddingVertical: 14,
  },
  backArrow:   { fontSize: 22, color: TEXT_PRIMARY },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT_PRIMARY },

  scroll: { flexGrow: 1, paddingBottom: 24 },

  // Foto
  fotoSection: { alignItems: 'center', paddingTop: 16, paddingBottom: 16 },
  fotoWrap: {
    position: 'relative',
    width: 110, height: 110,
    marginBottom: 10,
  },
  fotoCirculo: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#c8e6c9',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: WHITE,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  fotoEmoji:   { fontSize: 48 },
  camaraBtn: {
    position: 'absolute',
    bottom: 2, right: 2,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: GREEN,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: WHITE,
  },
  camaraEmoji: { fontSize: 14 },
  fotoLabel:   { fontSize: 13, color: TEXT_SECONDARY },

  // Form
  form:  { paddingHorizontal: 20, gap: 0 },
  label: { fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8, marginTop: 16 },

  errorBanner: {
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    borderRadius: 10, padding: 12, marginTop: 16,
  },
  errorText: { fontSize: 13, color: '#ef4444', textAlign: 'center' },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: WHITE,
    borderWidth: 1.5, borderColor: BORDER, borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  inputWrapFocus: { borderColor: BORDER_FOCUS },
  textInput:      { flex: 1, fontSize: 14, color: TEXT_PRIMARY },
  inputIconRight: { fontSize: 16, color: TEXT_MUTED, marginLeft: 8 },
  unidad:         { fontSize: 13, color: TEXT_MUTED, marginLeft: 4 },

  // Dos columnas
  dosColumnas: { flexDirection: 'row', gap: 12 },
  columna:     { flex: 1 },

  // Género
  generoRow: { flexDirection: 'row', gap: 12 },
  generoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: WHITE,
    borderWidth: 1.5, borderColor: BORDER, borderRadius: 12,
    paddingVertical: 13,
  },
  generoBtnMacho:  { backgroundColor: BLUE,  borderColor: BLUE },
  generoBtnHembra: { backgroundColor: PINK,  borderColor: PINK },
  generoEmoji:     { fontSize: 16, color: TEXT_SECONDARY },
  generoText:      { fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY },
  generoTextActive:{ color: WHITE },

  // Notas
  notasWrap:  { alignItems: 'flex-start', paddingVertical: 12 },
  notasInput: { minHeight: 90, fontSize: 14 },

  // CTA
  ctaWrap: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: BG,
  },
  ctaBtn: {
    backgroundColor: GREEN, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: GREEN, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnText: { fontSize: 16, fontWeight: '700', color: WHITE },

  placeholderLabel: { fontSize: 9, color: TEXT_MUTED, textAlign: 'center', marginTop: 2 },
});