import prisma from '../../db.js'
import HttpError from '../utils/http-error.js'
import IAService from './ia.service.js'

const ReviewsService = {}

// Convierte las reseñas tal como están guardadas en Postgres (walkerId,
// rating, comment...) al formato que reviews.py espera (walker_id, rating,
// comment). Se usa en varias funciones de este archivo, por eso está
// separada acá arriba.
const toIAShape = (reviews) => reviews.map((review) => ({
  walker_id: review.walkerId,
  rating: review.rating,
  comment: review.comment || '',
}))

// Recalcula el promedio y la cantidad de reseñas de UN paseador puntual, y
// lo guarda en la tabla Walker (columnas averageRating/reviewCount, que ya
// existían pero antes nadie las actualizaba). Se llama cada vez que se crea
// una reseña nueva para ese paseador.
ReviewsService.recomputeWalkerRating = async (walkerId) => {
  const walkerReviews = await prisma.review.findMany({ where: { walkerId } })
  const summary = await IAService.computeWalkerRating(walkerId, toIAShape(walkerReviews))

  await prisma.walker.update({
    where: { id: walkerId },
    data: { averageRating: summary.average, reviewCount: summary.count },
  })

  return summary
}

// Crea una reseña nueva, con varias validaciones de negocio antes de guardar
// nada (por eso hay tantos "if" seguidos de throw).
ReviewsService.createReview = async (userId, { walkId, rating, comment }) => {
  // 1) ¿Existe ese paseo?
  const walk = await prisma.walk.findUnique({ where: { id: walkId } })
  if (!walk) {
    throw new HttpError(404, 'Paseo no encontrado')
  }

  // 2) ¿El usuario que está calificando fue parte de ese paseo? (evita que
  // cualquiera pueda calificar paseos ajenos).
  const participates = await prisma.walkUser.findFirst({ where: { walkId, userId } })
  if (!participates) {
    throw new HttpError(403, 'No participás de este paseo')
  }

  // 3) ¿El paseo ya terminó? No tiene sentido calificar algo que sigue en
  // curso o que se canceló.
  if (walk.status !== 'finished') {
    throw new HttpError(400, 'Solo se puede calificar un paseo finalizado')
  }

  // 4) ¿Ya existe una reseña para este paseo puntual? Un paseo se califica
  // una sola vez.
  const existing = await prisma.review.findUnique({ where: { walkId } })
  if (existing) {
    throw new HttpError(409, 'Este paseo ya tiene una reseña')
  }

  // Si pasó todas las validaciones, recién ahí se guarda en la base.
  const review = await prisma.review.create({
    data: { walkId, walkerId: walk.walkerId, userId, rating, comment: comment || null },
  })

  // Después de guardar, hacemos dos cosas más, al mismo tiempo
  // (Promise.all las corre en paralelo en vez de una después de la otra,
  // para que sea más rápido):
  //   a) recalcular el promedio del paseador con la reseña nueva incluida
  //   b) si vino un comentario, pedirle a la IA que detecte palabras clave
  //      negativas (ej. "tarde", "sucio")
  const [ratingSummary, negativeSignals] = await Promise.all([
    ReviewsService.recomputeWalkerRating(walk.walkerId),
    comment ? IAService.detectNegativeSignals(comment) : Promise.resolve([]),
  ])

  return { review, ratingSummary, negativeSignals }
}

// Trae todas las reseñas de un paseador + su resumen (promedio/cantidad)
// recalculado en el momento contra la IA.
ReviewsService.getWalkerRatingSummary = async (walkerId) => {
  const reviews = await prisma.review.findMany({
    where: { walkerId },
    orderBy: { createdAt: 'desc' }, // las más nuevas primero
  })
  const summary = await IAService.computeWalkerRating(walkerId, toIAShape(reviews))
  return { ...summary, reviews }
}

// Para un futuro panel de administración: trae TODAS las reseñas de TODOS
// los paseadores y le pregunta a la IA cuáles están por debajo del umbral
// mínimo de calidad.
ReviewsService.flagLowQualityWalkers = async (threshold, minReviews) => {
  const reviews = await prisma.review.findMany()
  return IAService.flagLowQualityWalkers(toIAShape(reviews), threshold, minReviews)
}

export default ReviewsService
