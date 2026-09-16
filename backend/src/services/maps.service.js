import axios from 'axios'
import HttpError from '../utils/http-error.js'
const MapsService = {}

MapsService.getRoute = async ({ origin, destination, intermediates }) => {
    //formato de req.body:
    // {
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
    //    ]
    //  }
    //
    // Esto se añade automaticamente al body desde el back, no es necesario que el front lo envie, pero se muestra para entender el formato de la request.
    //  "travelMode" (modo de viaje, en caso de perrubi siempre sera WALK): "WALK",
    //  "routeModifiers" (algunos modificadores de ruta): {
    //    avoidIndoor (evita rutas por interiores): true,
    //  },
    // "optimizeWaypointOrder" (optimiza el orden de los waypoints (destinos intermedios), siempre en true): true,
    //  "languageCode" (lenguaje): "en-US",
    //  "units" (unidades, en este caso metros): "METRIC"

    const response = await axios.post(

      'https://routes.googleapis.com/directions/v2:computeRoutes',

      {
        origin: origin,
        destination: destination,
        intermediates: intermediates || [],
        travelMode: "WALK",
        routeModifiers: {
          avoidIndoor: true,
        },
        optimizeWaypointOrder: true,
        languageCode: "en-US",
        units: "METRIC"
      },
      {
        headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key':
          process.env.API_KEY_MAPS,
        'X-Goog-FieldMask':
          'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.optimized_intermediate_waypoint_index'
        }
      }
    )

    return response.data
}

MapsService.getDirection = async ({ textQuery }) => {
      //formato de req.body:
      // {
      //   "textQuery": Ubicacion a buscar, por ejemplo: "Galván 3124, CABA"
      // }

    const placeInfo = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      { textQuery: textQuery },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.API_KEY_MAPS,
          'X-Goog-FieldMask': 'places.id'
        }
      }
    )

    if (!placeInfo.data.places || placeInfo.data.places.length === 0) {
      throw new HttpError(404, 'Dirección no encontrada')
    }

    const placeId = placeInfo.data.places[0].id

    const response = await axios.get(

      `https://places.googleapis.com/v1/places/${placeId}`,

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

    return response.data
}

MapsService.getStaticMap = async ({ latitude, longitude, zoom, width, height }) => {
    // Proxy de la Maps Static API (https://maps.googleapis.com/maps/api/staticmap):
    // devuelve una imagen PNG ya renderizada por Google centrada en
    // (latitude, longitude), en vez de tiles interactivos. Es el reemplazo de
    // react-native-maps para "mostrar dónde está el paseador" sin dev build:
    // el frontend solo necesita un <Image source={{uri: '/maps/static?...'}} />.
    // Requiere habilitar "Maps Static API" en el proyecto de GCP de
    // API_KEY_MAPS (Routes/Places no la habilitan solas).
    //
    // Sin `markers`: el pin ya no lo dibuja Google. walk-map.tsx superpone su
    // propio ícono (persona / persona+perro según el estado del paseo) en el
    // centro exacto de la imagen — al estar `center` = (latitude, longitude),
    // el centro de la imagen ES la ubicación, sin cálculo extra del lado del
    // frontend.
    const params = new URLSearchParams({
      center: `${latitude},${longitude}`,
      zoom: String(zoom),
      size: `${width}x${height}`,
      scale: '2',
      key: process.env.API_KEY_MAPS,
    });

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`,
      { responseType: 'arraybuffer' }
    );

    return { buffer: response.data, contentType: response.headers['content-type'] || 'image/png' };
}

export default MapsService