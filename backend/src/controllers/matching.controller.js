import MatchingService from '../services/matching.service.js'
import asyncHandler from '../utils/async-handler.js'
import HttpError from '../utils/http-error.js'

const MatchingController = {}

MatchingController.findWalkers = asyncHandler(async (req, res) => {
  const { latitude, longitude, startMinutes, durationMinutes, needs, maxDistanceKm } = req.body

  if (latitude == null || longitude == null) {
    throw new HttpError(400, 'latitude y longitude son obligatorios')
  }
  if (startMinutes == null || durationMinutes == null) {
    throw new HttpError(400, 'startMinutes y durationMinutes son obligatorios')
  }
  if (needs != null && !Array.isArray(needs)) {
    throw new HttpError(400, 'needs debe ser un array')
  }

  const candidates = await MatchingService.findWalkers({
    latitude,
    longitude,
    startMinutes,
    durationMinutes,
    needs,
    maxDistanceKm: maxDistanceKm ?? 5.0,
  })

  res.status(200).json(candidates)
})

export default MatchingController
