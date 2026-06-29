import AuthController from '../controllers/auth.controller.js'
import { Router } from 'express'

const router = Router();

router.post('/userRegister', AuthController.userRegister);
router.post('/walkerRegister', AuthController.walkerRegister);
router.post('/userLogin', AuthController.userLogin);
router.post('/walkerLogin', AuthController.walkerLogin);

export default router;