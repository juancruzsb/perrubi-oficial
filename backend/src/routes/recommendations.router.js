import { Router } from 'express'
import AuthMiddlewares from '../middlewares/auth.middlewares.js'
import RecommendationsController from '../controllers/recommendations.controller.js'

const router = Router()

// GET /recommendations/walkers — hay que estar logueado como usuario.
router.get('/walkers', AuthMiddlewares.verifyToken, AuthMiddlewares.verifyUser, RecommendationsController.getForCurrentUser)

export default router
