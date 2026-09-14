import 'dotenv/config'

import http from 'http';
import express from 'express';
import cors from 'cors';

import MapRoutes from './src/routes/maps.router.js'
import AuthRoutes from './src/routes/auth.router.js'
import DogsRoutes from './src/routes/dogs.router.js'
import WalksRoutes from './src/routes/walks.router.js'
import AddressesRoutes from './src/routes/addresses.router.js'
import ChatRoutes from './src/routes/chat.router.js'
// Estas 3 rutas son las nuevas: conectan este backend con el microservicio
// de IA (matching de paseadores, recomendaciones y cálculos de reseñas).
import MatchingRoutes from './src/routes/matching.router.js'
import RecommendationsRoutes from './src/routes/recommendations.router.js'
import ReviewsRoutes from './src/routes/reviews.router.js'
import notFoundMiddleware from './src/middlewares/not-found.middleware.js'
import errorMiddleware from './src/middlewares/error.middleware.js'
import { initSockets } from './src/sockets/index.js'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: 'API funcionando'
  })
})

app.use('/maps', MapRoutes)
app.use('/auth', AuthRoutes)
app.use('/dogs', DogsRoutes)
app.use('/walks', WalksRoutes)
app.use('/walks', ChatRoutes)
app.use('/addresses', AddressesRoutes)
// app.use('/prefijo', router) le dice a Express: "toda URL que empiece con
// /matching va al MatchingRoutes", etc. Por eso POST /matching/walkers
// termina en matching.router.js.
app.use('/matching', MatchingRoutes)
app.use('/recommendations', RecommendationsRoutes)
app.use('/reviews', ReviewsRoutes)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

const httpServer = http.createServer(app);
initSockets(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})
