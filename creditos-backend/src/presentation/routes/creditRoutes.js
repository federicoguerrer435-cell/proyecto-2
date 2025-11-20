const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authorize');
const creditsController = require('../controllers/CreditsController');

/**
 * Rutas de Créditos
 * Base path: /api/credits
 * 
 * Todas las rutas requieren autenticación (authMiddleware)
 * Cada ruta tiene su propio control de permisos (authorize)
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @route   GET /api/credits
 * @desc    Listar créditos con paginación y filtros
 * @access  Requiere permiso 'credits.read'
 * @query   {number} page - Número de página (default: 1)
 * @query   {number} limit - Límite por página (default: 10, max: 100)
 * @query   {string} estado - Filtrar por estado (PENDIENTE, ACTIVO, PAGADO, etc.)
 * @query   {number} clienteId - Filtrar por cliente
 * @query   {number} cobradorId - Filtrar por cobrador asignado
 * @query   {string} fechaDesde - Filtrar desde fecha (ISO 8601)
 * @query   {string} fechaHasta - Filtrar hasta fecha (ISO 8601)
 */
router.get(
  '/',
  authorize('credits.read'),
  creditsController.index
);

/**
 * @route   GET /api/credits/:id
 * @desc    Obtener un crédito por ID con detalles completos
 * @access  Requiere permiso 'credits.read'
 * @param   {number} id - ID del crédito
 */
router.get(
  '/:id',
  authorize('credits.read'),
  creditsController.show
);

/**
 * @route   POST /api/credits
 * @desc    Crear un nuevo crédito
 * @access  Requiere permiso 'credits.create'
 * @body    {number} clienteId - ID del cliente (requerido)
 * @body    {number} montoPrincipal - Monto del crédito (requerido, > 0)
 * @body    {number} cuotas - Número de cuotas (requerido, > 0)
 * @body    {number} tasaInteresAplicada - Tasa de interés (opcional, por defecto usa la global)
 * @body    {string} fechaVencimiento - Fecha de vencimiento ISO 8601 (opcional, se calcula automáticamente)
 */
router.post(
  '/',
  authorize('credits.create'),
  creditsController.store
);

/**
 * @route   POST /api/credits/:id/approve
 * @desc    Aprobar un crédito pendiente
 * @access  Requiere permiso 'credits.approve'
 * @param   {number} id - ID del crédito
 * @note    Solo se pueden aprobar créditos en estado PENDIENTE
 * @note    Valida que el cliente no tenga otro crédito activo
 * @note    Cambia el estado a ACTIVO
 * @note    Envía notificación por WhatsApp al cliente
 * @note    Registra auditoría (updated_by, updated_at)
 */
router.post(
  '/:id/approve',
  authorize('credits.approve'),
  creditsController.approve
);

/**
 * @route   POST /api/credits/:id/reject
 * @desc    Rechazar un crédito pendiente
 * @access  Requiere permiso 'credits.reject'
 * @param   {number} id - ID del crédito
 * @body    {string} motivo - Motivo del rechazo (opcional, 10-500 caracteres)
 * @note    Solo se pueden rechazar créditos en estado PENDIENTE
 * @note    Cambia el estado a RECHAZADO
 * @note    Envía notificación por WhatsApp al cliente
 * @note    Registra auditoría (updated_by, updated_at)
 */
router.post(
  '/:id/reject',
  authorize('credits.reject'),
  creditsController.reject
);

module.exports = router;