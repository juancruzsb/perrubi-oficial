import React, { useCallback, useRef, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyWalks, dogsOf } from '../../api/walks';
import { useChat } from '../../hooks/use-chat';
import { useSession } from '../../context/session';
import { elegirPaseoDeChat, hayPaseoBuscando, horaCorta, nombrePaseador } from '../../lib/paseos';
import type { ChatMessage, Walk } from '../../api/types';

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

function subtituloEstado(walk: Walk, cerrado: boolean): string {
  if (cerrado) return 'Chat cerrado';
  switch (walk.status) {
    case 'accepted':
      return 'Paseador asignado';
    case 'in_progress':
      return 'Paseo en curso';
    case 'finished':
      return 'Paseo finalizado';
    default:
      return '';
  }
}

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useSession();
  const { walkId: walkIdParam } = useLocalSearchParams<{ walkId?: string }>();
  const scrollRef = useRef<ScrollView>(null);

  const [walks, setWalks] = useState<Walk[] | null>(null);
  const [errorLista, setErrorLista] = useState('');
  const [texto, setTexto] = useState('');

  // Re-resuelto en cada focus (no solo al montar): así, si el usuario llega
  // por push con ?walkId= y después toca la tab Chat a secas, no se queda
  // pegado al walkId viejo.
  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      getMyWalks()
        .then((w) => {
          if (!cancelado) setWalks(w);
        })
        .catch((err: any) => {
          if (!cancelado) setErrorLista(err.message || 'No pudimos cargar tus paseos.');
        });
      return () => {
        cancelado = true;
      };
    }, [])
  );

  const preferidoId = walkIdParam ? Number(walkIdParam) : undefined;
  const walkActivo = walks ? elegirPaseoDeChat(walks, preferidoId) : null;
  const buscando = walks && !walkActivo ? hayPaseoBuscando(walks) : null;

  const { mensajes, estado, cerrado, error, enviando, enviar } = useChat(walkActivo?.id ?? null);

  const handleSend = async () => {
    const cuerpo = texto.trim();
    if (!cuerpo) return;
    setTexto('');
    try {
      await enviar(cuerpo);
    } catch {
      // El error ya quedó en el estado del hook (banner o "chat cerrado");
      // no hace falta romper acá.
    }
  };

  const esMio = (m: ChatMessage) => m.senderType === 'user' && m.senderId === user?.id;

  // ── Sin paseos cargados todavía ──
  if (walks === null) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <View style={styles.centerWrap}>
          {errorLista ? (
            <Text style={styles.vacioTexto}>{errorLista}</Text>
          ) : (
            <ActivityIndicator color={GREEN} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ── Sin ningún paseo con chat disponible ──
  if (!walkActivo) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <View style={styles.centerWrap}>
          <Ionicons name="chatbubble-outline" size={48} color={TEXT_MUTED} />
          {buscando ? (
            <>
              <Text style={styles.vacioTitulo}>Todavía estamos buscando paseador</Text>
              <Text style={styles.vacioTexto}>
                El chat se habilita apenas alguien acepte tu paseo.
              </Text>
              <TouchableOpacity
                style={styles.vacioBtn}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({ pathname: '/buscando_paseador', params: { walkId: String(buscando.id) } })
                }
              >
                <Text style={styles.vacioBtnText}>Ver búsqueda</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.vacioTitulo}>No tenés ningún paseo activo</Text>
              <Text style={styles.vacioTexto}>Cuando un paseador acepte tu paseo, vas a poder chatear con él.</Text>
              <TouchableOpacity style={styles.vacioBtn} activeOpacity={0.85} onPress={() => router.push('/crear-paseo')}>
                <Text style={styles.vacioBtnText}>Pedir un paseo</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const perros = dogsOf(walkActivo).map((d) => d.name).join(', ') || 'tu mascota';
  const inputDeshabilitado = estado !== 'listo' || cerrado;
  const puedeVolver = router.canGoBack();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} disabled={!puedeVolver}>
          <Ionicons name="arrow-back" size={24} color={puedeVolver ? TEXT_SECONDARY : 'transparent'} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{nombrePaseador(walkActivo) ?? 'Paseador'}</Text>
          <View style={styles.headerStatusRow}>
            <View style={[styles.onlineDot, cerrado && styles.onlineDotCerrado]} />
            <Text style={styles.headerStatus}>{subtituloEstado(walkActivo, cerrado)}</Text>
          </View>
        </View>

        <View style={{ width: 20 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {/* ── TARJETA DEL PERRO ── */}
          <View style={styles.tobyCard}>
            <View style={styles.tobyAvatarWrap}>
              <View style={styles.tobyAvatar}>
                <Text style={styles.tobyAvatarEmoji}>🐶</Text>
              </View>
            </View>

            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.tobyNameRow}>
                <Text style={styles.tobyName}>{perros}</Text>
                <Text style={styles.tobyPaw}> 🐾</Text>
              </View>
              <Text style={styles.tobySub}>{subtituloEstado(walkActivo, cerrado)}</Text>
            </View>

            {walkActivo.duration != null && (
              <View style={styles.tobyStats}>
                <View style={styles.tobyStat}>
                  <Ionicons name="time-outline" size={13} color={TEXT_SECONDARY} />
                  <Text style={styles.tobyStatText}>{walkActivo.duration} min</Text>
                </View>
              </View>
            )}
          </View>

          {estado === 'sin-chat' ? (
            <View style={styles.avisoBox}>
              <Text style={styles.avisoTexto}>
                Este paseo todavía no tiene un chat (falta que un paseador lo acepte).
              </Text>
            </View>
          ) : estado === 'error' ? (
            <View style={styles.avisoBox}>
              <Text style={styles.avisoTexto}>{error || 'No pudimos cargar el chat.'}</Text>
            </View>
          ) : estado === 'cargando' ? (
            <View style={styles.centerWrapChico}>
              <ActivityIndicator color={GREEN} />
            </View>
          ) : (
            /* ── MENSAJES ── */
            <View style={styles.messages}>
              {mensajes.map((m) =>
                esMio(m) ? (
                  <View key={m.id} style={styles.messageBlockRight}>
                    <View style={styles.bubbleOut}>
                      <Text style={styles.bubbleOutText}>{m.body}</Text>
                    </View>
                    <View style={styles.timeRightRow}>
                      <Text style={styles.timeRight}>{horaCorta(m.createdAt)}</Text>
                      {m.readAt && (
                        <Ionicons
                          name="checkmark-done"
                          size={14}
                          color={GREEN_MEDIUM}
                          style={{ marginLeft: 4 }}
                        />
                      )}
                    </View>
                  </View>
                ) : (
                  <View key={m.id} style={styles.messageBlockLeft}>
                    <View style={styles.bubbleIn}>
                      <Text style={styles.bubbleInText}>{m.body}</Text>
                    </View>
                    <Text style={styles.timeLeft}>{horaCorta(m.createdAt)}</Text>
                  </View>
                )
              )}
              {mensajes.length === 0 && (
                <Text style={styles.sinMensajes}>Todavía no hay mensajes. ¡Escribí el primero!</Text>
              )}
            </View>
          )}
        </ScrollView>

        {/* ── INPUT BAR ── */}
        {inputDeshabilitado ? (
          <View style={styles.inputBarDeshabilitada}>
            <Text style={styles.inputDeshabilitadaTexto}>
              {cerrado
                ? 'Este chat está cerrado.'
                : estado === 'sin-chat'
                ? 'El chat se habilita cuando el paseador acepte el paseo.'
                : 'Cargando chat...'}
            </Text>
          </View>
        ) : (
          <View style={styles.inputBar}>
            <TouchableOpacity hitSlop={10}>
              <Ionicons name="attach" size={22} color={TEXT_MUTED} />
            </TouchableOpacity>

            <View style={styles.inputPill}>
              <TextInput
                style={styles.input}
                placeholder="Escribe un mensaje..."
                placeholderTextColor={TEXT_MUTED}
                value={texto}
                onChangeText={setTexto}
                multiline
                editable={!enviando}
              />
              <TouchableOpacity hitSlop={10}>
                <Ionicons name="happy-outline" size={20} color={TEXT_MUTED} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.sendBtn, enviando && styles.sendBtnDisabled]}
              activeOpacity={0.85}
              onPress={handleSend}
              disabled={enviando || !texto.trim()}
            >
              {enviando ? <ActivityIndicator color={WHITE} size="small" /> : <Ionicons name="send" size={17} color={WHITE} />}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WHITE },
  container: { flex: 1, backgroundColor: BG },

  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  centerWrapChico: { paddingVertical: 40, alignItems: 'center' },
  vacioTitulo: { fontSize: 16, fontWeight: '700', color: TEXT_DARK, textAlign: 'center' },
  vacioTexto: { fontSize: 13, color: TEXT_SECONDARY, textAlign: 'center' },
  vacioBtn: {
    marginTop: 8,
    backgroundColor: GREEN,
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  vacioBtnText: { fontSize: 14, fontWeight: '700', color: WHITE },

  avisoBox: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    backgroundColor: GREEN_LIGHT,
    borderRadius: 14,
  },
  avisoTexto: { fontSize: 13, color: TEXT_DARK, textAlign: 'center' },
  sinMensajes: { fontSize: 13, color: TEXT_MUTED, textAlign: 'center', marginTop: 24 },

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
  onlineDotCerrado: { backgroundColor: TEXT_MUTED },
  headerStatus: { fontSize: 12, color: TEXT_SECONDARY },

  // Tarjeta del perro
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
  tobyNameRow: { flexDirection: 'row', alignItems: 'center' },
  tobyName: { fontSize: 15, fontWeight: '700', color: TEXT_DARK },
  tobyPaw: { fontSize: 13 },
  tobySub: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 2 },
  tobyStats: { alignItems: 'flex-end' },
  tobyStat: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  tobyStatText: { fontSize: 12, color: TEXT_SECONDARY, marginLeft: 4 },

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
  sendBtnDisabled: { opacity: 0.6 },

  inputBarDeshabilitada: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    alignItems: 'center',
  },
  inputDeshabilitadaTexto: { fontSize: 13, color: TEXT_MUTED },
});
