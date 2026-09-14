import RecommendationsService from '../services/recommendations.service.js'
import asyncHandler from '../utils/async-handler.js'

const RecommendationsController = {}

// A diferencia de matching, acá no hace falta que el frontend mande nada en
// el body: el usuario ya está identificado por su token (req.user.id, que
// puso AuthMiddlewares.verifyToken al decodificar el token). Solo se puede
// pedir opcionalmente cuántos resultados querés con ?topN=10 en la URL.
RecommendationsController.getForCurrentUser = asyncHandler(async (req, res) => {
  const { topN } = req.query // req.query = parámetros después del "?" en la URL

  const recommendations = await RecommendationsService.recommendWalkersForUser(
    req.user.id,
    topN ? parseInt(topN) : undefined
  )

  res.status(200).json(recommendations)
})

export default RecommendationsController
