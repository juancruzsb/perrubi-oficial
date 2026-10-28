import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAviso } from '@/components/perrubi/aviso';
import { Boton, Tarjeta, Opcion, Encabezado, Etiqueta, Fila, Pantalla, TituloSeccion, Espacio } from '@/components/perrubi/piezas';
import { C, t } from '@/components/perrubi/estilos';

const AMOUNTS = { 'Todo': '$48.200', '$20.000': '$20.000', '$10.000': '$10.000' } as const;
type A = keyof typeof AMOUNTS;

function Linea({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={t(12.5, 400, C.muted)}>{k}</Text><Text style={t(12.5, 600)}>{v}</Text>
    </View>
  );
}

export default function Retirar() {
  const router = useRouter();
  const aviso = useAviso();
  const [amount, setAmount] = useState<A>('Todo');

  return (
    <Pantalla pad={{ paddingTop: 18, paddingHorizontal: 20, paddingBottom: 24 }}>
      <Encabezado title="Retirar ganancias" fallback="/paseador/ganancias" style={{ marginBottom: 16 }} />
      <Tarjeta style={{ padding: 20, alignItems: 'center' }}>
        <Text style={t(12, 400, C.muted)}>Saldo disponible</Text>
        <Text style={t(34, 700, C.ink, { marginTop: 4, letterSpacing: -0.68 })}>$48.200</Text>
        <Text style={t(11.5, 400, C.muted, { marginTop: 4 })}>$6.500 en proceso · se libera en 24 h</Text>
      </Tarjeta>

      <TituloSeccion>Monto a retirar</TituloSeccion>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(Object.keys(AMOUNTS) as A[]).map((a) => (
          <Opcion key={a} label={a} on={amount === a} fill size={13} style={{ borderRadius: 12, paddingVertical: 12, paddingHorizontal: 6 }} onPress={() => setAmount(a)} />
        ))}
      </View>

      <TituloSeccion>Destino</TituloSeccion>
      <Tarjeta style={{ overflow: 'hidden' }}>
        <Fila icon="solar:card-bold" tone="blue" title="Mercado Pago" sub="CVU ···· 4821 · Juan Pérez" right={<Etiqueta label="Principal" />} />
        <Fila icon="solar:add-circle-bold" title="Agregar cuenta bancaria" sub="CBU o alias" onPress={() => aviso('Cuenta bancaria', 'Disponible próximamente.')} last />
      </Tarjeta>

      <Tarjeta style={{ paddingVertical: 12, paddingHorizontal: 14, marginTop: 14, gap: 8 }}>
        <Linea k="Monto" v={AMOUNTS[amount]} />
        <Linea k="Comisión" v="$0" />
        <Linea k="Acreditación" v="Inmediata" />
      </Tarjeta>

      <Espacio />
      <Boton label="Confirmar retiro" size={14} weight={600} style={{ marginTop: 20 }} onPress={() => { aviso('Retiro enviado', `${AMOUNTS[amount]} a Mercado Pago ···· 4821`); router.back(); }} />
    </Pantalla>
  );
}
