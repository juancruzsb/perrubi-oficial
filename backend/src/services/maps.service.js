const axios = require('axios')

const getRoute = async (req, res) => {
  try {

    const response = await axios.post(

      'https://routes.googleapis.com/directions/v2:computeRoutes',

      req.body,
      {
        headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key':
          process.env.API_KEY_MAPS,
        'X-Goog-FieldMask':
          'routes.duration,routes.distanceMeters'
        }
      }
    )

    res.json(response.data)

  } catch (error) {

    console.error(error.response?.data || error.message)

    res.status(500).json({
      error: 'Error obteniendo ruta'
    })
  }
}

const getDirection = async (req, res) => {
  try {
    const place_info = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.API_KEY_MAPS,
          'X-Goog-FieldMask': 'places.id'
        }
      }
    )

    const place_id = place_info.data.places[0].id

    const response = await axios.get(

      `https://places.googleapis.com/v1/places/${place_id}`,

      {
        headers: {
          'Content-Type': 'application/json',

          'X-Goog-Api-Key': process.env.API_KEY_MAPS,

          'X-Goog-FieldMask': 'name,formattedAddress,location'
        }
      }
    )
    
    res.json(response.data)
  } catch (error) {
    console.error(error.response?.data || error.message)
    res.status(500).json({
      error: 'Error obteniendo direcciones'
    })
  }
}

module.exports = {
  getRoute,
  getDirection
}