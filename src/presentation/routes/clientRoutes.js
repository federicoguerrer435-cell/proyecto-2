const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/ClientsController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authorize');

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
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del cliente
 *                 example: "jean benitez"
 *               cedula:
 *                 type: string
 *                 description: Cédula del cliente
 *                 example: "123456789"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del cliente
 *                 example: "jesebe4991@gmail.com"
 *               telefono:
 *                 type: string
 *                 description: Teléfono del cliente
 *                 example: "3167945825"
 *               direccion:
 *                 type: string
 *                 description: Dirección del cliente
 *                 example: "cra24D#42a115"
 *               telegramChatId:
 *                 type: string
 *                 description: ID del chat de Telegram para notificaciones
 *                 example: "1341615509"
 *               referencias:
 *                 type: string
 *                 description: Referencias del cliente
 *               modalidadPago:
 *                 type: string
 *                 description: Modalidad de pago preferida
 *               assignedTo:
 *                 type: integer
 *                 description: ID del cobrador asignado
 *               isActive:
 *                 type: boolean
 *                 description: Estado activo del cliente
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Client'
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
