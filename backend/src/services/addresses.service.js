import prisma from "../../db.js";
import { toFloatOrNull } from "../utils/sanitize.js";

const AddressesService = {};

AddressesService.getAddressesByUser = async (userId) => {
  return prisma.address.findMany({
    where: { userId: parseInt(userId) },
  });
};

AddressesService.getAddressById = async (addressId) => {
  return prisma.address.findUnique({
    where: { id: parseInt(addressId) },
  });
};

AddressesService.createAddress = async (userId, data) => {
  return prisma.address.create({
    data: {
      userId: parseInt(userId),
      label: data.label,
      street: data.street,
      number: data.number,
      floorApt: data.floorApt,
      city: data.city,
      zipCode: data.zipCode,
      latitude: toFloatOrNull(data.latitude),
      longitude: toFloatOrNull(data.longitude),
    },
  });
};

AddressesService.updateAddress = async (addressId, data) => {
  return prisma.address.update({
    where: { id: parseInt(addressId) },
    data: {
      label: data.label,
      street: data.street,
      number: data.number,
      floorApt: data.floorApt,
      city: data.city,
      zipCode: data.zipCode,
      latitude: data.latitude !== undefined ? toFloatOrNull(data.latitude) : undefined,
      longitude: data.longitude !== undefined ? toFloatOrNull(data.longitude) : undefined,
    },
  });
};

AddressesService.deleteAddress = async (addressId) => {
  return prisma.address.delete({
    where: { id: parseInt(addressId) },
  });
};

export default AddressesService;
