import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
 
// ─── COLORES ────────────────────────────────────────────────
const GREEN        = '#4caf50';
const GREEN_LIGHT  = '#e8f5e9';
const GREEN_DARK   = '#388e3c';
const PURPLE       = '#7c3aed';
const PURPLE_LIGHT = '#f3f0ff';
const RED          = '#ef4444';
const BG           = '#f5f5f5';
const WHITE        = '#ffffff';
const TEXT_PRIMARY   = '#1a1a1a';
const TEXT_SECONDARY = '#666666';
const TEXT_MUTED     = '#999999';
const BORDER         = '#e0e0e0';
 
type Perro = {
  id: string; nombre: string; tipo: string; edad: string; activo: boolean;
};
type PaseoReciente = {
  id: string; dia: string; tiempo: string; ubicacion: string; completado: boolean;
};
 
const perrosMock: Perro[] = [
  { id: '1', nombre: 'Nombre del perro', tipo: 'Tipo de perro', edad: 'Edad del perro', activo: true },
];
const paseosMock: PaseoReciente[] = [
  { id: '1', dia: 'Día, fecha', tiempo: 'Tiempo de recorrido', ubicacion: 'ubicación', completado: true },
];
 
// ─── HEADER ─────────────────────────────────────────────────
function Header({ tieneNotif }: { tieneNotif: boolean }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLogo}>
        {/* TODO: <Image source={require('@/assets/images/logo-pata.png')} style={{width:28,height:28}} /> */}
        <View style={styles.logoPlaceholder}><Text>🐾</Text></View>
        <Text style={styles.logoText}>Perrubi</Text>
      </View>
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.iconEmoji}>🔔</Text>
          {tieneNotif && <View style={styles.notifDot} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          {/* TODO: <Image source={{uri: avatarUrl}} style={styles.avatarPlaceholder} /> */}
          <View style={styles.avatarPlaceholder} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
 
// ─── HERO BANNER ────────────────────────────────────────────
function HeroBanner() {
  return (
    <View style={styles.heroBanner}>
      {/*
        TODO: reemplazar por:
        <ImageBackground
          source={require('@/assets/images/hero-banner.png')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      */}
      <View style={styles.heroBannerBg}>
        <Text style={styles.heroBannerEmoji}>🛋️🌿🐕</Text>
        <Text style={styles.placeholderLabel}>Ilustración: sala con perro</Text>
      </View>
      <View style={styles.heroOverlay}>
        <Text style={styles.heroTitle}>¡Hola, usuario!</Text>
        <Text style={styles.heroSubtitle}>¿Listo para un paseo?</Text>
      </View>
    </View>
  );
}
 
// ─── SERVICIOS ──────────────────────────────────────────────
function SeccionServicios({ onServicio }: { onServicio: (tipo: string) => void }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>¿Qué servicio necesitas?</Text>
      <View style={styles.serviciosRow}>
        <TouchableOpacity style={styles.servicioCard} onPress={() => onServicio('paseo')}>
          <View style={[styles.servicioIconWrap, { backgroundColor: GREEN_LIGHT }]}>
            <Text style={styles.servicioIconEmoji}>🐾</Text>
          </View>
          <Text style={styles.servicioNombre}>Paseo</Text>
          <Text style={styles.servicioDesc}>Paseos seguros y divertidos para tu perro</Text>
          <View style={[styles.servicioArrow, { backgroundColor: GREEN }]}>
            <Text style={styles.servicioArrowText}>→</Text>
          </View>
        </TouchableOpacity>
 
        <TouchableOpacity style={[styles.servicioCard, styles.servicioCardPurple]} onPress={() => onServicio('adiestramiento')}>
          <View style={[styles.servicioIconWrap, { backgroundColor: PURPLE_LIGHT }]}>
            <Text style={styles.servicioIconEmoji}>🎓</Text>
          </View>
          <Text style={styles.servicioNombre}>Paseo +{'\n'}Adiestramiento</Text>
          <Text style={styles.servicioDesc}>Ejercicio y entrenamiento en cada paseo</Text>
          <View style={[styles.servicioArrow, { backgroundColor: PURPLE }]}>
            <Text style={styles.servicioArrowText}>→</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
 
// ─── TU PERRO — CON DATOS ────────────────────────────────────
function SeccionPerrosConDatos({ perros }: { perros: Perro[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tu perro</Text>
      <View style={styles.card}>
        {perros.map((p) => (
          <TouchableOpacity key={p.id} style={styles.perroRow}>
            <View style={styles.perroFotoPlaceholder}><Text style={{ fontSize: 20 }}>🐶</Text></View>
            <View style={styles.perroInfo}>
              <View style={styles.perroNombreRow}>
                <Text style={styles.perroNombre}>{p.nombre}</Text>
                {p.activo && (
                  <View style={styles.activoBadge}>
                    <Text style={styles.activoBadgeText}>Activo</Text>
                  </View>
                )}
              </View>
              <Text style={styles.perroDetalle}>{p.tipo} | {p.edad}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.divider} />
        <TouchableOpacity style={styles.agregarPerroRow}>
          <Text style={styles.agregarPerroIcon}>⊕</Text>
          <Text style={styles.agregarPerroText}>Agregar otro perro</Text>
          <Text style={styles.patitasDecorativas}>🐾</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
 
// ─── TU PERRO — VACÍO ────────────────────────────────────────
function SeccionPerrosVacia() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tu perro</Text>
      <View style={[styles.card, styles.cardVacio]}>
        <View style={styles.emptyIlustPlaceholder}>
          <Text style={{ fontSize: 36 }}>😴🐕</Text>
          <Text style={styles.placeholderLabel}>Ilustración: perro durmiendo</Text>
        </View>
        <Text style={styles.emptyTitle}>Aún no agregaste un perro</Text>
        <Text style={styles.emptySubtitle}>Agregá a tu compañero para empezar a planificar sus paseos.</Text>
        <TouchableOpacity style={styles.agregarPerroBtn}>
          <Text style={styles.agregarPerroIcon}>⊕</Text>
          <Text style={styles.agregarPerroBtnText}>Agregar otro perro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
 
// ─── PASEOS — CON DATOS ──────────────────────────────────────
function SeccionPaseosConDatos({ paseos }: { paseos: PaseoReciente[] }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Paseos recientes</Text>
        <TouchableOpacity><Text style={styles.verTodos}>Ver todos</Text></TouchableOpacity>
      </View>
      <View style={styles.card}>
        {paseos.map((p) => (
          <TouchableOpacity key={p.id} style={styles.paseoRow}>
            <View style={styles.mapaThumbnailPlaceholder}><Text style={{ fontSize: 22 }}>🗺️</Text></View>
            <View style={styles.paseoInfo}>
              <Text style={styles.paseoNombre}>{p.dia}</Text>
              <Text style={styles.paseoDetalle}>{p.tiempo} | {p.ubicacion}</Text>
              {p.completado && (
                <View style={styles.completadoBadge}>
                  <Text style={styles.completadoBadgeText}>✓ Completado</Text>
                </View>
              )}
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
 
// ─── PASEOS — VACÍO ──────────────────────────────────────────
function SeccionPaseosVacio() {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Paseos recientes</Text>
        <TouchableOpacity><Text style={styles.verTodos}>Ver todos</Text></TouchableOpacity>
      </View>
      <View style={[styles.card, styles.paseoVacioWrap]}>
        <Text style={{ fontSize: 28, marginRight: 12 }}>📅</Text>
        <View>
          <Text style={styles.emptyTitle}>Aún no tenés paseos</Text>
          <Text style={styles.emptySubtitle}>Cuando reserves un paseo, lo verás aquí.</Text>
        </View>
      </View>
    </View>
  );
}
 
// ─── POR QUÉ ELEGIR ──────────────────────────────────────────
function SeccionPorQueElegir() {
  const items = [
    { emoji: '🛡️', color: GREEN, titulo: 'Paseadores verificados', desc: 'Todos nuestros paseadores pasan por un proceso de verificación.' },
    { emoji: '🐾', color: GREEN, titulo: 'Seguros y confiables',   desc: 'Tu perro siempre en buenas manos y con seguimiento en tiempo real.' },
    { emoji: '❤️', color: RED,   titulo: 'Hecho con amor',         desc: 'Amamos a los perros tanto como tú.' },
  ];
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>¿Por qué elegir Perrubi?</Text>
      <View style={styles.porQueRow}>
        {items.map((item) => (
          <View key={item.titulo} style={styles.porQueItem}>
            <View style={[styles.porQueIconWrap, { backgroundColor: item.color }]}>
              <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
            </View>
            <Text style={styles.porQueTitulo}>{item.titulo}</Text>
            <Text style={styles.porQueDesc}>{item.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
 
// ─── PANTALLA PRINCIPAL ──────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
 
  // Cambiá a [] para ver el estado vacío
  const [perros] = useState<Perro[]>(perrosMock);
  const [paseos] = useState<PaseoReciente[]>(paseosMock);
 
  const tienePerros = perros.length > 0;
  const tienePaseos = paseos.length > 0;
 
  function handleServicio(tipo: string) {
    router.push({ pathname: '/crear-paseo', params: { tipo } });
  }
 
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      <Header tieneNotif={false} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeroBanner />
        <SeccionServicios onServicio={handleServicio} />
        {tienePerros ? <SeccionPerrosConDatos perros={perros} /> : <SeccionPerrosVacia />}
        {tienePaseos ? <SeccionPaseosConDatos paseos={paseos} /> : <SeccionPaseosVacio />}
        <SeccionPorQueElegir />
        <View style={{ height: 24 }} />
      </ScrollView>
      {/* ↑ Sin TabBar propio — usa la de Expo del _layout.tsx */}
    </SafeAreaView>
  );
}
 
// ─── ESTILOS ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: BG },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 8 },
 
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: WHITE, paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: BORDER,
  },
  headerLogo:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoPlaceholder:   { width: 32, height: 32, borderRadius: 8, backgroundColor: GREEN_LIGHT, alignItems: 'center', justifyContent: 'center' },
  logoText:          { fontSize: 22, fontWeight: '800', color: TEXT_PRIMARY },
  headerIcons:       { flexDirection: 'row', gap: 8, alignItems: 'center' },
  iconBtn:           { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  iconEmoji:         { fontSize: 20 },
  notifDot:          { position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: RED },
  avatarPlaceholder: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ddd', borderWidth: 1, borderColor: BORDER },
 
  heroBanner:    { width: '100%', height: 180, backgroundColor: WHITE, position: 'relative', overflow: 'hidden' },
  heroBannerBg:  { ...StyleSheet.absoluteFill, backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center' },
  heroBannerEmoji:{ fontSize: 52 },
  heroOverlay:   { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(255,255,255,0.7)' },
  heroTitle:     { fontSize: 22, fontWeight: '800', color: TEXT_PRIMARY },
  heroSubtitle:  { fontSize: 14, color: TEXT_SECONDARY, marginTop: 2 },
 
  section:          { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle:     { fontSize: 16, fontWeight: '700', color: TEXT_PRIMARY, marginBottom: 10 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  verTodos:         { fontSize: 13, color: GREEN, fontWeight: '600' },
  card:             { backgroundColor: WHITE, borderRadius: 14, borderWidth: 0.5, borderColor: BORDER, overflow: 'hidden' },
  cardVacio:        { padding: 20, alignItems: 'center' },
 
  serviciosRow:       { flexDirection: 'row', gap: 10 },
  servicioCard:       { flex: 1, backgroundColor: WHITE, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: BORDER },
  servicioCardPurple: { backgroundColor: PURPLE_LIGHT },
  servicioIconWrap:   { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  servicioIconEmoji:  { fontSize: 22 },
  servicioNombre:     { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY, marginBottom: 4 },
  servicioDesc:       { fontSize: 12, color: TEXT_SECONDARY, lineHeight: 16, marginBottom: 10, flex: 1 },
  servicioArrow:      { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  servicioArrowText:  { color: WHITE, fontSize: 16, fontWeight: '700' },
 
  perroRow:            { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  perroFotoPlaceholder:{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  perroInfo:           { flex: 1 },
  perroNombreRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  perroNombre:         { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY },
  activoBadge:         { backgroundColor: GREEN_LIGHT, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  activoBadgeText:     { fontSize: 11, color: GREEN_DARK, fontWeight: '600' },
  perroDetalle:        { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
  divider:             { height: 0.5, backgroundColor: BORDER, marginHorizontal: 14 },
  agregarPerroRow:     { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 8, backgroundColor: GREEN_LIGHT },
  agregarPerroIcon:    { fontSize: 18, color: GREEN },
  agregarPerroText:    { flex: 1, fontSize: 14, color: GREEN, fontWeight: '600' },
  patitasDecorativas:  { fontSize: 18, opacity: 0.3 },
  chevron:             { fontSize: 22, color: TEXT_MUTED, fontWeight: '300' },
 
  emptyIlustPlaceholder: { width: 120, height: 80, backgroundColor: GREEN_LIGHT, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle:    { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY, textAlign: 'center', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: TEXT_SECONDARY, textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  agregarPerroBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: GREEN, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 9 },
  agregarPerroBtnText: { fontSize: 14, color: GREEN, fontWeight: '600' },
 
  paseoRow:                { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  mapaThumbnailPlaceholder:{ width: 70, height: 56, borderRadius: 10, backgroundColor: '#e8f4e8', borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  paseoInfo:               { flex: 1 },
  paseoNombre:             { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },
  paseoDetalle:            { fontSize: 12, color: TEXT_MUTED, marginTop: 2, marginBottom: 6 },
  completadoBadge:         { backgroundColor: GREEN_LIGHT, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  completadoBadgeText:     { fontSize: 11, color: GREEN_DARK, fontWeight: '600' },
  paseoVacioWrap:          { flexDirection: 'row', alignItems: 'center', padding: 16 },
 
  porQueRow:     { flexDirection: 'row', gap: 8 },
  porQueItem:    { flex: 1, alignItems: 'center' },
  porQueIconWrap:{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  porQueTitulo:  { fontSize: 12, fontWeight: '700', color: TEXT_PRIMARY, textAlign: 'center', marginBottom: 4 },
  porQueDesc:    { fontSize: 11, color: TEXT_SECONDARY, textAlign: 'center', lineHeight: 15 },
 
  placeholderLabel: { fontSize: 9, color: TEXT_MUTED, textAlign: 'center', marginTop: 4 },
});
 