import prisma from '../../db.js'
import IAService from './ia.service.js'

const MatchingService = {}

MatchingService.findWalkers = async ({ latitude, longitude, startMinutes, durationMinutes, needs, maxDistanceKm }) => {
  const walkers = await prisma.walker.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
    include: { availability: true },
  })

  const shapedWalkers = walkers.map((walker) => ({
    id: walker.id,
    name: [walker.firstName, walker.lastName].filter(Boolean).join(' ') || `Paseador ${walker.id}`,
    location: [walker.latitude, walker.longitude],
    tags: walker.tags,
    rating: walker.averageRating != null ? Number(walker.averageRating) : 0,
    available_slots: walker.availability.map((slot) => [slot.startMinute, slot.endMinute]),
  }))

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
