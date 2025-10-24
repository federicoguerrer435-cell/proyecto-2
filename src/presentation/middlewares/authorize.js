const userRepository = require('../../infrastructure/repositories/PrismaUserRepository');

/**
 * Middleware de autorización basado en permisos
 * Verifica si el usuario tiene los permisos necesarios para acceder a un recurso
 */
const authorize = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      // El usuario debe estar autenticado (req.user del authMiddleware)
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          success: false,
          error: 'No autenticado',
          code: 'UNAUTHORIZED'
        });
      }

      // Si no se requieren permisos específicos, solo verificar autenticación
      if (!requiredPermissions || requiredPermissions.length === 0) {
        return next();
      }

      // Obtener permisos del usuario
      const permissions = await userRepository.getUserPermissions(req.user.userId);
      const userPermissionNames = permissions.map(p => p.name);

      // Verificar si el usuario tiene al menos uno de los permisos requeridos
      const hasPermission = requiredPermissions.some(permission => 
        userPermissionNames.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'No tiene permisos para realizar esta acción',
          code: 'FORBIDDEN',
          requiredPermissions,
          userPermissions: userPermissionNames
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de autorización:', error);
      return res.status(500).json({
        success: false,
        error: 'Error verificando permisos',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

/**
 * Middleware para verificar si el usuario tiene un rol específico
 */
const authorizeRole = (...requiredRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.roles) {
        return res.status(401).json({
          success: false,
          error: 'No autenticado',
          code: 'UNAUTHORIZED'
        });
      }

      const hasRole = requiredRoles.some(role => req.user.roles.includes(role));

      if (!hasRole) {
        return res.status(403).json({
          success: false,
          error: 'No tiene el rol necesario para realizar esta acción',
          code: 'FORBIDDEN',
          requiredRoles,
          userRoles: req.user.roles
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de autorización por rol:', error);
      return res.status(500).json({
        success: false,
        error: 'Error verificando roles',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

module.exports = {
  authorize,
  authorizeRole
};
