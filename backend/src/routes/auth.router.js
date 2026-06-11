import AuthController from '../controllers/auth.controller.js'
import { Router } from 'express'
import AuthMiddlewares from '../middlewares/auth.middlewares.js'

const router = Router();

router.post('/register', AuthController.register);
router.post('/userLogin', AuthController.userLogin);

export default router;