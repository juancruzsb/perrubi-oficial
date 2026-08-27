import { Router } from 'express'
import AuthMiddlewares from '../middlewares/auth.middlewares.js'
import ReviewsController from '../controllers/reviews.controller.js'

const router = Router()

router.post('/', AuthMiddlewares.verifyToken, AuthMiddlewares.verifyUser, ReviewsController.createReview)
router.get('/low-quality', AuthMiddlewares.verifyToken, AuthMiddlewares.verifyAdmin, ReviewsController.getLowQualityWalkers)
router.get('/walker/:walkerId', AuthMiddlewares.verifyToken, ReviewsController.getWalkerRating)

export default router
