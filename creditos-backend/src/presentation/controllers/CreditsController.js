const { body, param } = require('express-validator');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validate');

// Use Cases
const manageCreditStatusUseCase = require('../../application/use-cases/ManageCreditStatusUseCase');
const createCreditUseCase = require('../../application/use-cases/CreateCreditUseCase');

/**
 * Controlador de Créditos
 * Maneja todas las operaciones relacionadas con créditos
 */
class CreditsController {
  /**
   * POST /api/credits/:id/approve
   * Aprobar un crédito pendiente
   */
  approve = [
    // Validaciones
    param('id')
      .isInt()
      .withMessage('El ID del crédito debe ser un número válido'),
    
    validate,

    asyncHandler(async (req, res) => {
      const creditId = parseInt(req.params.id);
      const approvedBy = req.user.userId;

      const result = await manageCreditStatusUseCase.approve(creditId, approvedBy);

      res.json({
        success: true,
        message: result.mensaje,
        data: {
          credit: {
            id: result.credit.id,
            numeroCredito: result.credit.numeroCredito,
            estado: result.credit.estado,
            montoPrincipal: result.credit.montoPrincipal,
            cuotas: result.credit.cuotas,
            fechaVencimiento: result.credit.fechaVencimiento,
            updatedAt: result.credit.updatedAt
          },
          notificacionEnviada: result.notificacionEnviada
        }
      });
    })
  ];

  /**
   * POST /api/credits/:id/reject
   * Rechazar un crédito pendiente
   */
  reject = [
    // Validaciones
    param('id')
      .isInt()
      .withMessage('El ID del crédito debe ser un número válido'),
    body('motivo')
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('El motivo debe tener entre 10 y 500 caracteres'),
    
    validate,

    asyncHandler(async (req, res) => {
      const creditId = parseInt(req.params.id);
      const rejectedBy = req.user.userId;
      const { motivo } = req.body;

      const result = await manageCreditStatusUseCase.reject(creditId, rejectedBy, motivo);

      res.json({
        success: true,
        message: result.mensaje,
        data: {
          credit: {
            id: result.credit.id,
            numeroCredito: result.credit.numeroCredito,
            estado: result.credit.estado,
            montoPrincipal: result.credit.montoPrincipal,
            motivo: result.motivo,
            updatedAt: result.credit.updatedAt
          },
          notificacionEnviada: result.notificacionEnviada
        }
      });
    })
  ];

  /**
   * POST /api/credits
   * Crear un nuevo crédito (ya implementado en tu proyecto)
   */
  store = [
    // Validaciones
    body('clienteId')
      .notEmpty()
      .withMessage('El ID del cliente es requerido')
      .isInt()
      .withMessage('El ID del cliente debe ser un número'),
    body('montoPrincipal')
      .notEmpty()
      .withMessage('El monto principal es requerido')
      .isFloat({ min: 1 })
      .withMessage('El monto debe ser mayor a 0'),
    body('cuotas')
      .notEmpty()
      .withMessage('El número de cuotas es requerido')
      .isInt({ min: 1 })
      .withMessage('El número de cuotas debe ser mayor a 0'),
    body('tasaInteresAplicada')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('La tasa de interés debe ser mayor o igual a 0'),
    body('fechaVencimiento')
      .optional()
      .isISO8601()
      .withMessage('Formato de fecha inválido'),
    
    validate,

    asyncHandler(async (req, res) => {
      const { clienteId, montoPrincipal, cuotas, tasaInteresAplicada, fechaVencimiento } = req.body;
      const createdBy = req.user.userId;

      const credit = await createCreditUseCase.execute({
        clienteId: parseInt(clienteId),
        montoPrincipal: parseFloat(montoPrincipal),
        cuotas: parseInt(cuotas),
        tasaInteresAplicada: tasaInteresAplicada ? parseFloat(tasaInteresAplicada) : null,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null
      }, createdBy);

      res.status(201).json({
        success: true,
        message: 'Crédito creado exitosamente',
        data: credit
      });
    })
  ];

  /**
   * GET /api/credits
   * Listar créditos con filtros
   * (Implementación básica - puedes expandirla)
   */
  index = asyncHandler(async (req, res) => {
    const creditRepository = require('../../infrastructure/repositories/PrismaCreditRepository');
    
    const { page = 1, limit = 10, estado, clienteId } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    if (estado) filters.estado = estado;
    if (clienteId) filters.clienteId = parseInt(clienteId);

    const { credits, total } = await creditRepository.findAll(filters);

    res.json({
      success: true,
      data: credits,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit)
      }
    });
  });

  /**
   * GET /api/credits/:id
   * Obtener un crédito por ID
   */
  show = [
    param('id')
      .isInt()
      .withMessage('El ID del crédito debe ser un número válido'),
    
    validate,

    asyncHandler(async (req, res) => {
      const creditRepository = require('../../infrastructure/repositories/PrismaCreditRepository');
      const creditId = parseInt(req.params.id);

      const credit = await creditRepository.findById(creditId);

      if (!credit) {
        return res.status(404).json({
          success: false,
          error: 'Crédito no encontrado',
          code: 'NOT_FOUND'
        });
      }

      // Calcular información adicional
      const montoTotal = Number(credit.montoPrincipal) * (1 + Number(credit.tasaInteresAplicada));
      const valorCuota = montoTotal / credit.cuotas;
      const totalPagado = await creditRepository.getTotalPaid(creditId);

      res.json({
        success: true,
        data: {
          ...credit,
          montoTotal: montoTotal.toFixed(2),
          valorCuota: valorCuota.toFixed(2),
          totalInteres: (Number(credit.montoPrincipal) * Number(credit.tasaInteresAplicada)).toFixed(2),
          totalPagado: Number(totalPagado).toFixed(2),
          saldoPendiente: (montoTotal - Number(totalPagado)).toFixed(2)
        }
      });
    })
  ];
}

module.exports = new CreditsController();