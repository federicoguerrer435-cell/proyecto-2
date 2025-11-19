const express = require('express');
const router = express.Router();
const creditsController = require('../controllers/CreditsController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authorize');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Credits
 *   description: Endpoints para la gestión de créditos
 */

/**
 * @swagger
 * /credits:
 *   get:
 *     summary: Obtiene una lista de todos los créditos
 *     tags: [Credits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de créditos obtenida exitosamente
 */
router.get('/', authorize('credits.read'), creditsController.index);

/**
 * @swagger
 * /credits:
 *   post:
 *     summary: Crea un nuevo crédito
 *     tags: [Credits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - client_id
 *               - monto
 *               - cuotas
 *             properties:
 *               client_id:
 *                 type: integer
 *                 description: ID del cliente
 *                 example: 11
 *               monto:
 *                 type: number
 *                 description: Monto principal del crédito
 *                 example: 1000000
 *               cuotas:
 *                 type: integer
 *                 description: Número de cuotas
 *                 example: 12
 *               tasa:
 *                 type: number
 *                 description: Tasa de interés (opcional, usa la global si no se especifica)
 *                 example: 0.20
 *               plazo:
 *                 type: integer
 *                 description: Plazo en meses (calcula automáticamente la fecha de vencimiento)
 *                 example: 6
 *               tipo_credito:
 *                 type: string
 *                 description: Tipo de crédito
 *                 example: "Personal"
 *               nota:
 *                 type: string
 *                 description: Notas adicionales
 *                 example: "Crédito de prueba"
 *     responses:
 *       201:
 *         description: Crédito creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Credit'
 */
router.post('/', authorize('credits.create'), creditsController.store);

/**
 * @swagger
 * /credits/{id}:
 *   get:
 *     summary: Obtiene un crédito por su ID
 *     tags: [Credits]
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
 *         description: Crédito obtenido exitosamente
 */
router.get('/:id', authorize('credits.read'), creditsController.show);

/**
 * @swagger
 * /credits/{id}/approve:
 *   post:
 *     summary: Aprueba un crédito
 *     tags: [Credits]
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
 *         description: Crédito aprobado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/:id/approve', authorize('credits.approve'), creditsController.approve);

/**
 * @swagger
 * /credits/{id}/reject:
 *   post:
 *     summary: Rechaza un crédito
 *     tags: [Credits]
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
 *         description: Crédito rechazado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/:id/reject', authorize('credits.reject'), creditsController.reject);

module.exports = router;
