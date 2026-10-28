// Datos mock del prototipo. Reemplazar por api/* cuando exista el backend del paseador.
const U = (id: string, s = 300) => `https://images.unsplash.com/photo-${id}?w=${s}&h=${s}&fit=crop&auto=format`;

export const PASEADOR = {
  name: 'Juan Pérez',
  avatar: U('1500648767791-00dcc994a43e'),
  rating: '4.9', walks: '128', acceptance: '96%', id: '20481',
  phone: '+54 11 5555 0142', email: 'juan.perez@mail.com',
  bio: 'Paseador hace 3 años. Experiencia con perros grandes y cachorros.',
};

export const PERRO_TOBY = U('1552053831-71594a27632d', 120);

export type SolicitudPaseo = { id: number; img: string; owner: string; dog: string; breed: string; distance: string; duration: string; pay: string; time: string };
export const CERCANOS: SolicitudPaseo[] = [
  { id: 1, img: U('1552053831-71594a27632d'), owner: 'Noah', dog: 'Toby', breed: 'Labrador', distance: '0.8 km', duration: '30 min', pay: '$6.500', time: 'Ahora' },
  { id: 2, img: U('1583511655857-d19b40a7a54e'), owner: 'Ana', dog: 'Rocky', breed: 'Bulldog', distance: '1.4 km', duration: '45 min', pay: '$8.200', time: '15:30' },
  { id: 3, img: U('1587300003388-59208cc962cb'), owner: 'Pedro', dog: 'Nina', breed: 'Caniche', distance: '2.1 km', duration: '30 min', pay: '$6.500', time: '16:00' },
];

export type ItemHistorial = { day: string; dog: string; img: string; duration: string; distance: string; pace: string; person: string; gross: string; fee: string; pay: string; time: string; status: 'Completado' | 'Cancelado'; review: string };
export const HISTORIAL: ItemHistorial[] = [
  { day: 'Hoy', dog: 'Toby', img: U('1552053831-71594a27632d', 120), duration: '30 min', distance: '2,3 km', pace: '13 min/km', person: 'Noah', gross: '$7.200', fee: '−$700', pay: '$6.500', time: '15:30', status: 'Completado', review: '' },
  { day: 'Ayer', dog: 'Luna', img: U('1583511655857-d19b40a7a54e', 120), duration: '60 min', distance: '4,1 km', pace: '14 min/km', person: 'Ana Gómez', gross: '$9.100', fee: '−$900', pay: '$8.200', time: '10:30', status: 'Completado', review: 'Muy puntual y atento con Luna. Mandó fotos durante todo el paseo.' },
  { day: 'Ayer', dog: 'Rocco', img: U('1517849845537-4d257902454a', 120), duration: '45 min', distance: '3,2 km', pace: '14 min/km', person: 'Lucía Paz', gross: '$8.100', fee: '−$800', pay: '$7.300', time: '18:00', status: 'Completado', review: 'Rocco volvió feliz y cansado. Lo recomiendo.' },
  { day: '28/05', dog: 'Nina', img: U('1587300003388-59208cc962cb', 120), duration: '30 min', distance: '—', pace: '—', person: 'Pedro Ruiz', gross: '$0', fee: '$0', pay: '$0', time: '16:00', status: 'Cancelado', review: '' },
];

export type Mensaje = { from: 'walker' | 'owner'; text: string; time: string };
export const MENSAJES_INICIALES: Mensaje[] = [
  { from: 'walker', text: 'Hola Noah, salgo hacia tu domicilio.', time: '16:40' },
  { from: 'owner', text: 'Perfecto, gracias.', time: '16:41' },
  { from: 'walker', text: 'Estoy llegando en 2 min.', time: '16:45' },
];
export const RESPUESTAS_RAPIDAS = ['Ya estoy en la puerta', 'Llego en 5 min', '¿Me pasás el código del edificio?'];

export const MOVIMIENTOS = [
  { title: 'Paseo con Toby', sub: 'Hoy 15:30', amount: '+$6.500', income: true, icon: 'mdi:paw' },
  { title: 'Paseo con Luna', sub: 'Ayer 10:30', amount: '+$8.200', income: true, icon: 'mdi:paw' },
  { title: 'Retiro a Mercado Pago', sub: 'Lun 09:12', amount: '−$30.000', income: false, icon: 'solar:arrow-right-up-linear' },
  { title: 'Propina de Ana Gómez', sub: 'Dom 18:40', amount: '+$1.000', income: true, icon: 'solar:hand-heart-bold' },
] as const;

export const BARRAS_SEMANA = [0.4, 0.65, 0.3, 0.8, 0.55, 0.95, 0.7];

export const PREGUNTAS: [string, string][] = [
  ['¿Cuándo se acreditan mis pagos?', 'Cada paseo se libera 24 h después de finalizado. Desde Ganancias podés retirarlo sin comisión.'],
  ['¿Qué hago si el dueño no está?', 'Esperá hasta 10 minutos en el punto de retiro y usá el chat o la llamada. Si no responde, cancelá desde el paseo: cobrás el 50%.'],
  ['¿Cómo cancelo un paseo aceptado?', 'Desde el detalle del paseo. Más de 2 cancelaciones por semana bajan tu tasa de aceptación.'],
  ['¿Qué cubre el seguro?', 'Accidentes del perro y responsabilidad civil durante el paseo activo, con GPS encendido.'],
];

export const PREFERENCIAS = [
  ['push', 'Notificaciones push', 'Solicitudes, pagos y mensajes'],
  ['sound', 'Sonido de solicitudes', 'Alerta cuando llega un paseo'],
  ['location', 'Ubicación en segundo plano', 'Necesaria para el seguimiento GPS'],
  ['auto', 'Aceptar solicitudes recurrentes', 'De dueños con los que ya paseaste'],
] as const;

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/** Ruta del paseo activo (coordenadas 0–100 sobre el mapa). */
export const RUTA_PASEO: [number, number][] = [[14, 16], [46, 30], [30, 54], [62, 60], [84, 84]];
export function posicionMarcador(t: number) {
  const pts = RUTA_PASEO;
  const seg = t * (pts.length - 1);
  const i = Math.min(pts.length - 2, Math.floor(seg));
  const l = seg - i;
  const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
  return { x: ax + (bx - ax) * l, y: ay + (by - ay) * l };
}
