import MapsController from '../controllers/maps.controller.js'
import { Router } from 'express'
import AuthMiddlewares from '../middlewares/auth.middlewares.js'

const router = Router();

router.post('/route', AuthMiddlewares.verifyToken, MapsController.getRoute);
router.post('/directions', AuthMiddlewares.verifyToken, MapsController.getDirection);
router.get('/static', AuthMiddlewares.verifyTokenFromQuery, MapsController.getStaticMap);
// Sin auth: es solo la página del mapa, los datos del paseo se los manda la app por postMessage.
router.get('/embed', MapsController.getEmbed);

export default router;