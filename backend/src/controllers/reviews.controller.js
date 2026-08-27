import ReviewsService from '../services/reviews.service.js'
import asyncHandler from '../utils/async-handler.js'
import HttpError from '../utils/http-error.js'

const ReviewsController = {}

ReviewsController.createReview = asyncHandler(async (req, res) => {
  const { walkId, rating, comment } = req.body

  if (walkId == null) {
    throw new HttpError(400, 'walkId es obligatorio')
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new HttpError(400, 'rating debe ser un entero entre 1 y 5')
  }

  const result = await ReviewsService.createReview(req.user.id, {
    walkId: parseInt(walkId),
    rating,
    comment,
  })

  res.status(201).json(result)
})

ReviewsController.getWalkerRating = asyncHandler(async (req, res) => {
  const summary = await ReviewsService.getWalkerRatingSummary(parseInt(req.params.walkerId))
  res.status(200).json(summary)
})

ReviewsController.getLowQualityWalkers = asyncHandler(async (req, res) => {
  const { threshold, minReviews } = req.query

  const flagged = await ReviewsService.flagLowQualityWalkers(
    threshold ? parseFloat(threshold) : undefined,
    minReviews ? parseInt(minReviews) : undefined
  )

  res.status(200).json(flagged)
})

export default ReviewsController
