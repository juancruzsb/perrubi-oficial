import MapsService from '../services/maps.service.js'
const MapsController = {}

MapsController.getRoute = async (req, res) => {
  const { origin, destination, waypoints } = req.body

  if (!origin || !destination) {
    return res.status(400).json({ error: 'Origin and destination are required' })
  }  

  if (waypoints && !Array.isArray(waypoints)) {
    return res.status(400).json({ error: 'Waypoints must be an array' })
  }
  
  try {
    const route = await MapsService.getRoute({ origin, destination, waypoints })
    res.json(route)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error obteniendo ruta', message: error.message })
  }
}

MapsController.getDirection = async (req, res) => {
    const { textQuery } = req.body

    if (!textQuery) {
        return res.status(400).json({ error: 'textQuery is required' })
    }

    try {
        const directions = await MapsService.getDirection({ textQuery })
        res.json(directions)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error obteniendo direcciones', message: error.message })
    }
}

export default MapsController