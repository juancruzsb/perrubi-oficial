import prisma from '../../db.js'
import HttpError from '../utils/http-error.js'
import IAService from './ia.service.js'

const ReviewsService = {}

const toIAShape = (reviews) => reviews.map((review) => ({
  walker_id: review.walkerId,
  rating: review.rating,
  comment: review.comment || '',
}))

// Recalcula el promedio/cantidad de un paseador contra todas sus reseñas en
// Postgres (vía reviews.py/compute_walker_rating) y persiste el resultado en
// Walker.averageRating/reviewCount, que ya existían pero nadie los escribía.
ReviewsService.recomputeWalkerRating = async (walkerId) => {
  const walkerReviews = await prisma.review.findMany({ where: { walkerId } })
  const summary = await IAService.computeWalkerRating(walkerId, toIAShape(walkerReviews))

  await prisma.walker.update({
    where: { id: walkerId },
    data: { averageRating: summary.average, reviewCount: summary.count },
  })

  return summary
}

ReviewsService.createReview = async (userId, { walkId, rating, comment }) => {
  const walk = await prisma.walk.findUnique({ where: { id: walkId } })
  if (!walk) {
    throw new HttpError(404, 'Paseo no encontrado')
  }

  const participates = await prisma.walkUser.findFirst({ where: { walkId, userId } })
  if (!participates) {
    throw new HttpError(403, 'No participás de este paseo')
  }

  if (walk.status !== 'finished') {
    throw new HttpError(400, 'Solo se puede calificar un paseo finalizado')
  }

  const existing = await prisma.review.findUnique({ where: { walkId } })
  if (existing) {
    throw new HttpError(409, 'Este paseo ya tiene una reseña')
  }

  const review = await prisma.review.create({
    data: { walkId, walkerId: walk.walkerId, userId, rating, comment: comment || null },
  })

  const [ratingSummary, negativeSignals] = await Promise.all([
    ReviewsService.recomputeWalkerRating(walk.walkerId),
    comment ? IAService.detectNegativeSignals(comment) : Promise.resolve([]),
  ])

  return { review, ratingSummary, negativeSignals }
}

ReviewsService.getWalkerRatingSummary = async (walkerId) => {
  const reviews = await prisma.review.findMany({
    where: { walkerId },
    orderBy: { createdAt: 'desc' },
  })
  const summary = await IAService.computeWalkerRating(walkerId, toIAShape(reviews))
  return { ...summary, reviews }
}

ReviewsService.flagLowQualityWalkers = async (threshold, minReviews) => {
  const reviews = await prisma.review.findMany()
  return IAService.flagLowQualityWalkers(toIAShape(reviews), threshold, minReviews)
}

export default ReviewsService
