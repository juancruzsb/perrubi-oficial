import prisma from '../../db.js'
import HttpError from '../utils/http-error.js'
import IAService from './ia.service.js'

const RecommendationsService = {}

RecommendationsService.recommendWalkersForUser = async (userId, topN) => {
  const user = await prisma.user.findUnique({ where: { id: parseInt(userId) }, select: { likes: true } })
  if (!user) {
    throw new HttpError(404, 'Usuario no encontrado')
  }

  const walkers = await prisma.walker.findMany({ select: { id: true, firstName: true, lastName: true, tags: true } })
  const shapedWalkers = walkers.map((walker) => ({
    id: walker.id,
    name: [walker.firstName, walker.lastName].filter(Boolean).join(' ') || `Paseador ${walker.id}`,
    tags: walker.tags,
  }))

  return IAService.recommendWalkers({
    likes: user.likes,
    walkers: shapedWalkers,
    top_n: topN ?? 5,
  })
}

export default RecommendationsService
