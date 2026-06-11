import 'dotenv/config'

import express from 'express';
import cors from 'cors';

import MapRoutes from './src/routes/maps.router.js'
import AuthRoutes from './src/routes/auth.router.js'

const app = express();

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: 'API de mapas funcionando'
  })
})

app.use('/maps', MapRoutes)
app.use('/auth', AuthRoutes)

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT}`)
})