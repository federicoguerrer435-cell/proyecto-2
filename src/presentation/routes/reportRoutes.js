const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/ReportsController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authorize');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Endpoints para la generación de reportes
 */

/**
 * @swagger
 * /reports/payment-schedule:
 *   get:
 *     summary: Obtiene el calendario de pagos para una fecha específica
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Calendario de pagos obtenido exitosamente
 */
router.get('/payment-schedule', authorize('reports.read'), reportsController.getPaymentSchedule);

module.exports = router;
