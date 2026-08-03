import HttpError from '../utils/http-error.js';

// Handler central de errores. Cualquier error pasado a next(err) desde
// un asyncHandler termina acá en vez de que cada controller arme su
// propio status/mensaje.
// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Errores conocidos de Prisma
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Recurso no encontrado' });
  }
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'El recurso ya existe' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
};

export default errorMiddleware;
