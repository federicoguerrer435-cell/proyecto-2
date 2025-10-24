const { body, param, query } = require('express-validator');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validate');

// Use Cases
const listUsersUseCase = require('../../application/use-cases/ListUsersUseCase');
const getUserByIdUseCase = require('../../application/use-cases/GetUserByIdUseCase');
const createUserUseCase = require('../../application/use-cases/CreateUserUseCase');
const updateUserUseCase = require('../../application/use-cases/UpdateUserUseCase');
const deleteUserUseCase = require('../../application/use-cases/DeleteUserUseCase');

/**
 * Controlador de Usuarios
 * Maneja todas las operaciones CRUD de usuarios
 */
class UsersController {
  /**
   * GET /api/users
   * Listar usuarios con paginación y filtros
   */
  index = [
    // Validaciones
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La página debe ser un número mayor a 0'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El límite debe estar entre 1 y 100'),
    query('search')
      .optional()
      .isString()
      .trim(),
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive debe ser true o false'),
    query('roleId')
      .optional()
      .isInt()
      .withMessage('roleId debe ser un número'),
    
    validate,

    asyncHandler(async (req, res) => {
      const { page, limit, search, isActive, roleId } = req.query;

      const filters = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      };

      if (search) filters.search = search;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (roleId) filters.roleId = parseInt(roleId);

      const result = await listUsersUseCase.execute(filters);

      res.json({
        success: true,
        data: result.users,
        meta: result.meta
      });
    })
  ];

  /**
   * GET /api/users/:id
   * Obtener un usuario por ID
   */
  show = [
    // Validaciones
    param('id')
      .isInt()
      .withMessage('El ID debe ser un número válido'),
    
    validate,

    asyncHandler(async (req, res) => {
      const userId = parseInt(req.params.id);
      const user = await getUserByIdUseCase.execute(userId);

      res.json({
        success: true,
        data: user
      });
    })
  ];

  /**
   * POST /api/users
   * Crear un nuevo usuario
   */
  store = [
    // Validaciones
    body('nombre')
      .notEmpty()
      .withMessage('El nombre es requerido')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('email')
      .notEmpty()
      .withMessage('El email es requerido')
      .isEmail()
      .withMessage('Formato de email inválido')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('telefono')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('El teléfono no puede exceder 20 caracteres'),
    body('roleIds')
      .optional()
      .isArray()
      .withMessage('roleIds debe ser un arreglo'),
    body('roleIds.*')
      .optional()
      .isInt()
      .withMessage('Cada roleId debe ser un número'),
    
    validate,

    asyncHandler(async (req, res) => {
      const { nombre, email, password, telefono, roleIds } = req.body;
      const createdBy = req.user.id;

      const user = await createUserUseCase.execute({
        nombre,
        email,
        password,
        telefono,
        roleIds
      }, createdBy);

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: user
      });
    })
  ];

  /**
   * PUT /api/users/:id
   * Actualizar un usuario existente
   */
  update = [
    // Validaciones
    param('id')
      .isInt()
      .withMessage('El ID debe ser un número válido'),
    body('nombre')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Formato de email inválido')
      .normalizeEmail(),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('telefono')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('El teléfono no puede exceder 20 caracteres'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive debe ser true o false'),
    body('roleIds')
      .optional()
      .isArray()
      .withMessage('roleIds debe ser un arreglo'),
    body('roleIds.*')
      .optional()
      .isInt()
      .withMessage('Cada roleId debe ser un número'),
    
    validate,

    asyncHandler(async (req, res) => {
      const userId = parseInt(req.params.id);
      const { nombre, email, password, telefono, isActive, roleIds } = req.body;
      const updatedBy = req.user.id;

      const user = await updateUserUseCase.execute(userId, {
        nombre,
        email,
        password,
        telefono,
        isActive,
        roleIds
      }, updatedBy);

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: user
      });
    })
  ];

  /**
   * DELETE /api/users/:id
   * Eliminar (desactivar) un usuario
   */
  destroy = [
    // Validaciones
    param('id')
      .isInt()
      .withMessage('El ID debe ser un número válido'),
    
    validate,

    asyncHandler(async (req, res) => {
      const userId = parseInt(req.params.id);
      const deletedBy = req.user.id;

      const result = await deleteUserUseCase.execute(userId, deletedBy);

      res.json({
        success: true,
        message: result.message
      });
    })
  ];

  /**
   * DELETE /api/users/:id/hard
   * Eliminar permanentemente un usuario (hard delete)
   */
  hardDestroy = [
    // Validaciones
    param('id')
      .isInt()
      .withMessage('El ID debe ser un número válido'),
    
    validate,

    asyncHandler(async (req, res) => {
      const userId = parseInt(req.params.id);
      const deletedBy = req.user.id;

      const result = await deleteUserUseCase.hardDelete(userId, deletedBy);

      res.json({
        success: true,
        message: result.message
      });
    })
  ];

  /**
   * POST /api/users/:id/roles
   * Asignar un rol a un usuario
   */
  assignRole = [
    // Validaciones
    param('id')
      .isInt()
      .withMessage('El ID de usuario debe ser un número válido'),
    body('roleId')
      .notEmpty()
      .withMessage('El roleId es requerido')
      .isInt()
      .withMessage('El roleId debe ser un número'),
    
    validate,

    asyncHandler(async (req, res) => {
      const userId = parseInt(req.params.id);
      const { roleId } = req.body;

      const userRepository = require('../../infrastructure/repositories/PrismaUserRepository');
      
      // Verificar que el usuario existe
      const user = await userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Asignar rol
      await userRepository.assignRole(userId, parseInt(roleId));

      // Obtener usuario actualizado
      const updatedUser = await getUserByIdUseCase.execute(userId);

      res.json({
        success: true,
        message: 'Rol asignado exitosamente',
        data: updatedUser
      });
    })
  ];

  /**
   * DELETE /api/users/:id/roles/:roleId
   * Remover un rol de un usuario
   */
  removeRole = [
    // Validaciones
    param('id')
      .isInt()
      .withMessage('El ID de usuario debe ser un número válido'),
    param('roleId')
      .isInt()
      .withMessage('El ID de rol debe ser un número válido'),
    
    validate,

    asyncHandler(async (req, res) => {
      const userId = parseInt(req.params.id);
      const roleId = parseInt(req.params.roleId);

      const userRepository = require('../../infrastructure/repositories/PrismaUserRepository');
      
      // Verificar que el usuario existe
      const user = await userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Remover rol
      await userRepository.removeRole(userId, roleId);

      // Obtener usuario actualizado
      const updatedUser = await getUserByIdUseCase.execute(userId);

      res.json({
        success: true,
        message: 'Rol removido exitosamente',
        data: updatedUser
      });
    })
  ];
}

module.exports = new UsersController();
