require('dotenv').config();

const express = require('express');
const cors = require('cors');

const mapRoutes = require('./routes/maps.routes')

const app = express();

app.use(cors())
app.use(express.json())

app.use('/maps', mapsRoutes)


app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT}`)
})