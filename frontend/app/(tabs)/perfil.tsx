import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMe, nombreCompleto } from '../../api/auth';
import { useSession } from '../../context/session';

// ─── COLORES ────────────────────────────────────────────────
const GREEN        = '#4caf50';
const GREEN_DARK    = '#1b5e20';
const GREEN_LIGHT   = '#eaf7eb';
const GREEN_SOFT    = '#dcefdd';
const BORDER        = '#eef1ee';
const BG            = '#ffffff';
const WHITE         = '#ffffff';
const RED           = '#ef4444';
const TEXT_DARK      = '#1c1c1c';
const TEXT_SECONDARY = '#8a8f8a';
const TEXT_MUTED     = '#b7bcb7';
const CHEVRON_COLOR  = '#c2c7c2';
const LEAF_COLOR      = '#cfe9cf';
const LEAF_COLOR_DARK = '#a9d6ab';

type MenuItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  destino?: string; // sin destino = todavía no hay pantalla real detrás
};

const menuItems: MenuItem[] = [
  { id: 'datos',       icon: 'person-outline',       label: 'Mis datos' },
  { id: 'perros',      icon: 'paw-outline',          label: 'Mis perros', destino: '/mis_perros' },
  { id: 'pagos',       icon: 'card-outline',         label: 'Métodos de pago' },
  { id: 'direcciones', icon: 'location-outline',     label: 'Direcciones guardadas' },
  { id: 'ayuda',       icon: 'help-circle-outline',  label: 'Ayuda y soporte' },
  { id: 'config',      icon: 'settings-outline',     label: 'Configuración' },
];

function iniciales(nombre: string | null, apellido: string | null): string {
  const a = nombre?.trim()?.[0] ?? '';
  const b = apellido?.trim()?.[0] ?? '';
  return (a + b).toUpperCase() || '🐾';
}

export default function PerfilScreen() {
  const router = useRouter();
  const { user, token, entrar, salir } = useSession();
  const [confirmando, setConfirmando] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  // Refresca el perfil (getMe() estaba listo pero nadie lo llamaba) para
  // reflejar cambios hechos desde otra sesión/dispositivo. Reusa el token
  // vigente — entrar() ya se ocupa de persistir en AsyncStorage y actualizar
  // el contexto, así que no hace falta estado local para esto.
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      getMe()
        .then((res) => entrar(token, res.user))
        .catch(() => {
          // Silencioso: si falla, seguimos mostrando el user que ya está en
          // el contexto de sesión — no vale la pena un banner de error acá.
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])
  );

  const cerrarSesion = async () => {
    try {
      setCerrando(true);
      await salir();
      // No hace falta navegar: el guard de (tabs)/_layout.tsx detecta
      // token === null y dispara <Redirect href="/login" /> solo.
    } finally {
      setCerrando(false);
      setConfirmando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{iniciales(user?.firstName ?? null, user?.lastName ?? null)}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{nombreCompleto(user)}</Text>
            <Text style={styles.headerEmail}>{user?.email ?? ''}</Text>
          </View>
        </View>

        {/* ── MENU ── */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => {
            const habilitado = !!item.destino;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.menuItemLast,
                  !habilitado && styles.menuItemDisabled,
                ]}
                activeOpacity={habilitado ? 0.6 : 1}
                disabled={!habilitado}
                onPress={() => item.destino && router.push(item.destino as any)}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon} size={20} color={habilitado ? GREEN : TEXT_MUTED} />
                </View>
                <Text style={[styles.menuLabel, !habilitado && styles.menuLabelDisabled]}>
                  {item.label}
                </Text>
                {habilitado ? (
                  <Ionicons name="chevron-forward" size={18} color={CHEVRON_COLOR} />
                ) : (
                  <Text style={styles.proximamente}>Próximamente</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── CERRAR SESIÓN ── */}
        {confirmando ? (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>¿Cerrar sesión?</Text>
            <View style={styles.confirmRow}>
              <TouchableOpacity
                style={styles.confirmBtnNo}
                onPress={() => setConfirmando(false)}
                activeOpacity={0.85}
                disabled={cerrando}
              >
                <Text style={styles.confirmBtnNoText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtnSi}
                onPress={cerrarSesion}
                activeOpacity={0.85}
                disabled={cerrando}
              >
                {cerrando ? (
                  <ActivityIndicator color={WHITE} />
                ) : (
                  <Text style={styles.confirmBtnSiText}>Sí, cerrar sesión</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.85}
            onPress={() => setConfirmando(true)}
          >
            <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
          </TouchableOpacity>
        )}

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
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  // Header
  header: {
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: WHITE },
  headerInfo: { flex: 1, marginLeft: 14 },
  headerName: { fontSize: 20, fontWeight: '700', color: WHITE },
  headerEmail: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  // Menu
  menuCard: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuItemDisabled: { opacity: 0.55 },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: TEXT_DARK },
  menuLabelDisabled: { color: TEXT_SECONDARY },
  proximamente: { fontSize: 11, color: TEXT_MUTED, fontWeight: '600' },

  // Cerrar sesión
  logoutBtn: {
    marginTop: 24,
    marginHorizontal: 20,
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
  logoutBtnText: { fontSize: 16, fontWeight: '700', color: WHITE },

  // Confirmación de logout — sin Alert.alert: no es confiable en RN Web,
  // y esta app se prueba en web (PhoneFrame en app/_layout.tsx).
  confirmBox: {
    marginTop: 24,
    marginHorizontal: 20,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 18,
    padding: 16,
  },
  confirmText: { fontSize: 15, fontWeight: '700', color: TEXT_DARK, textAlign: 'center', marginBottom: 12 },
  confirmRow: { flexDirection: 'row', gap: 10 },
  confirmBtnNo: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 22,
    alignItems: 'center',
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  confirmBtnNoText: { fontSize: 14, fontWeight: '700', color: TEXT_DARK },
  confirmBtnSi: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 22,
    alignItems: 'center',
    backgroundColor: RED,
  },
  confirmBtnSiText: { fontSize: 14, fontWeight: '700', color: WHITE },

  // Decoración inferior
  bottomWave: {
    marginTop: 28,
    height: 90,
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
