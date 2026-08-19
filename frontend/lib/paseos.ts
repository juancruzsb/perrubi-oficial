// lib/paseos.ts
// Helpers de PRESENTACIÓN (fechas, agrupación, texto) compartidos por las
// pantallas de paseos. Viven acá y no en api/ porque api/ es solo HTTP
// (ver frontend/CLAUDE.md) — la única transformación de shape que vive ahí
// es dogsOf() en api/walks.ts, porque desenvuelve la respuesta real del back.
import type { Walk, WalkStatus } from '../api/types';
import type { Ionicons } from '@expo/vector-icons';

// ─── FECHAS ───────────────────────────────────────────────────

// Fecha "de referencia" de un paseo: la hora agendada si existe, si no
// cuándo se creó. Mismo criterio que ya usa (tabs)/index.tsx.
export function fechaDePaseo(w: Walk): Date {
  return new Date(w.startTime ?? w.createdAt);
}

// aaaammdd en hora LOCAL — comparar por día calendario, nunca por diferencia
// de milisegundos (eso marcaría "Hoy" a las 23:00 de ayer).
function ymd(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function etiquetaFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return 'Fecha desconocida';

  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);

  if (ymd(fecha) === ymd(hoy)) return 'Hoy';
  if (ymd(fecha) === ymd(ayer)) return 'Ayer';

  const dd = String(fecha.getDate()).padStart(2, '0');
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  if (fecha.getFullYear() !== hoy.getFullYear()) {
    return `${dd}/${mm}/${String(fecha.getFullYear()).slice(2)}`;
  }
  return `${dd}/${mm}`;
}

export function horaCorta(iso: string | null): string {
  if (!iso) return '--:--';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '--:--';
  return `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
}

export function agruparPorFecha(walks: Walk[]): { fecha: string; paseos: Walk[] }[] {
  // Se ordena explícitamente por fechaDePaseo (no por createdAt, que es lo
  // que ya trae GET /walks/me): un paseo agendado a futuro desordenaría los
  // grupos si solo confiáramos en el orden del backend.
  const ordenados = [...walks].sort(
    (a, b) => fechaDePaseo(b).getTime() - fechaDePaseo(a).getTime()
  );

  const grupos = new Map<string, Walk[]>();
  for (const w of ordenados) {
    const etiqueta = etiquetaFecha(w.startTime ?? w.createdAt);
    const lista = grupos.get(etiqueta);
    if (lista) lista.push(w);
    else grupos.set(etiqueta, [w]);
  }
  return Array.from(grupos.entries()).map(([fecha, paseos]) => ({ fecha, paseos }));
}

// ─── PASEADOR / RATING ────────────────────────────────────────

export function nombrePaseador(walk: Walk): string | null {
  if (!walk.walker) return null;
  return [walk.walker.firstName, walk.walker.lastName].filter(Boolean).join(' ') || 'Paseador';
}

// averageRating es Decimal? en Prisma → llega como STRING, no number.
export function ratingNumero(v: string | null | undefined): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ─── TIEMPO TRANSCURRIDO ──────────────────────────────────────

export function minutosTranscurridos(desdeIso: string | null): number | null {
  if (!desdeIso) return null;
  const inicio = Date.parse(desdeIso);
  if (Number.isNaN(inicio)) return null;
  return Math.max(0, Math.floor((Date.now() - inicio) / 60000));
}

// ─── ESTADO → PRESENTACIÓN (mis-paseos.tsx: 5 estados, 3 filtros) ─────

export type PresentacionEstado = {
  etiqueta: string;
  color: string;
  fondo: string; // fondo suave del círculo de ícono, a juego con `color`
  icono: keyof typeof Ionicons.glyphMap;
};

const GREEN = '#4caf50';
const GREEN_LIGHT = '#eaf7eb';
const ORANGE = '#f5a623';
const ORANGE_LIGHT = '#fdf1de';
const RED = '#ef4444';
const RED_LIGHT = '#fde8e8';
const GRAY = '#9a9f9a';
const GRAY_LIGHT = '#eceeec';

export function presentacionEstado(status: WalkStatus | null): PresentacionEstado {
  switch (status) {
    case 'searching':
      return { etiqueta: 'En búsqueda', color: ORANGE, fondo: ORANGE_LIGHT, icono: 'time-outline' };
    case 'accepted':
      return { etiqueta: 'Confirmado', color: GREEN, fondo: GREEN_LIGHT, icono: 'checkmark-circle' };
    case 'in_progress':
      return { etiqueta: 'En curso', color: GREEN, fondo: GREEN_LIGHT, icono: 'walk' };
    case 'finished':
      return { etiqueta: 'Completado', color: GREEN, fondo: GREEN_LIGHT, icono: 'location' };
    case 'canceled':
      return { etiqueta: 'Cancelado', color: RED, fondo: RED_LIGHT, icono: 'close-circle' };
    default:
      return { etiqueta: 'Sin estado', color: GRAY, fondo: GRAY_LIGHT, icono: 'help-circle-outline' };
  }
}

// ─── CHAT: qué paseo abrir ────────────────────────────────────
// chat.tsx es tab global Y destino de push (con ?walkId=) a la vez — el
// param es una PISTA, no la verdad: se re-resuelve contra getMyWalks() en
// cada focus para no quedarse pegado a un walkId viejo si el usuario
// después toca la tab a secas.
export function elegirPaseoDeChat(walks: Walk[], preferidoId?: number): Walk | null {
  // Un paseo tiene chat sí y solo sí tiene paseador asignado: el Chat se
  // crea recién dentro de la transacción de PATCH /walks/:id/accept.
  const chateables = walks.filter((w) => w.walkerId != null);
  const activos = chateables.filter((w) => w.status === 'accepted' || w.status === 'in_progress');

  if (preferidoId != null) {
    const preferido = chateables.find((w) => w.id === preferidoId);
    // Permite abrir (en solo lectura) el chat de un paseo ya finalizado
    // cuando se llega con un walkId explícito desde detalles_del_paseo.
    if (preferido) return preferido;
  }
  return activos[0] ?? null; // GET /walks/me ya viene ordenado createdAt desc
}

export function hayPaseoBuscando(walks: Walk[]): Walk | null {
  return walks.find((w) => w.status === 'searching') ?? null;
}

// Adónde navegar al tocar un paseo, según su estado actual. Solo necesita
// id + status, no un Walk completo — así también sirve desde vistas de
// presentación adaptadas (ej. PaseoReciente en (tabs)/index.tsx) que no
// guardan el objeto Walk original entero.
export function rutaDeWalk(walk: Pick<Walk, 'id' | 'status'>): { pathname: string; params: { walkId: string } } {
  const params = { walkId: String(walk.id) };
  switch (walk.status) {
    case 'searching':
      return { pathname: '/buscando_paseador', params };
    case 'accepted':
    case 'in_progress':
      return { pathname: '/paseo_en_curso', params };
    case 'finished':
    case 'canceled':
    default:
      return { pathname: '/detalles_del_paseo', params };
  }
}
