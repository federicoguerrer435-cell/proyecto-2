const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/PaymentsController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authorize');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Endpoints para la gestión de pagos
 */

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Registra un nuevo pago
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               creditId:
 *                 type: integer
 *               monto:
 *                 type: number
 *               metodoPago:
 *                 type: string
 *                 enum: [EFECTIVO, TRANSFERENCIA, CHEQUE, TARJETA]
 *               cuotaNumero:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Pago registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/', authorize('payments.create'), paymentsController.store);

module.exports = router;
