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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Credit'
 */
router.get('/payment-schedule', authorize('reports.read'), reportsController.getPaymentSchedule);

/**
 * @swagger
 * /reports/metrics/download:
 *   get:
 *     summary: Descarga un reporte de métricas en formato Excel
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reporte de métricas generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/metrics/download', authorize('reports.download'), reportsController.downloadMetrics);

module.exports = router;
