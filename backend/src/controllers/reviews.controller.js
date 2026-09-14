import ReviewsService from '../services/reviews.service.js'
import asyncHandler from '../utils/async-handler.js'
import HttpError from '../utils/http-error.js'

const ReviewsController = {}

// Crear una reseña nueva. El grueso de las validaciones de "negocio"
// (¿participó del paseo?, ¿ya terminó?, ¿ya la calificó?) vive en el
// service; acá solo validamos que los datos tengan la forma correcta antes
// de mandarlos para adelante.
ReviewsController.createReview = asyncHandler(async (req, res) => {
  const { walkId, rating, comment } = req.body

  if (walkId == null) {
    throw new HttpError(400, 'walkId es obligatorio')
  }
  // Number.isInteger evita que manden 4.5 estrellas; el rango 1-5 es el
  // típico de una calificación con estrellas.
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new HttpError(400, 'rating debe ser un entero entre 1 y 5')
  }

  const result = await ReviewsService.createReview(req.user.id, {
    walkId: parseInt(walkId),
    rating,
    comment,
  })

  // 201 = "Created" (se creó algo nuevo), a diferencia del 200 genérico.
  res.status(201).json(result)
})

// Resumen de rating de un paseador puntual: GET /reviews/walker/5
ReviewsController.getWalkerRating = asyncHandler(async (req, res) => {
  const summary = await ReviewsService.getWalkerRatingSummary(parseInt(req.params.walkerId))
  res.status(200).json(summary)
})

// Listado de paseadores con mala calificación, para administración.
ReviewsController.getLowQualityWalkers = asyncHandler(async (req, res) => {
  const { threshold, minReviews } = req.query

  const flagged = await ReviewsService.flagLowQualityWalkers(
    threshold ? parseFloat(threshold) : undefined,
    minReviews ? parseInt(minReviews) : undefined
  )

  res.status(200).json(flagged)
})

export default ReviewsController
