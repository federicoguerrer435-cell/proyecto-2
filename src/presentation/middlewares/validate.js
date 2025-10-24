const { validationResult } = require('express-validator');

/**
 * Middleware de validación
 * Procesa los errores de validación de express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Errores de validación',
      code: 'VALIDATION_ERROR',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

module.exports = validate;
