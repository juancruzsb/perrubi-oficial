import RecommendationsService from '../services/recommendations.service.js'
import asyncHandler from '../utils/async-handler.js'

const RecommendationsController = {}

RecommendationsController.getForCurrentUser = asyncHandler(async (req, res) => {
  const { topN } = req.query

  const recommendations = await RecommendationsService.recommendWalkersForUser(
    req.user.id,
    topN ? parseInt(topN) : undefined
  )

  res.status(200).json(recommendations)
})

export default RecommendationsController
