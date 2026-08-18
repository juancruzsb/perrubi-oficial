// Quita el hash de contraseña de una entidad antes de mandarla al cliente.
export const stripPassword = (entity) => {
  if (!entity) return entity;
  const { passwordHash, ...rest } = entity;
  return rest;
};

export const toIntOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export const toFloatOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};
