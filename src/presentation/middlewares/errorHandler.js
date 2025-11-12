/**
 * Middleware global de manejo de errores
 * Captura todos los errores y devuelve respuestas consistentes
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Errores de Prisma
  if (err.code && err.code.startsWith('P')) {
    return handlePrismaError(err, res);
  }

  // Errores de validación personalizados
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message,
      code: 'VALIDATION_ERROR'
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expirado',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Error por defecto
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    ...(err.field && { field: err.field }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Maneja errores específicos de Prisma
 */
const handlePrismaError = (err, res) => {
  switch (err.code) {
    case 'P2002':
      // Violación de constraint único
      const field = err.meta?.target?.[0] || 'campo';
      return res.status(409).json({
        success: false,
        error: `Ya existe un registro con ese ${field}`,
        code: 'DUPLICATE_ENTRY',
        field
      });

    case 'P2025':
      // Registro no encontrado
      return res.status(404).json({
        success: false,
        error: 'Registro no encontrado',
        code: 'NOT_FOUND'
      });

    case 'P2003':
      // Foreign key constraint
      return res.status(400).json({
        success: false,
        error: 'Referencia inválida',
        code: 'INVALID_REFERENCE'
      });

    case 'P2014':
      // Violación de relación
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar: existen registros relacionados',
        code: 'RELATION_VIOLATION'
      });

    default:
      return res.status(500).json({
        success: false,
        error: 'Error de base de datos',
        code: 'DATABASE_ERROR',
        details: err.message
      });
  }
};

/**
 * Middleware para rutas no encontradas (404)
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    code: 'NOT_FOUND',
    path: req.originalUrl
  });
};

/**
 * Envoltorio de async para capturar errores en controladores
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};
