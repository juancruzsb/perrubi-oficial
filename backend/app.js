require('dotenv').config();

const express = require('express');
const cors = require('cors');

const mapRoutes = require('./src/routes/maps.routes.js')

const app = express();

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: 'API de mapas funcionando'
  })
})

app.use('/maps', mapRoutes)

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT}`)
})