import { Router } from 'express'
import AuthMiddlewares from '../middlewares/auth.middlewares.js'
import WalksController from '../controllers/walks.controller.js'

const router = Router();

router.get('/', AuthMiddlewares.verifyToken, AuthMiddlewares.verifyAdmin, WalksController.getAllWalks)
router.get('/me', AuthMiddlewares.verifyToken, WalksController.getMyWalks)
router.get('/available', AuthMiddlewares.verifyToken, AuthMiddlewares.verifyWalker, WalksController.getAvailableWalks)
router.get('/:id', AuthMiddlewares.verifyToken, WalksController.getWalkById)
router.post('/', AuthMiddlewares.verifyToken, AuthMiddlewares.verifyUser, WalksController.createWalk)
router.put('/:id', AuthMiddlewares.verifyToken, AuthMiddlewares.verifyUser, WalksController.updateWalk)
router.patch('/:id/accept', AuthMiddlewares.verifyToken, AuthMiddlewares.verifyWalker, WalksController.acceptWalk)
router.patch('/:id/status', AuthMiddlewares.verifyToken, WalksController.changeStatus)

export default router;
