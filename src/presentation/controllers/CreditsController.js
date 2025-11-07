const { query, param, body } = require('express-validator');
const validate = require('../middlewares/validate');
const asyncHandler = require('../middlewares/asyncHandler');

const listCreditsUseCase = require('../../application/use-cases/ListCreditsUseCase');
const createCreditUseCase = require('../../application/use-cases/CreateCreditUseCase');
const getCreditByIdUseCase = require('../../application/use-cases/GetCreditByIdUseCase');

class CreditsController {
  index = [
    query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número válido'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido'),
    query('nombre').optional().trim(),
    query('cedula').optional().trim(),
    query('telefono').optional().trim(),
    query('estado').optional().trim(),
    query('cobradorId').optional().isInt(),
    query('clienteId').optional().isInt(),
    query('cursor').optional().trim(),
    validate,

    asyncHandler(async (req, res) => {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        nombre: req.query.nombre,
        cedula: req.query.cedula,
        telefono: req.query.telefono,
        estado: req.query.estado,
        cobradorId: req.query.cobradorId,
        clienteId: req.query.clienteId,
        fechaDesde: req.query.fechaDesde,
        fechaHasta: req.query.fechaHasta,
        cursor: req.query.cursor
      };

      const result = await listCreditsUseCase.execute(filters);
      res.json({ success: true, data: result.credits, meta: { total: result.total, nextCursor: result.nextCursor } });
    })
  ];

  store = [
    body('client_id').notEmpty().isInt().withMessage('client_id es requerido y debe ser entero'),
    body('monto').notEmpty().withMessage('monto es requerido'),
    body('cuotas').notEmpty().isInt({ min: 1 }).withMessage('cuotas es requerido y debe ser entero mayor a 0'),
    body('tasa').optional().isFloat({ min: 0 }).withMessage('tasa inválida'),
    body('plazo').optional().isInt({ min: 1 }).withMessage('plazo inválido'),
    body('tipo_credito').optional().trim(),
    body('nota').optional().trim(),
    validate,

    asyncHandler(async (req, res) => {
      // Map incoming fields to domain fields
      const payload = {
        clienteId: parseInt(req.body.client_id),
        montoPrincipal: req.body.monto,
        cuotas: parseInt(req.body.cuotas),
        tasaInteresAplicada: req.body.tasa !== undefined ? req.body.tasa : undefined,
        // modalidadPago used to store tipo de crédito
        modalidadPago: req.body.tipo_credito,
        nota: req.body.nota
      };

      // If plazo provided (months), compute fechaVencimiento from now + plazo months
      if (req.body.plazo) {
        const months = parseInt(req.body.plazo);
        const fecha = new Date();
        fecha.setMonth(fecha.getMonth() + months);
        payload.fechaVencimiento = fecha;
      }

      const createdBy = req.body.created_by || req.user?.userId || req.user?.id || null;

      const credit = await createCreditUseCase.execute(payload, createdBy);
      res.status(201).json({ success: true, data: credit });
    })
  ];

  show = [
    param('id').isInt().withMessage('ID inválido'),
    validate,
    asyncHandler(async (req, res) => {
      const credit = await getCreditByIdUseCase.execute(req.params.id);
      res.json({ success: true, data: credit });
    })
  ];
}

module.exports = new CreditsController();
