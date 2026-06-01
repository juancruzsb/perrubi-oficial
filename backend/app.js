import 'dotenv/config'

import express from 'express';
import cors from 'cors';


import MapRoutes from './routes/maps.router.js'

const app = express();

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: 'API de mapas funcionando'
  })
})

app.use('/maps', MapRoutes)

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT}`)
})