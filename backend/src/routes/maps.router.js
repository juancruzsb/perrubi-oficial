import MapsController from '../controllers/maps.controller.js'
import { Router } from 'express'
import AuthMiddlewares from '../middlewares/auth.middlewares.js'

const router = Router();

router.post('/route', AuthMiddlewares.verifyToken, MapsController.getRoute);
router.post('/directions', AuthMiddlewares.verifyToken, MapsController.getDirection);

export default router;