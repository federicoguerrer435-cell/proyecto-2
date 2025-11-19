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
 *     summary: Registra un nuevo pago y envía notificación por Telegram
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - creditId
 *               - monto
 *               - metodoPago
 *               - cuotaNumero
 *             properties:
 *               creditId:
 *                 type: integer
 *                 description: ID del crédito
 *                 example: 13
 *               monto:
 *                 type: number
 *                 format: decimal
 *                 description: Monto del pago
 *                 example: 100000
 *               metodoPago:
 *                 type: string
 *                 enum: [EFECTIVO, TRANSFERENCIA, CHEQUE, TARJETA]
 *                 description: Método de pago utilizado
 *                 example: "EFECTIVO"
 *               cuotaNumero:
 *                 type: integer
 *                 minimum: 1
 *                 description: Número de cuota que se está pagando
 *                 example: 1
 *               comprobanteReferencia:
 *                 type: string
 *                 description: Referencia del comprobante (opcional)
 *                 example: "PAGO-TEST-001"
 *     responses:
 *       201:
 *         description: Pago registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *                     ticket:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         numeroComprobante:
 *                           type: string
 *                         monto:
 *                           type: string
 *                         fechaEmision:
 *                           type: string
 *                           format: date-time
 *                     creditoActualizado:
 *                       type: boolean
 *                       description: Indica si el estado del crédito cambió a PAGADO
 *                     nuevoEstadoCredito:
 *                       type: string
 *                       enum: [PENDIENTE, ACTIVO, PAGADO, INCUMPLIDO, RENOVADO, RECHAZADO]
 *                     notificacionEnviada:
 *                       type: boolean
 *                       description: Indica si la notificación por Telegram fue enviada exitosamente
 */
router.post('/', authorize('payments.create'), paymentsController.store);

module.exports = router;
