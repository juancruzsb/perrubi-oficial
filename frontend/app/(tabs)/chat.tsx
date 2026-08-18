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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ─── COLORES ────────────────────────────────────────────────
const GREEN          = '#4caf50';
const GREEN_MEDIUM    = '#58ad45';
const GREEN_LIGHT     = '#eaf7eb';
const BUBBLE_OUT      = '#c7e4bd';
const BUBBLE_IN       = '#eef1ee';
const BG              = '#f5f7f5';
const WHITE           = '#ffffff';
const BORDER          = '#e6e9e6';
const TEXT_DARK        = '#1c1c1c';
const TEXT_SECONDARY   = '#6b6b6b';
const TEXT_MUTED       = '#9aa39a';

type Message = {
  id: string;
  from: 'them' | 'me';
  text: string;
  time: string;
  read?: boolean;
};

const initialMessages: Message[] = [
  { id: '1', from: 'them', text: '¡Hola Noah! 👋\nYa estoy en camino.', time: '16:40' },
  { id: '2', from: 'me', text: '¡Genial! Gracias ✨', time: '16:41', read: true },
  { id: '3', from: 'them', text: 'Estoy llegando en 2 min.', time: '16:45' },
];

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    setMessages((prev) => [...prev, { id: Date.now().toString(), from: 'me', text: text.trim(), time }]);
    setText('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={TEXT_SECONDARY} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Juan Pérez</Text>
          <View style={styles.headerStatusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.headerStatus}>En línea</Text>
          </View>
        </View>

        <TouchableOpacity hitSlop={12}>
          <Ionicons name="ellipsis-vertical" size={20} color={TEXT_SECONDARY} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── TOBY CARD ── */}
          <View style={styles.tobyCard}>
            <View style={styles.tobyAvatarWrap}>
              <View style={styles.tobyAvatar}>
                <Text style={styles.tobyAvatarEmoji}>🐶</Text>
              </View>
              <View style={styles.onlineBadge} />
            </View>

            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.tobyNameRow}>
                <Text style={styles.tobyName}>Toby</Text>
                <Text style={styles.tobyPaw}> 🐾</Text>
              </View>
              <Text style={styles.tobySub}>Paseo en curso</Text>
            </View>

            <View style={styles.tobyStats}>
              <View style={styles.tobyStat}>
                <Ionicons name="time-outline" size={13} color={TEXT_SECONDARY} />
                <Text style={styles.tobyStatText}>12 min</Text>
              </View>
              <View style={styles.tobyStat}>
                <Ionicons name="location-outline" size={13} color={TEXT_SECONDARY} />
                <Text style={styles.tobyStatText}>1.2 km</Text>
              </View>
            </View>
          </View>

          {/* ── VER UBICACIÓN ── */}
          <TouchableOpacity style={styles.locationBtn} activeOpacity={0.85}>
            <Text style={styles.locationBtnText}>Ver ubicación</Text>
          </TouchableOpacity>

          {/* ── MENSAJES ── */}
          <View style={styles.messages}>
            {messages.map((m) =>
              m.from === 'them' ? (
                <View key={m.id} style={styles.messageBlockLeft}>
                  <View style={styles.bubbleIn}>
                    <Text style={styles.bubbleInText}>{m.text}</Text>
                  </View>
                  <Text style={styles.timeLeft}>{m.time}</Text>
                </View>
              ) : (
                <View key={m.id} style={styles.messageBlockRight}>
                  <View style={styles.bubbleOut}>
                    <Text style={styles.bubbleOutText}>{m.text}</Text>
                  </View>
                  <View style={styles.timeRightRow}>
                    <Text style={styles.timeRight}>{m.time}</Text>
                    {m.read && (
                      <Ionicons
                        name="checkmark-done"
                        size={14}
                        color={GREEN_MEDIUM}
                        style={{ marginLeft: 4 }}
                      />
                    )}
                  </View>
                </View>
              )
            )}
          </View>
        </ScrollView>

        {/* ── INPUT BAR ── */}
        <View style={styles.inputBar}>
          <TouchableOpacity hitSlop={10}>
            <Ionicons name="attach" size={22} color={TEXT_MUTED} />
          </TouchableOpacity>

          <View style={styles.inputPill}>
            <TextInput
              style={styles.input}
              placeholder="Escribe un mensaje..."
              placeholderTextColor={TEXT_MUTED}
              value={text}
              onChangeText={setText}
              multiline
            />
            <TouchableOpacity hitSlop={10}>
              <Ionicons name="happy-outline" size={20} color={TEXT_MUTED} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.sendBtn} activeOpacity={0.85} onPress={handleSend}>
            <Ionicons name="send" size={17} color={WHITE} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WHITE },
  container: { flex: 1, backgroundColor: BG },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: TEXT_DARK },
  headerStatusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: GREEN, marginRight: 5 },
  headerStatus: { fontSize: 12, color: TEXT_SECONDARY },

  // Toby card
  tobyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tobyAvatarWrap: { position: 'relative' },
  tobyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tobyAvatarEmoji: { fontSize: 22 },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: GREEN,
    borderWidth: 2,
    borderColor: WHITE,
  },
  tobyNameRow: { flexDirection: 'row', alignItems: 'center' },
  tobyName: { fontSize: 15, fontWeight: '700', color: TEXT_DARK },
  tobyPaw: { fontSize: 13 },
  tobySub: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 2 },
  tobyStats: { alignItems: 'flex-end' },
  tobyStat: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  tobyStatText: { fontSize: 12, color: TEXT_SECONDARY, marginLeft: 4 },

  // Ver ubicación
  locationBtn: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: GREEN_LIGHT,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  locationBtnText: { fontSize: 14, fontWeight: '700', color: GREEN_MEDIUM },

  // Mensajes
  messages: { paddingHorizontal: 20, paddingTop: 20 },
  messageBlockLeft: { alignSelf: 'flex-start', maxWidth: '78%', marginBottom: 16 },
  messageBlockRight: { alignSelf: 'flex-end', maxWidth: '78%', marginBottom: 16 },
  bubbleIn: {
    backgroundColor: BUBBLE_IN,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleInText: { fontSize: 14, color: TEXT_DARK, lineHeight: 20 },
  timeLeft: { fontSize: 11, color: TEXT_MUTED, marginTop: 5, marginLeft: 4 },
  bubbleOut: {
    backgroundColor: BUBBLE_OUT,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleOutText: { fontSize: 14, color: TEXT_DARK, lineHeight: 20 },
  timeRightRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 5, marginRight: 4 },
  timeRight: { fontSize: 11, color: TEXT_MUTED },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    gap: 10,
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
  },
  input: { flex: 1, fontSize: 14, color: TEXT_DARK, maxHeight: 80 },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
