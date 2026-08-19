import { Router } from 'express'
import AuthMiddlewares from '../middlewares/auth.middlewares.js'
import AddressesController from '../controllers/addresses.controller.js'

const router = Router();

router.get('/', AuthMiddlewares.verifyToken, AuthMiddlewares.verifyUser, AddressesController.getMyAddresses)
router.post('/', AuthMiddlewares.verifyToken, AuthMiddlewares.verifyUser, AddressesController.createAddress)
router.put('/:id', AuthMiddlewares.verifyToken, AuthMiddlewares.verifyUser, AddressesController.updateAddress)
router.delete('/:id', AuthMiddlewares.verifyToken, AuthMiddlewares.verifyUser, AddressesController.deleteAddress)

export default router;
