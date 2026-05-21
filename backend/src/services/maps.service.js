const axios = require('axios')

const getRoute = async (req, res) => {
  try {
    //formato de req.body:
    //{
    //  "origin" (direccion origen):{
    //    "location":{
    //      "latLng" (coordenadas en latitud y longitud, se obtienen con getDirection):{
    //        "latitude": 37.419734,
    //        "longitude": -122.0827784
    //      }
    //    }
    //  },
    //  "destination" (direccion destino):{
    //    "location":{
    //      "latLng" (coordenadas en latitud y longitud, se obtienen con getDirection):{
    //        "latitude": 37.417670,
    //        "longitude": -122.079595
    //      }
    //    }
    //  },
    //    "intermediates" (destinos intermedios, es un array): [
    //       {
    //        "location":{
    //          "latLng" (coordenadas en latitud y longitud, se obtienen con getDirection):{
    //            "latitude": 37.417672,
    //            "longitude": -122.079595
    //          }
    //        }
    //       },
    //       {
    //        "location":{
    //          "latLng" (coordenadas en latitud y longitud, se obtienen con getDirection):{
    //            "latitude": 37.417671,
    //            "longitude": -122.079595
    //          }
    //        }
    //      }
    //    ],
    //  "travelMode" (modo de viaje, en caso de perrubi siempre sera WALK): "WALK",
    //  "departureTime" (hora de salida, en formato timestamp): "2024-06-01T08:00:00Z",
    //  "routeModifiers" (algunos modificadores de ruta): {
    //    avoidIndoor (evita rutas por interiores): true,
    //  },
    // "optimizeWaypointOrder" (optimiza el orden de los waypoints (destinos intermedios), siempre en true): true,
    //  "languageCode" (lenguaje): "en-US",
    //  "units" (unidades, en este caso metros): "METRIC"
    //}

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
      //formato de req.body:
      // {
      //   "textQuery": Ubicacion a buscar, por ejemplo: "Galván 3124, CABA"
      // }

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

          'X-Goog-FieldMask': 'name,formattedAddress,location,displayName'
        }
      }
    )
    
    //formato de respuesta:
    //ejemplo galvan 3124, caba
    // {
    //   "name": "places/ChIJl4-lE_W2vJUR3RhS7NvnOVY",
    //   "formattedAddress": "Galván 3124, C1431 Cdad. Autónoma de Buenos Aires, Argentina",
    //   "location": {
    //     "latitude": -34.5667227,
    //     "longitude": -58.48777759999999
    //   },
    //   "displayName": {
    //     "text": "Galván 3124"
    //   }
    // }

    res.json(response.data)
  } catch (error) {
    console.error(error.response?.data || error.message)
    res.status(500).json({
      error: 'Error obteniendo direcciones'
    })
  }
}

const createSingleRouteWaypoints = async (req, res) => {
  try {
    let waypoints = []
    let diametro = 1200 
    let radio = diametro / 2

    let punto_de_salida = req.body.punto_de_salida
    let latitud = punto_de_salida.location.latitude
    let longitud = punto_de_salida.location.longitude
    let variacion_lat_metros = 0.00000898
    let variacion_lon_metros = 0.0000109

    let direccion = req.body.direccion
    let primer_punto = {
      location: {
        latitude: latitud,
        longitude: longitud
      }
    };

    let segundo_punto = {
      location: {
        latitude: latitud,
        longitude: longitud
      }
    };

    switch (direccion) {
      case 'N':
        primer_punto.location.latitude += radio / 2 * variacion_lat_metros;
        segundo_punto = primer_punto
        primer_punto.location.longitude += radio / 3 * variacion_lon_metros;
        break;
      case 'S':
        primer_punto.location.latitude -= radio / 2 * variacion_lat_metros;
        break;
      case 'E':
        primer_punto.location.longitude += radio / 2 * variacion_lon_metros;
        break;
      case 'O':
        primer_punto.location.longitude -= radio / 2 * variacion_lon_metros;
        break;
    }


    axios.post(
      'https://places.googleapis.com/v1/places:searchNearby',
      req.body,
    )

    res.json(waypoints)
  } catch (error) {
    console.error(error.response?.data || error.message)
    res.status(500).json({
      error: 'Error creando puntos de ruta'
    })
  }
}

module.exports = {
  getRoute,
  getDirection
}