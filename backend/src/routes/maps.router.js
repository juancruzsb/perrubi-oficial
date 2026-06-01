import MapsController from '../controllers/maps.controller.js'
import { Router } from 'express'

const router = Router();

router.post('/route', MapsController.getRoute);
router.post('/directions', MapsController.getDirection);

export default router;