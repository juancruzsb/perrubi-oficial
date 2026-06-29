import AuthMiddlewares from '../middlewares/auth.middlewares.js'
import { Router } from 'express'
import DogsController from '../controllers/dogs.controller.js'

const router = Router();

//router.get('/', AuthMiddlewares.verifyToken, AuthMiddlewares.verifyAdmin, DogsController.getAllDogs)
//router.get('/:id', AuthMiddlewares.verifyToken, DogsController.getDogByUser)
//router.post('/', AuthMiddlewares.verifyToken, AuthMiddlewares.verifyAdmin, DogsController.createDog)
//router.put('/:id', AuthMiddlewares.verifyToken, DogsController.updateDog)
//router.delete('/:id', AuthMiddlewares.verifyToken, DogsController.deleteDog)

export default router;