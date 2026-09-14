import MatchingService from '../services/matching.service.js'
import asyncHandler from '../utils/async-handler.js'
import HttpError from '../utils/http-error.js'

// Un "controller" es la capa que recibe el pedido HTTP (req = lo que llegó,
// res = lo que respondemos), revisa que los datos vengan bien, y le pasa el
// trabajo pesado al "service". No habla con la base de datos ni con la IA
// directamente — de eso se encarga matching.service.js.
const MatchingController = {}

// asyncHandler envuelve la función para que, si algo explota adentro
// (ej. throw new HttpError), el error se maneje automáticamente en vez de
// tirar abajo el servidor entero.
MatchingController.findWalkers = asyncHandler(async (req, res) => {
  // req.body es el JSON que mandó quien hizo el pedido (el frontend, o
  // Postman/curl si lo estás probando a mano).
  const { latitude, longitude, startMinutes, durationMinutes, needs, maxDistanceKm } = req.body

  // Validaciones: si falta algo obligatorio, cortamos acá con un error 400
  // ("Bad Request" = "el pedido está mal armado") en vez de seguir y que
  // explote más adelante con un error más confuso.
  if (latitude == null || longitude == null) {
    throw new HttpError(400, 'latitude y longitude son obligatorios')
  }
  if (startMinutes == null || durationMinutes == null) {
    throw new HttpError(400, 'startMinutes y durationMinutes son obligatorios')
  }
  if (needs != null && !Array.isArray(needs)) {
    throw new HttpError(400, 'needs debe ser un array')
  }

  // Si todo vino bien, le pedimos al service que haga el trabajo real.
  const candidates = await MatchingService.findWalkers({
    latitude,
    longitude,
    startMinutes,
    durationMinutes,
    needs,
    maxDistanceKm: maxDistanceKm ?? 5.0, // si no mandaron radio máximo, 5 km por default
  })

  // 200 = "OK". Le devolvemos el resultado en formato JSON.
  res.status(200).json(candidates)
})

export default MatchingController
