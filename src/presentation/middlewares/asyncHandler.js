/**
 * Async Handler Middleware
 * Envuelve funciones async de controladores para manejar errores automáticamente
 * Evita tener que escribir try-catch en cada controlador
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
