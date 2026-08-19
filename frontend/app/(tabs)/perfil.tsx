import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── COLORES ────────────────────────────────────────────────
const GREEN        = '#4caf50';
const GREEN_DARK    = '#1b5e20';
const GREEN_LIGHT   = '#eaf7eb';
const GREEN_SOFT    = '#dcefdd';
const BORDER        = '#eef1ee';
const BG            = '#ffffff';
const WHITE         = '#ffffff';
const TEXT_DARK      = '#1c1c1c';
const TEXT_SECONDARY = '#8a8f8a';
const CHEVRON_COLOR  = '#c2c7c2';
const LEAF_COLOR      = '#cfe9cf';
const LEAF_COLOR_DARK = '#a9d6ab';

type MenuItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const menuItems: MenuItem[] = [
  { id: 'datos',       icon: 'person-outline',       label: 'Mis datos' },
  { id: 'perros',      icon: 'paw-outline',          label: 'Mis perros' },
  { id: 'pagos',       icon: 'card-outline',         label: 'Métodos de pago' },
  { id: 'direcciones', icon: 'location-outline',     label: 'Direcciones guardadas' },
  { id: 'ayuda',       icon: 'help-circle-outline',  label: 'Ayuda y soporte' },
  { id: 'config',      icon: 'settings-outline',     label: 'Configuración' },
];

export default function PerfilScreen() {
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
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
            style={styles.avatar}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>Noah</Text>
            <Text style={styles.headerEmail}>noah@email.com</Text>
          </View>
          <TouchableOpacity hitSlop={12}>
            <Ionicons name="chevron-forward" size={22} color={WHITE} />
          </TouchableOpacity>
        </View>

        {/* ── MENU ── */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              activeOpacity={0.6}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon} size={20} color={GREEN} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={CHEVRON_COLOR} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── CERRAR SESIÓN ── */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.85}>
          <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
        </TouchableOpacity>

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
  },
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
