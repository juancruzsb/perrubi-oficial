import AddressesService from '../services/addresses.service.js';
import MapsService from '../services/maps.service.js';
import asyncHandler from '../utils/async-handler.js';
import HttpError from '../utils/http-error.js';

const AddressesController = {};

const resolveCoordinates = async (data) => {
  if (data.latitude != null && data.longitude != null) {
    return { latitude: data.latitude, longitude: data.longitude };
  }

  if (!data.street) {
    return { latitude: null, longitude: null };
  }

  const textQuery = [data.street, data.number, data.city].filter(Boolean).join(' ');
  const place = await MapsService.getDirection({ textQuery });

  return {
    latitude: place.location?.latitude ?? null,
    longitude: place.location?.longitude ?? null,
  };
};

AddressesController.getMyAddresses = asyncHandler(async (req, res) => {
  const addresses = await AddressesService.getAddressesByUser(req.user.id);
  res.status(200).json(addresses);
});

AddressesController.createAddress = asyncHandler(async (req, res) => {
  const data = req.body;

  if (!data.street && (data.latitude == null || data.longitude == null)) {
    throw new HttpError(400, 'Se requiere una calle o coordenadas');
  }

  const { latitude, longitude } = await resolveCoordinates(data);

  const address = await AddressesService.createAddress(req.user.id, { ...data, latitude, longitude });
  res.status(201).json(address);
});

AddressesController.updateAddress = asyncHandler(async (req, res) => {
  const address = await AddressesService.getAddressById(req.params.id);

  if (!address) {
    throw new HttpError(404, 'Dirección no encontrada');
  }

  if (address.userId !== req.user.id) {
    throw new HttpError(403, 'No tenés permiso sobre esta dirección');
  }

  const updated = await AddressesService.updateAddress(req.params.id, req.body);
  res.status(200).json(updated);
});

AddressesController.deleteAddress = asyncHandler(async (req, res) => {
  const address = await AddressesService.getAddressById(req.params.id);

  if (!address) {
    throw new HttpError(404, 'Dirección no encontrada');
  }

  if (address.userId !== req.user.id) {
    throw new HttpError(403, 'No tenés permiso sobre esta dirección');
  }

  await AddressesService.deleteAddress(req.params.id);
  res.status(200).json({ message: 'Dirección eliminada' });
});

export default AddressesController;
