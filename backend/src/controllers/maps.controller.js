import MapsService from '../services/maps.service.js'
import asyncHandler from '../utils/async-handler.js'
import HttpError from '../utils/http-error.js'

const MapsController = {}

MapsController.getRoute = asyncHandler(async (req, res) => {
  const { origin, destination, intermediates } = req.body

  if (!origin || !destination) {
    throw new HttpError(400, 'Origin and destination are required')
  }

  if (intermediates && !Array.isArray(intermediates)) {
    throw new HttpError(400, 'intermediates must be an array')
  }

  const route = await MapsService.getRoute({ origin, destination, intermediates })
  res.json(route)
})

MapsController.getDirection = asyncHandler(async (req, res) => {
    const { textQuery } = req.body

    if (!textQuery) {
        throw new HttpError(400, 'textQuery is required')
    }

    const directions = await MapsService.getDirection({ textQuery })
    res.json(directions)
})

export default MapsController
