import 'dotenv/config'

import express from 'express';
import cors from 'cors';

import MapRoutes from './src/routes/maps.router.js'
import AuthRoutes from './src/routes/auth.router.js'
import DogsRoutes from './src/routes/dogs.router.js'
import WalksRoutes from './src/routes/walks.router.js'
import AddressesRoutes from './src/routes/addresses.router.js'
import notFoundMiddleware from './src/middlewares/not-found.middleware.js'
import errorMiddleware from './src/middlewares/error.middleware.js'

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
app.use('/addresses', AddressesRoutes)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})
