import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Icono } from '@/components/perrubi/icono';
import { useAviso } from '@/components/perrubi/aviso';
import { Tarjeta, FlechaIzquierda, Foto, Etiqueta } from '@/components/perrubi/piezas';
import { C, SOMBRAS, t } from '@/components/perrubi/estilos';
import { usePaseoPaseador } from '@/context/paseo-paseador';
import { PERRO_TOBY, RESPUESTAS_RAPIDAS } from '@/lib/datos-paseador';

export default function ChatPaseador() {
  const router = useRouter();
  const aviso = useAviso();
  const { mensajes, enviar } = usePaseoPaseador();
  const [draft, setDraft] = useState('');
  const scroll = useRef<ScrollView>(null);
  const submit = (text = draft) => { enviar(text); setDraft(''); };
  const call = () => aviso('Llamando a Noah', '+54 11 5555 0198 · llamada enmascarada');

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
          <Pressable onPress={() => router.navigate('/paseador')} hitSlop={10} style={{ padding: 4 }}><FlechaIzquierda /></Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={t(15, 700)}>Noah</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.green }} />
              <Text style={t(11, 400, C.green)}>En línea</Text>
            </View>
          </View>
          <Pressable onPress={call} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icono name="solar:phone-bold" size={16} color={C.green} />
          </Pressable>
        </View>

        <Tarjeta onPress={() => router.push('/paseador/en-camino')} style={{ marginTop: 12, marginHorizontal: 16, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Foto uri={PERRO_TOBY} size={38} radius={10} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={t(13, 600)}>Paseo con Toby · 30 min</Text>
            <Text style={t(11, 400, C.muted)}>Hoy 16:00 · Av. Santa Fe 2450</Text>
          </View>
          <Etiqueta label="En camino" />
        </Tarjeta>

        <ScrollView ref={scroll} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })} contentContainerStyle={{ flexGrow: 1, paddingVertical: 14, paddingHorizontal: 16, gap: 12 }}>
          {mensajes.map((m, i) => {
            const mine = m.from === 'walker';
            return (
              <View key={i} style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}>
                <View style={{ maxWidth: '75%', backgroundColor: mine ? C.greenBubble : C.gray, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14 }}>
                  <Text style={t(13)}>{m.text}</Text>
                </View>
                <Text style={t(10, 400, C.faint, { marginTop: 3 })}>{m.time}</Text>
              </View>
            );
          })}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 10 }}>
          {RESPUESTAS_RAPIDAS.map((q) => (
            <Pressable key={q} onPress={() => submit(q)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: C.white, borderWidth: 1, borderColor: C.borderInput }}>
              <Text style={t(12, 500)}>{q}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 10, paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.white }}>
          <TextInput
            value={draft} onChangeText={setDraft} onSubmitEditing={() => submit()} returnKeyType="send"
            placeholder="Escribe un mensaje..." placeholderTextColor={C.placeholder}
            style={[t(13), { flex: 1, borderWidth: 1, borderColor: C.border, boxShadow: SOMBRAS.tarjeta, borderRadius: 20, paddingVertical: 11, paddingHorizontal: 16, backgroundColor: C.white }]}
          />
          <Pressable onPress={() => submit()} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="#fff"><Path d="M3 20l18-8L3 4v6l12 2-12 2v6z" /></Svg>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
