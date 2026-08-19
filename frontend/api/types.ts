// api/types.ts
// Tipos compartidos entre los módulos de api/, calcados de las respuestas
// REALES del backend (ver INTEGRACION-BACKEND-FRONTEND.md). Viven en un
// archivo aparte para que dogs.ts/walks.ts/addresses.ts no tengan que
// importarse entre sí.

// ─── AUTH / USER ──────────────────────────────────────────────
// Modelo real (prisma/schema.prisma): NO tiene "name", "createdAt" ni
// "review" — esos campos eran una invención del api/auth.ts anterior.
// passwordHash nunca llega: auth.controller.js lo saca con stripPassword.
export type User = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string | null; // 'admin' | 'user' | null
  phone: string | null;
};

// ─── DOGS ─────────────────────────────────────────────────────
// weight es Decimal? en Prisma → llega como STRING en el JSON, no número.
export type Dog = {
  id: number;
  name: string;
  age: number | null;
  breed: string | null;
  gender: string | null;
  weight: string | null;
  extraNotes: string | null;
  photo: string | null;
  review: string | null;
};

// Fila de la tabla puente user_dog — así vuelve POST /dogs (include:{users:true}).
export type UserDogRow = { id: number; userId: number; dogId: number };

// ─── ADDRESSES ────────────────────────────────────────────────
export type Address = {
  id: number;
  userId: number;
  label: string | null;
  street: string | null;
  number: string | null;
  floorApt: string | null;
  city: string | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
};

// ─── WALKS ────────────────────────────────────────────────────
export type WalkStatus = 'searching' | 'accepted' | 'in_progress' | 'finished' | 'canceled';

// averageRating es Decimal? → STRING.
export type WalkWalker = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  averageRating: string | null;
  profilePicture: string | null;
  description: string | null;
  reviewCount: number | null;
};

// walk.dogs y walk.users son FILAS DE JOIN (WalkDog/WalkUser), no arrays
// planos de Dog/User. Para sacar los perros de un paseo: walk.dogs.map(wd => wd.dog).
export type WalkDogRow = { id: number; walkId: number; dogId: number; dog: Dog };
export type WalkUserRow = {
  id: number;
  walkId: number;
  userId: number;
  user: { id: number; firstName: string | null; lastName: string | null };
};

export type Walk = {
  id: number;
  walkerId: number | null;
  walker: WalkWalker | null;
  walkType: string | null; // 'individual' | 'group'
  status: WalkStatus | null;
  price: string | null; // Decimal? → STRING
  startTime: string | null; // ISO
  duration: number | null; // minutos
  endTime: string | null; // ISO
  createdAt: string; // ISO
  notes: string | null;
  addressId: number | null;
  address: Address | null;
  dogs: WalkDogRow[];
  users: WalkUserRow[];
};

// ─── CHAT ─────────────────────────────────────────────────────
// Calcados de chat.service.js. Los sockets del backend son read-only: los
// mensajes se mandan siempre por POST /walks/:id/chat/messages, nunca por
// socket — ver api/chat.ts y hooks/use-chat.ts.
export type ChatMessage = {
  id: number;
  chatId: number;
  senderType: 'user' | 'walker';
  senderId: number;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type Chat = {
  id: number;
  walkId: number;
  status: 'open' | 'closed';
  createdAt: string;
  closedAt: string | null;
  messages: ChatMessage[]; // orden ascendente (el back ya hace .reverse())
};
