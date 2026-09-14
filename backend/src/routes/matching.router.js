import { Router } from 'express'
import AuthMiddlewares from '../middlewares/auth.middlewares.js'
import MatchingController from '../controllers/matching.controller.js'

// Un "router" define qué URL dispara qué controller. Este archivo, sumado
// a la línea `app.use('/matching', MatchingRoutes)` en app.js, arma la ruta
// completa: POST /matching/walkers.
const router = Router()

// Antes de llegar a MatchingController.findWalkers, pasa por dos filtros:
//  - verifyToken: exige que venga un token de sesión válido (estar logueado).
//  - verifyUser: exige que la cuenta sea de tipo "usuario dueño de perro",
//    no de tipo "paseador" (son los que buscan un paseador, no al revés).
router.post('/walkers', AuthMiddlewares.verifyToken, AuthMiddlewares.verifyUser, MatchingController.findWalkers)

export default router
