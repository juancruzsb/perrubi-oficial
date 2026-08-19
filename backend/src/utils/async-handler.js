// Envuelve un controller async: cualquier rechazo cae en next(error)
// y lo termina resolviendo el error.middleware central, en vez de
// repetir el mismo try/catch en cada controller.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
