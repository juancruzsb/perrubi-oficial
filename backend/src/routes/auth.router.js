import AuthController from '../controllers/auth.controller.js'
import { Router } from 'express'
import AuthMiddlewares from '../middlewares/auth.middlewares.js'

const router = Router();

router.post('/userRegister', AuthController.userRegister);
router.post('/walkerRegister', AuthController.walkerRegister);
router.post('/userLogin', AuthController.userLogin);
router.post('/walkerLogin', AuthController.walkerLogin);

router.get('/me', AuthMiddlewares.verifyToken, AuthController.getMe);
router.put('/me', AuthMiddlewares.verifyToken, AuthController.updateMe);
router.put('/me/password', AuthMiddlewares.verifyToken, AuthController.updateMyPassword);

export default router;
