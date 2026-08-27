import { Router } from 'express'
import AuthMiddlewares from '../middlewares/auth.middlewares.js'
import RecommendationsController from '../controllers/recommendations.controller.js'

const router = Router()

router.get('/walkers', AuthMiddlewares.verifyToken, AuthMiddlewares.verifyUser, RecommendationsController.getForCurrentUser)

export default router
