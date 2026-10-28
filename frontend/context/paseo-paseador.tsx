import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAviso } from '../components/perrubi/aviso';
import { MENSAJES_INICIALES, type Mensaje } from '../lib/datos-paseador';

export type EstadoPaseo = 'espera' | 'activo' | 'pausado' | 'terminado';

type Ctx = {
  disponible: boolean; alternarDisponible: () => void;
  estadoPaseo: EstadoPaseo; progreso: number;
  iniciarPaseo: () => void; pausarPaseo: () => void; reanudarPaseo: () => void; reiniciarPaseo: () => void;
  mensajes: Mensaje[]; enviar: (text: string) => void;
};
const PaseoPaseadorCtx = createContext<Ctx | null>(null);
export const usePaseoPaseador = () => {
  const c = useContext(PaseoPaseadorCtx);
  if (!c) throw new Error('usePaseoPaseador fuera de PaseoPaseadorProvider');
  return c;
};

/** Estado compartido del modo paseador (simulado, igual al prototipo: +2,5% por segundo). */
export function PaseoPaseadorProvider({ children }: { children: React.ReactNode }) {
  const aviso = useAviso();
  const [disponible, setDisponible] = useState(true);
  const [estadoPaseo, setEstadoPaseo] = useState<EstadoPaseo>('espera');
  const [progreso, setProgreso] = useState(0);
  const [mensajes, setMensajes] = useState<Mensaje[]>(MENSAJES_INICIALES);
  const progresoRef = useRef(0);

  useEffect(() => {
    if (estadoPaseo !== 'activo') return;
    const id = setInterval(() => {
      const prev = progresoRef.current;
      if (prev >= 1) return;
      const next = Math.min(1, prev + 0.025);
      if (prev < 0.3 && next >= 0.3) aviso('Retiro confirmado', 'Paseo iniciado · 16:52.');
      if (prev < 0.85 && next >= 0.85) aviso('Regreso en curso', 'Llegada estimada en 6 min.');
      if (next >= 1) { aviso('Paseo finalizado', 'Entrega registrada · 30 min · 2,1 km.'); setEstadoPaseo('terminado'); }
      progresoRef.current = next;
      setProgreso(next);
    }, 1000);
    return () => clearInterval(id);
  }, [estadoPaseo, aviso]);

  const value: Ctx = {
    disponible, alternarDisponible: () => setDisponible((o) => !o),
    estadoPaseo, progreso,
    iniciarPaseo: () => setEstadoPaseo('activo'),
    pausarPaseo: () => setEstadoPaseo('pausado'),
    reanudarPaseo: () => setEstadoPaseo('activo'),
    reiniciarPaseo: () => { progresoRef.current = 0; setProgreso(0); setEstadoPaseo('espera'); },
    mensajes,
    enviar: (text) => {
      const v = text.trim(); if (!v) return;
      const d = new Date();
      setMensajes((m) => [...m, { from: 'walker', text: v, time: `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}` }]);
    },
  };
  return <PaseoPaseadorCtx.Provider value={value}>{children}</PaseoPaseadorCtx.Provider>;
}
