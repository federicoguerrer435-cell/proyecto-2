const { body } = require('express-validator');
const loginUserUseCase = require('../../application/use-cases/LoginUserUseCase');
const refreshTokenUseCase = require('../../application/use-cases/RefreshTokenUseCase');
const logoutUserUseCase = require('../../application/use-cases/LogoutUserUseCase');
const userRepository = require('../../infrastructure/repositories/PrismaUserRepository');
const passwordService = require('../../infrastructure/security/PasswordService');
const { asyncHandler } = require('../middlewares/errorHandler');
const validate = require('../middlewares/validate');

/**
 * Auth Controller
 * Maneja las peticiones de autenticación
 */
class AuthController {
  /**
   * POST /api/auth/login
   * Autentica un usuario y devuelve access token + refresh token
   */
  login = [
    // Validaciones
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña requerida'),
    validate,

    asyncHandler(async (req, res) => {
      const { email, password } = req.body;

      const result = await loginUserUseCase.execute(email, password);

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    })
  ];

  /**
   * POST /api/auth/refresh
   * Genera un nuevo access token usando un refresh token válido
   */
  refresh = [
    body('refreshToken').notEmpty().withMessage('Refresh token requerido'),
    validate,

    asyncHandler(async (req, res) => {
      const { refreshToken } = req.body;

      const result = await refreshTokenUseCase.execute(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token renovado',
        data: result
      });
    })
  ];

  /**
   * POST /api/auth/logout
   * Revoca el refresh token
   */
  logout = [
    body('refreshToken').notEmpty().withMessage('Refresh token requerido'),
    validate,

    asyncHandler(async (req, res) => {
      const { refreshToken } = req.body;

      await logoutUserUseCase.execute(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Logout exitoso'
      });
    })
  ];

  /**
   * POST /api/auth/register
   * Registra un nuevo usuario (solo admin puede crear usuarios)
   */
  register = [
    body('nombre').trim().notEmpty().withMessage('Nombre requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('telefono').optional().trim(),
    body('roleId').optional().isInt().withMessage('ID de rol inválido'),
    validate,

    asyncHandler(async (req, res) => {
      const { nombre, email, password, telefono, roleId } = req.body;

      // Verificar que el email no exista
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'El email ya está registrado',
          code: 'EMAIL_EXISTS'
        });
      }

      // Hashear contraseña
      const passwordHash = await passwordService.hashPassword(password);

      // Crear usuario
      const newUser = await userRepository.create({
        nombre,
        email,
        passwordHash,
        telefono,
        isActive: true,
        createdBy: req.user?.userId || null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Asignar rol si se proporciona
      if (roleId) {
        await userRepository.assignRole(newUser.id, parseInt(roleId));
      }

      // Obtener usuario con roles
      const userWithRoles = await userRepository.findById(newUser.id);
      const roles = userWithRoles.userRoles.map(ur => ur.role.name);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            id: newUser.id,
            nombre: newUser.nombre,
            email: newUser.email,
            telefono: newUser.telefono,
            roles,
            createdAt: newUser.createdAt
          }
        }
      });
    })
  ];

  /**
   * GET /api/auth/profile
   * Obtiene el perfil del usuario autenticado
   */
  profile = asyncHandler(async (req, res) => {
    const user = await userRepository.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        code: 'NOT_FOUND'
      });
    }

    const roles = user.userRoles.map(ur => ur.role.name);
    const permissions = [];
    user.userRoles.forEach(ur => {
      ur.role.rolePermissions.forEach(rp => {
        permissions.push({
          name: rp.permission.name,
          module: rp.permission.module,
          action: rp.permission.action
        });
      });
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          telefono: user.telefono,
          isActive: user.isActive,
          roles,
          permissions,
          createdAt: user.createdAt
        }
      }
    });
  });
}

module.exports = new AuthController();
