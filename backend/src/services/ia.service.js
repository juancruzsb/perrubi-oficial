// "axios" es una librería para hacer pedidos HTTP (como cuando un navegador
// pide una página web, pero desde código). La usamos para que este backend
// (Node) le hable a tu otro proyecto (Python/FastAPI), que corre aparte.
import axios from 'axios'

// Este archivo es el ÚNICO lugar del backend que sabe que existe el servicio
// de IA en Python. Todo lo demás (matching, recommendations, reviews) le
// pide cosas a ESTE archivo, nunca llama a Python directamente. Así, si el
// día de mañana cambia el puerto, el lenguaje, o lo que sea del lado de la
// IA, solo hay que tocar este archivo.
//
// IA_API_URL es una variable de entorno (se configura en el archivo .env,
// que no se sube a GitHub). Si no está definida, usa localhost:8000 por
// default, que es donde corre tu servidor de FastAPI cuando lo levantás con
// "python -m uvicorn api:app --port 8000".
const IA_BASE_URL = process.env.IA_API_URL || 'http://127.0.0.1:8000'

// Creamos un "cliente" de axios ya configurado con la URL base, para no
// tener que escribirla en cada pedido.
const iaClient = axios.create({ baseURL: IA_BASE_URL })

// IAService es un objeto que agrupa todas las funciones que hablan con la
// IA. Cada función de acá abajo corresponde a UNO de los endpoints que
// definiste en api.py (FastAPI).
const IAService = {}

// Le manda a Python la ubicación, horario y lista de paseadores candidatos,
// y recibe de vuelta esa lista ordenada de mejor a peor candidato
// (usa match_walker_to_request de matching.py).
IAService.matchWalkers = async (request) => {
  const { data } = await iaClient.post('/matching/walkers', request)
  return data
}

// Le manda los gustos del usuario ("likes") y la lista de paseadores, y
// recibe los paseadores recomendados según coincidencia de tags
// (usa recommend_for_user de recommender.py).
IAService.recommendWalkers = async (request) => {
  const { data } = await iaClient.post('/recommendations/walkers', request)
  return data
}

// Le manda todas las reseñas de un paseador puntual y recibe el promedio y
// la cantidad calculados (usa compute_walker_rating de reviews.py).
IAService.computeWalkerRating = async (walkerId, reviews) => {
  const { data } = await iaClient.post('/reviews/rating', { walker_id: walkerId, reviews })
  return data
}

// Le manda TODAS las reseñas de TODOS los paseadores y recibe cuáles están
// por debajo del promedio mínimo aceptable (usa flag_low_quality_walkers).
// Pensado para un futuro panel de administración.
IAService.flagLowQualityWalkers = async (reviews, threshold, minReviews) => {
  const { data } = await iaClient.post('/reviews/flag-low-quality', {
    reviews,
    threshold,
    min_reviews: minReviews,
  })
  return data
}

// Le manda el texto de un comentario y recibe qué palabras clave negativas
// detectó adentro (ej. "tarde", "sucio") (usa detect_negative_signals).
IAService.detectNegativeSignals = async (comment) => {
  const { data } = await iaClient.post('/reviews/negative-signals', { comment })
  return data.signals
}

// "export default" permite que otros archivos hagan
// import IAService from './ia.service.js' y usen estas funciones.
export default IAService
