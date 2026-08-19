import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from "expo-router/react-navigation";
import { getMyDogs } from '../../api/dogs';
import { createAddress } from '../../api/addresses';
import { createWalk } from '../../api/walks';
import type { Dog } from '../../api/types';

// ─── COLORES ────────────────────────────────────────────────
const GREEN       = '#4caf50';
const GREEN_LIGHT = '#e8f5e9';
const GREEN_DARK  = '#2e7d32';
const BG          = '#f5f5f5';
const WHITE       = '#ffffff';
const TEXT_PRIMARY   = '#1a1a1a';
const TEXT_SECONDARY = '#666666';
const TEXT_MUTED     = '#aaaaaa';
const BORDER         = '#e0e0e0';
const BORDER_FOCUS   = '#4caf50';
 
const DURACIONES = ['30 min', '45 min', '60 min', '90 min'];
 
export default function CrearPaseoScreen() {
  const router = useRouter();
  const { tipo } = useLocalSearchParams<{ tipo?: string }>();

  const [duracion, setDuracion]       = useState('');
  const [ubicacion, setUbicacion]     = useState('');
  const [socializa, setSocializa]     = useState<boolean | null>(null);
  const [notas, setNotas]             = useState('');
  const [inputFocus, setInputFocus]   = useState(false);

  const [perros, setPerros]             = useState<Dog[] | null>(null);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [enviando, setEnviando]         = useState(false);
  const [error, setError]               = useState('');

  useFocusEffect(
    useCallback(() => {
      getMyDogs()
        .then((d) => {
          setPerros(d);
          // Con un solo perro no tiene sentido obligar a tocarlo.
          if (d.length === 1) setSeleccionados([d[0].id]);
        })
        .catch((err: any) => setError(err.message || 'No pudimos cargar tus perros.'));
    }, [])
  );

  const togglePerro = (id: number) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const puedeContinuar =
    !!duracion && !!ubicacion.trim() && seleccionados.length > 0 && socializa !== null && !enviando;

  const continuar = async () => {
    if (!puedeContinuar) return;
    setError('');

    const walkType = socializa === true ? 'group' : 'individual';
    // El backend no tiene un valor de walkType para "paseo + adiestramiento"
    // (solo 'individual' | 'group') — el tipo de servicio elegido en Inicio
    // viaja en notes para no perderlo.
    const notasFinales = [
      tipo === 'adiestramiento' ? 'Servicio: paseo + adiestramiento' : null,
      notas.trim() || null,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      setEnviando(true);
      // El back geocodifica el texto libre solo (addresses.controller.js),
      // así que no hace falta pasar por /maps/directions desde acá.
      const address = await createAddress({ label: 'Zona de paseo', street: ubicacion.trim() });
      const walk = await createWalk({
        dogIds: seleccionados,
        walkType,
        startTime: new Date().toISOString(),
        duration: parseInt(duracion, 10),
        notes: notasFinales || undefined,
        addressId: address.id,
      });
      router.replace({ pathname: '/buscando_paseador', params: { walkId: String(walk.id) } });
    } catch (err: any) {
      setError(
        err.message === 'Dirección no encontrada'
          ? 'No pudimos encontrar esa dirección. Probá agregando calle, altura y ciudad.'
          : err.message || 'No pudimos crear el paseo. Intentá de nuevo.'
      );
    } finally {
      setEnviando(false);
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
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Paseo</Text>
        <View style={styles.backBtn} />
      </View>
 
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
 
        {/* ── BANNER HERO ── */}
        <View style={styles.heroBanner}>
          {/*
            TODO: reemplazar este bloque por:
            <ImageBackground
              source={require('@/assets/images/banner-crear-paseo.png')}
              style={styles.heroBannerBg}
              resizeMode="cover"
            />
          */}
          <View style={styles.heroBannerBg}>
            <Text style={styles.heroBannerEmoji}>🌳🐕🌳</Text>
            <Text style={styles.placeholderLabel}>Ilustración: parque con perro</Text>
          </View>
 
          {/* Logo + texto encima del banner */}
          <View style={styles.heroContent}>
            <View style={styles.heroLogoRow}>
              {/* TODO: <Image source={require('@/assets/images/logo-pata.png')} style={{width:28,height:28}} /> */}
              <View style={styles.logoPlaceholder}><Text>🐾</Text></View>
              <Text style={styles.heroLogoText}>Perrubi</Text>
            </View>
            <Text style={styles.heroSubtitle}>
              {tipo === 'adiestramiento'
                ? 'Paseo + adiestramiento: ejercicio y\nentrenamiento en el mismo paseo.'
                : 'Elegí cómo querés el\npaseo ideal para tu perro.'}
            </Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── QUÉ PERRO ── */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardIconEmoji}>🐕</Text>
            <Text style={styles.cardTitle}>¿Qué perro va al paseo?</Text>
          </View>

          {perros === null ? (
            <ActivityIndicator color={GREEN} />
          ) : perros.length === 0 ? (
            <View>
              <Text style={styles.socialPregunta}>Todavía no agregaste ningún perro.</Text>
              <TouchableOpacity
                style={styles.agregarPerroLink}
                onPress={() => router.push('/agregar-perro')}
              >
                <Text style={styles.agregarPerroLinkText}>Agregar un perro →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {perros.map((p) => {
                const activo = seleccionados.includes(p.id);
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.perroRow}
                    onPress={() => togglePerro(p.id)}
                  >
                    <View style={[styles.radioCircle, activo && styles.radioCircleActive]}>
                      {activo && <View style={styles.radioDot} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.perroNombre}>{p.name}</Text>
                      <Text style={styles.perroDetalle}>{p.breed ?? 'Sin raza'}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ── DURACIÓN ── */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            {/* TODO: <Image source={require('@/assets/icons/reloj.png')} style={styles.cardIcon} tintColor={GREEN} /> */}
            <Text style={styles.cardIconEmoji}>🕐</Text>
            <Text style={styles.cardTitle}>Duración del paseo</Text>
          </View>
          <View style={styles.chipRow}>
            {DURACIONES.map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setDuracion(d)}
                style={[styles.chip, duracion === d && styles.chipActive]}
              >
                <Text style={[styles.chipText, duracion === d && styles.chipTextActive]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
 
        {/* ── ZONA DE PASEO ── */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            {/* TODO: <Image source={require('@/assets/icons/pin.png')} style={styles.cardIcon} tintColor={GREEN} /> */}
            <Text style={styles.cardIconEmoji}>📍</Text>
            <Text style={styles.cardTitle}>Zona de paseo</Text>
          </View>
 
          {/* Input dirección */}
          <View style={[styles.inputWrap, inputFocus && styles.inputWrapFocus]}>
            <TextInput
              style={styles.textInput}
              placeholder="¿Dónde querés ir al paseo?"
              placeholderTextColor={TEXT_MUTED}
              value={ubicacion}
              onChangeText={setUbicacion}
              onFocus={() => setInputFocus(true)}
              onBlur={() => setInputFocus(false)}
            />
            {/* TODO: ícono brújula/target */}
            <Text style={styles.inputIconRight}>⊕</Text>
          </View>
 
          {/* Usar ubicación actual */}
          <TouchableOpacity style={styles.ubicacionActualRow}>
            {/* TODO: <Image source={require('@/assets/icons/gps.png')} style={{width:16,height:16,tintColor:GREEN}} /> */}
            <Text style={styles.ubicacionActualIcon}>✓</Text>
            <Text style={styles.ubicacionActualText}>Usar mi ubicación actual</Text>
          </TouchableOpacity>
        </View>
 
        {/* ── SOCIALIZACIÓN ── */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            {/* TODO: <Image source={require('@/assets/icons/perros.png')} style={styles.cardIcon} tintColor={GREEN} /> */}
            <Text style={styles.cardIconEmoji}>🐶</Text>
            <Text style={styles.cardTitle}>Socialización</Text>
          </View>
          <Text style={styles.socialPregunta}>
            ¿Tu perro puede socializar con otros perros?
          </Text>
 
          <View style={styles.socialRow}>
            {/* Opción Sí */}
            <TouchableOpacity
              style={[styles.socialOpcion, socializa === true && styles.socialOpcionActive]}
              onPress={() => setSocializa(true)}
            >
              {/*
                TODO: reemplazar emoji por:
                <Image source={require('@/assets/images/perro-golden.png')} style={styles.socialImg} />
              */}
              <View style={styles.socialImgPlaceholder}>
                <Text style={{ fontSize: 32 }}>🐕</Text>
                <Text style={styles.placeholderLabel}>Foto perro</Text>
              </View>
              <View style={styles.socialRadioRow}>
                <View style={[styles.radioCircle, socializa === true && styles.radioCircleActive]}>
                  {socializa === true && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.socialLabel}>Sí, puede</Text>
              </View>
            </TouchableOpacity>
 
            {/* Opción No */}
            <TouchableOpacity
              style={[styles.socialOpcion, socializa === false && styles.socialOpcionActive]}
              onPress={() => setSocializa(false)}
            >
              {/*
                TODO: reemplazar emoji por:
                <Image source={require('@/assets/images/perro-husky.png')} style={styles.socialImg} />
              */}
              <View style={styles.socialImgPlaceholder}>
                <Text style={{ fontSize: 32 }}>🐩</Text>
                <Text style={styles.placeholderLabel}>Foto perro</Text>
              </View>
              <View style={styles.socialRadioRow}>
                <View style={[styles.radioCircle, socializa === false && styles.radioCircleActive]}>
                  {socializa === false && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.socialLabel}>Prefiero que no</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
 
        {/* ── NOTAS ── */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            {/* TODO: <Image source={require('@/assets/icons/nota.png')} style={styles.cardIcon} tintColor={GREEN} /> */}
            <Text style={styles.cardIconEmoji}>📝</Text>
            <Text style={styles.cardTitle}>
              Notas adicionales{' '}
              <Text style={styles.cardTitleOpcional}>(opcional)</Text>
            </Text>
          </View>
          <View style={styles.notasWrap}>
            <TextInput
              style={styles.notasInput}
              placeholder="Contanos algo importante sobre tu perro..."
              placeholderTextColor={TEXT_MUTED}
              multiline
              maxLength={200}
              value={notas}
              onChangeText={setNotas}
              textAlignVertical="top"
            />
            <Text style={styles.notasCounter}>{notas.length}/200</Text>
          </View>
        </View>
 
        <View style={{ height: 8 }} />
      </ScrollView>
 
      {/* ── BOTÓN CONTINUAR FIJO ── */}
      <View style={styles.ctaWrap}>
        <TouchableOpacity
          style={[styles.ctaBtn, !puedeContinuar && styles.ctaBtnDisabled]}
          onPress={continuar}
          activeOpacity={0.85}
          disabled={!puedeContinuar}
        >
          {enviando
            ? <ActivityIndicator color={WHITE} />
            : <Text style={styles.ctaBtnText}>Continuar</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
 
// ─── ESTILOS ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: BG },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 8 },
 
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: WHITE, paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 0.5, borderBottomColor: BORDER,
  },
  backBtn:      { width: 32, alignItems: 'center' },
  backArrow:    { fontSize: 22, color: TEXT_PRIMARY },
  headerTitle:  { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: TEXT_PRIMARY },
 
  // Hero banner
  heroBanner: {
    width: '100%',
    height: 200,
    backgroundColor: WHITE,
    position: 'relative',
    overflow: 'hidden',
  },
  heroBannerBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#d4edda',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBannerEmoji:  { fontSize: 48 },
  heroContent: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    padding: 20,
    justifyContent: 'center',
  },
  heroLogoRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  logoPlaceholder:{ width: 30, height: 30, borderRadius: 8, backgroundColor: GREEN_LIGHT, alignItems: 'center', justifyContent: 'center' },
  heroLogoText:  { fontSize: 26, fontWeight: '800', color: TEXT_PRIMARY },
  heroSubtitle:  { fontSize: 13, color: TEXT_SECONDARY, lineHeight: 18 },
 
  // Cards
  card: {
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: BORDER,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
  },
  cardTitleRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardIconEmoji: { fontSize: 18 },
  cardTitle:     { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY },
  cardTitleOpcional: { fontSize: 13, fontWeight: '400', color: TEXT_MUTED },

  errorBanner: {
    marginHorizontal: 16, marginTop: 14, padding: 12,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10,
  },
  errorText: { fontSize: 13, color: '#ef4444', textAlign: 'center' },

  agregarPerroLink:     { marginTop: 4 },
  agregarPerroLinkText: { fontSize: 13, color: GREEN, fontWeight: '700' },
  perroRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: BORDER, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: BG,
  },
  perroNombre:  { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },
  perroDetalle: { fontSize: 12, color: TEXT_MUTED, marginTop: 1 },

  // Chips duración
  chipRow:       { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    paddingVertical: 9, paddingHorizontal: 18,
    borderRadius: 20, borderWidth: 1.5, borderColor: BORDER, backgroundColor: BG,
  },
  chipActive:    { backgroundColor: WHITE, borderColor: GREEN },
  chipText:      { fontSize: 13, fontWeight: '500', color: TEXT_SECONDARY },
  chipTextActive:{ color: GREEN, fontWeight: '700' },
 
  // Input zona
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: BORDER, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: BG,
    marginBottom: 10,
  },
  inputWrapFocus: { borderColor: BORDER_FOCUS, borderStyle: 'dashed' },
  textInput:      { flex: 1, fontSize: 14, color: TEXT_PRIMARY },
  inputIconRight: { fontSize: 20, color: TEXT_MUTED, marginLeft: 8 },
  ubicacionActualRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ubicacionActualIcon:{ fontSize: 14, color: GREEN },
  ubicacionActualText:{ fontSize: 13, color: GREEN, fontWeight: '600' },
 
  // Socialización
  socialPregunta: { fontSize: 13, color: TEXT_SECONDARY, marginBottom: 14 },
  socialRow:      { flexDirection: 'row', gap: 12 },
  socialOpcion: {
    flex: 1, borderRadius: 14, borderWidth: 1.5, borderColor: BORDER,
    backgroundColor: BG, padding: 12, alignItems: 'center', gap: 8,
  },
  socialOpcionActive: { borderColor: GREEN, backgroundColor: GREEN_LIGHT },
  socialImgPlaceholder: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#f0f0ee', alignItems: 'center', justifyContent: 'center',
  },
  socialRadioRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  radioCircle: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  radioCircleActive: { borderColor: GREEN },
  radioDot:   { width: 9, height: 9, borderRadius: 5, backgroundColor: GREEN },
  socialLabel:{ fontSize: 13, fontWeight: '600', color: TEXT_PRIMARY },
 
  // Notas
  notasWrap:  { position: 'relative' },
  notasInput: {
    borderWidth: 1.5, borderColor: BORDER, borderRadius: 12,
    padding: 12, fontSize: 14, color: TEXT_PRIMARY,
    minHeight: 90, backgroundColor: BG,
    ...Platform.select({ android: { textAlignVertical: 'top' } }),
  },
  notasCounter: {
    position: 'absolute', bottom: 8, right: 10,
    fontSize: 11, color: TEXT_MUTED,
  },
 
  // Botón continuar fijo
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
  ctaBtnDisabled: { backgroundColor: '#a5d6a7', shadowOpacity: 0 },
  ctaBtnText: { fontSize: 16, fontWeight: '700', color: WHITE, letterSpacing: 0.2 },
 
  // Misc
  placeholderLabel: { fontSize: 9, color: TEXT_MUTED, textAlign: 'center', marginTop: 2 },
});
 