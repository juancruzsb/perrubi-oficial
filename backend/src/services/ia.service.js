import axios from 'axios'

// Cliente para el microservicio de IA (Perrubi- Parte IA, FastAPI), que expone
// matching de paseadores, recomendaciones y cálculos sobre reseñas. Es sin
// estado: el back le manda los datos ya armados desde Postgres y recibe el
// resultado calculado, igual que MapsService hace contra la API de Google.
const IA_BASE_URL = process.env.IA_API_URL || 'http://127.0.0.1:8000'

const iaClient = axios.create({ baseURL: IA_BASE_URL })

const IAService = {}

IAService.matchWalkers = async (request) => {
  const { data } = await iaClient.post('/matching/walkers', request)
  return data
}

IAService.recommendWalkers = async (request) => {
  const { data } = await iaClient.post('/recommendations/walkers', request)
  return data
}

IAService.computeWalkerRating = async (walkerId, reviews) => {
  const { data } = await iaClient.post('/reviews/rating', { walker_id: walkerId, reviews })
  return data
}

IAService.flagLowQualityWalkers = async (reviews, threshold, minReviews) => {
  const { data } = await iaClient.post('/reviews/flag-low-quality', {
    reviews,
    threshold,
    min_reviews: minReviews,
  })
  return data
}

IAService.detectNegativeSignals = async (comment) => {
  const { data } = await iaClient.post('/reviews/negative-signals', { comment })
  return data.signals
}

export default IAService
