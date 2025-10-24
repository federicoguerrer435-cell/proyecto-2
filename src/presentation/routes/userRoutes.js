const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authorize');
const usersController = require('../controllers/UsersController');

/**
 * Rutas de Usuarios
 * Base path: /api/users
 * 
 * Todas las rutas requieren autenticación (authMiddleware)
 * Cada ruta tiene su propio control de permisos (authorize)
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @route   GET /api/users
 * @desc    Listar usuarios con paginación y filtros
 * @access  Requiere permiso 'users.read'
 * @query   {number} page - Número de página (default: 1)
 * @query   {number} limit - Límite por página (default: 10, max: 100)
 * @query   {string} search - Búsqueda por nombre o email
 * @query   {boolean} isActive - Filtrar por estado activo
 * @query   {number} roleId - Filtrar por rol
 */
router.get(
  '/',
  authorize('users.read'),
  usersController.index
);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener un usuario por ID
 * @access  Requiere permiso 'users.read'
 * @param   {number} id - ID del usuario
 */
router.get(
  '/:id',
  authorize('users.read'),
  usersController.show
);

/**
 * @route   POST /api/users
 * @desc    Crear un nuevo usuario
 * @access  Requiere permiso 'users.create'
 * @body    {string} nombre - Nombre del usuario (requerido)
 * @body    {string} email - Email del usuario (requerido, único)
 * @body    {string} password - Contraseña del usuario (requerido, min: 6)
 * @body    {string} telefono - Teléfono del usuario (opcional)
 * @body    {number[]} roleIds - IDs de roles a asignar (opcional)
 */
router.post(
  '/',
  authorize('users.create'),
  usersController.store
);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar un usuario existente
 * @access  Requiere permiso 'users.update'
 * @param   {number} id - ID del usuario
 * @body    {string} nombre - Nombre del usuario (opcional)
 * @body    {string} email - Email del usuario (opcional)
 * @body    {string} password - Nueva contraseña (opcional, min: 6)
 * @body    {string} telefono - Teléfono del usuario (opcional)
 * @body    {boolean} isActive - Estado activo del usuario (opcional)
 * @body    {number[]} roleIds - IDs de roles a asignar (opcional)
 */
router.put(
  '/:id',
  authorize('users.update'),
  usersController.update
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Desactivar un usuario (soft delete)
 * @access  Requiere permiso 'users.delete'
 * @param   {number} id - ID del usuario
 */
router.delete(
  '/:id',
  authorize('users.delete'),
  usersController.destroy
);

/**
 * @route   DELETE /api/users/:id/hard
 * @desc    Eliminar permanentemente un usuario (hard delete)
 * @access  Requiere permiso 'users.delete'
 * @param   {number} id - ID del usuario
 * @note    Solo usar en casos especiales, elimina todos los datos relacionados
 */
router.delete(
  '/:id/hard',
  authorize('users.delete'),
  usersController.hardDestroy
);

/**
 * @route   POST /api/users/:id/roles
 * @desc    Asignar un rol a un usuario
 * @access  Requiere permiso 'users.update'
 * @param   {number} id - ID del usuario
 * @body    {number} roleId - ID del rol a asignar
 */
router.post(
  '/:id/roles',
  authorize('users.update'),
  usersController.assignRole
);

/**
 * @route   DELETE /api/users/:id/roles/:roleId
 * @desc    Remover un rol de un usuario
 * @access  Requiere permiso 'users.update'
 * @param   {number} id - ID del usuario
 * @param   {number} roleId - ID del rol a remover
 */
router.delete(
  '/:id/roles/:roleId',
  authorize('users.update'),
  usersController.removeRole
);

module.exports = router;
