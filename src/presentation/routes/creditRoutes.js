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
 *             $ref: '#/components/schemas/Credit'
 *     responses:
 *       201:
 *         description: Crédito creado exitosamente
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
