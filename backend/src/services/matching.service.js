// "prisma" es el objeto que nos deja hablar con la base de datos Postgres sin
// escribir SQL a mano (ej: prisma.walker.findMany(...) = "traeme todos los
// paseadores"). Está configurado en backend/db.js.
import prisma from '../../db.js'
import IAService from './ia.service.js'

const MatchingService = {}

// Esta función hace 3 cosas, en orden:
//   1) Busca en la base de datos los paseadores que sirven como candidatos.
//   2) Los transforma al formato exacto que matching.py espera recibir.
//   3) Le pide a la IA que los ordene de mejor a peor y devuelve ese resultado.
MatchingService.findWalkers = async ({ latitude, longitude, startMinutes, durationMinutes, needs, maxDistanceKm }) => {
  // Traemos de la base solo los paseadores que tengan ubicación cargada
  // (latitude/longitude no nulos), junto con sus franjas horarias
  // disponibles (availability), que están en una tabla aparte.
  const walkers = await prisma.walker.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
    include: { availability: true },
  })

  // matching.py no entiende los nombres de campos de Prisma (walkerId,
  // startMinute, etc.), espera un formato específico en inglés/snake_case.
  // Acá "traducimos" cada paseador de la base al formato que él necesita.
  const shapedWalkers = walkers.map((walker) => ({
    id: walker.id,
    name: [walker.firstName, walker.lastName].filter(Boolean).join(' ') || `Paseador ${walker.id}`,
    location: [walker.latitude, walker.longitude],
    tags: walker.tags,
    rating: walker.averageRating != null ? Number(walker.averageRating) : 0,
    // Cada franja disponible pasa de {startMinute, endMinute} a [start, end].
    available_slots: walker.availability.map((slot) => [slot.startMinute, slot.endMinute]),
  }))

  // Llamamos al servicio de IA (que a su vez llama a tu API de Python) con
  // todo ya armado, y devolvemos directamente lo que responda.
  return IAService.matchWalkers({
    location: [latitude, longitude],
    start_time: startMinutes,
    duration_minutes: durationMinutes,
    needs: needs || [],
    walkers: shapedWalkers,
    max_distance_km: maxDistanceKm,
  })
}

export default MatchingService
