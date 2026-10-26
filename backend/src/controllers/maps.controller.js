import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import MapsService from '../services/maps.service.js'
import asyncHandler from '../utils/async-handler.js'
import HttpError from '../utils/http-error.js'
import { toFloatOrNull, toIntOrNull } from '../utils/sanitize.js'

const MapsController = {}

// Límites del proxy de mapa estático: sin esto, GET /maps/static es una
// palanca para quemar la cuota de Maps con imágenes gigantes o muy pedidas.
const MIN_ZOOM = 12;
const MAX_ZOOM = 18;
const DEFAULT_ZOOM = 16;
const MAX_SIZE = 640; // límite real de la Maps Static API en el plan gratuito
const DEFAULT_SIZE = 320;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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

MapsController.getStaticMap = asyncHandler(async (req, res) => {
    const latitude = toFloatOrNull(req.query.lat)
    const longitude = toFloatOrNull(req.query.lng)

    if (latitude === null || longitude === null) {
        throw new HttpError(400, 'lat y lng son obligatorios')
    }

    const zoom = clamp(toIntOrNull(req.query.zoom) ?? DEFAULT_ZOOM, MIN_ZOOM, MAX_ZOOM)
    const width = clamp(toIntOrNull(req.query.width) ?? DEFAULT_SIZE, 100, MAX_SIZE)
    const height = clamp(toIntOrNull(req.query.height) ?? DEFAULT_SIZE, 100, MAX_SIZE)

    const { buffer, contentType } = await MapsService.getStaticMap({ latitude, longitude, zoom, width, height })

    res.set('Cache-Control', 'private, max-age=60')
    res.type(contentType)
    res.send(Buffer.from(buffer))
})

// Plantilla de la página del mapa interactivo (Maps JavaScript API). Se lee una
// sola vez al arrancar; la key se inyecta en cada request por si cambia el env.
const EMBED_TEMPLATE = readFileSync(
    fileURLToPath(new URL('../views/walk-map.html', import.meta.url)),
    'utf8'
)

MapsController.getEmbed = (req, res) => {
    const key = process.env.API_KEY_MAPS_JS
    if (!key) {
        throw new HttpError(503, 'API_KEY_MAPS_JS no está configurada en el backend')
    }

    res.set('Cache-Control', 'no-store')
    res.type('html').send(EMBED_TEMPLATE.replace('__MAPS_JS_KEY__', encodeURIComponent(key)))
}

export default MapsController
