const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/ClientsController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authorize');

// Base: /api/clients
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Endpoints para la gestión de clientes
 */

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Obtiene una lista de todos los clientes
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida exitosamente
 */
router.get('/', authorize('clients.read'), clientsController.index);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Obtiene un cliente por su ID
 *     tags: [Clients]
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
 *         description: Cliente obtenido exitosamente
 */
router.get('/:id', authorize('clients.read'), clientsController.show);

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Crea un nuevo cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 */
router.post('/', authorize('clients.create'), clientsController.store);

/**
 * @swagger
 * /clients/{id}:
 *   put:
 *     summary: Actualiza un cliente existente
 *     tags: [Clients]
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
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente
 */
router.put('/:id', authorize('clients.update'), clientsController.update);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Elimina un cliente
 *     tags: [Clients]
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
 *         description: Cliente eliminado exitosamente
 */
router.delete('/:id', authorize('clients.delete'), clientsController.destroy);

module.exports = router;
