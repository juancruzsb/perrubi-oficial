import { Router } from 'express'
import AuthMiddlewares from '../middlewares/auth.middlewares.js'
import MatchingController from '../controllers/matching.controller.js'

const router = Router()

router.post('/walkers', AuthMiddlewares.verifyToken, AuthMiddlewares.verifyUser, MatchingController.findWalkers)

export default router
