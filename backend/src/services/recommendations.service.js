import prisma from '../../db.js'
import HttpError from '../utils/http-error.js'
import IAService from './ia.service.js'

const RecommendationsService = {}

// Recomienda paseadores para un usuario puntual, según sus "likes"
// (preferencias guardadas en la base) comparadas con los "tags"
// (especialidades) de cada paseador.
RecommendationsService.recommendWalkersForUser = async (userId, topN) => {
  // Buscamos únicamente el campo "likes" del usuario (select evita traer
  // datos de más, como el email o la contraseña, que acá no hacen falta).
  const user = await prisma.user.findUnique({ where: { id: parseInt(userId) }, select: { likes: true } })
  if (!user) {
    throw new HttpError(404, 'Usuario no encontrado')
  }

  // Traemos todos los paseadores, pero solo los campos que recommender.py
  // necesita: id, nombre y tags.
  const walkers = await prisma.walker.findMany({ select: { id: true, firstName: true, lastName: true, tags: true } })
  const shapedWalkers = walkers.map((walker) => ({
    id: walker.id,
    name: [walker.firstName, walker.lastName].filter(Boolean).join(' ') || `Paseador ${walker.id}`,
    tags: walker.tags,
  }))

  // Le pasamos los likes del usuario + la lista de paseadores a la IA, que
  // devuelve los que mejor matchean, ordenados por cantidad de coincidencias.
  return IAService.recommendWalkers({
    likes: user.likes,
    walkers: shapedWalkers,
    top_n: topN ?? 5, // si no piden una cantidad puntual, devolvemos 5
  })
}

export default RecommendationsService
