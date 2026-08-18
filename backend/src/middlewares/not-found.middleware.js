const notFoundMiddleware = (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
};

export default notFoundMiddleware;
