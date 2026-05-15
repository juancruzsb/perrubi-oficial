const axios = require('axios')

const getRoute = async (req, res) => {

  try {

    const response = await axios.post(

      'https://routes.googleapis.com/directions/v2:computeRoutes',

      req.body
    )

    res.json(response.data)

  } catch (error) {

    console.error(error.response?.data || error.message)

    res.status(500).json({
      error: 'Error obteniendo ruta'
    })
  }
}

module.exports = {
  getRoute
}