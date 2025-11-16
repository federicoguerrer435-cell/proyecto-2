const express = require('express');
const router = express.Router();
const usersController = require('../controllers/UsersController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authorize');
const usersController = require('../controllers/UsersController');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints para la gestión de usuarios
 */
router.use(authMiddleware);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos los usuarios con filtros y paginación
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/', authorize('users.read'), usersController.index);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtiene un usuario por su ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del usuario
 */
router.get('/:id', authorize('users.read'), usersController.show);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuario creado
 */
router.post('/', authorize('users.create'), usersController.store);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualiza un usuario existente
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put('/:id', authorize('users.update'), usersController.update);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Desactiva un usuario (soft delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Usuario desactivado
 */
router.delete('/:id', authorize('users.delete'), usersController.destroy);

/**
 * @swagger
 * /users/{id}/hard:
 *   delete:
 *     summary: Elimina permanentemente un usuario (hard delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Usuario eliminado permanentemente
 */
router.delete('/:id/hard', authorize('users.delete'), usersController.hardDestroy);

/**
 * @swagger
 * /users/{id}/roles:
 *   post:
 *     summary: Asigna un rol a un usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Rol asignado
 */
router.post('/:id/roles', authorize('users.update'), usersController.assignRole);

/**
 * @swagger
 * /users/{id}/roles/{roleId}:
 *   delete:
 *     summary: Remueve un rol de un usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Rol removido
 */
router.delete('/:id/roles/:roleId', authorize('users.update'), usersController.removeRole);

module.exports = router;
