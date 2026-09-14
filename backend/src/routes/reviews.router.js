import { Router } from 'express'
import AuthMiddlewares from '../middlewares/auth.middlewares.js'
import ReviewsController from '../controllers/reviews.controller.js'

const router = Router()

// Crear una reseña: hay que estar logueado como usuario (no como paseador).
router.post('/', AuthMiddlewares.verifyToken, AuthMiddlewares.verifyUser, ReviewsController.createReview)

// Panel de admin: solo cuentas con role === 'admin' pueden ver esto
// (verifyAdmin corta con error 403 si no lo sos).
router.get('/low-quality', AuthMiddlewares.verifyToken, AuthMiddlewares.verifyAdmin, ReviewsController.getLowQualityWalkers)

// Ver el rating de un paseador: alcanza con estar logueado (usuario o paseador).
router.get('/walker/:walkerId', AuthMiddlewares.verifyToken, ReviewsController.getWalkerRating)

export default router
