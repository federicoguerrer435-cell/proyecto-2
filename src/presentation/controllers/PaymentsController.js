const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const asyncHandler = require('../middlewares/asyncHandler');
const createPaymentUseCase = require('../../application/use-cases/CreatePaymentUseCase');

class PaymentsController {
  store = [
    body('creditId').notEmpty().isInt().withMessage('El ID del crédito es requerido'),
    body('monto').notEmpty().isDecimal({ decimal_digits: '2' }).withMessage('El monto es requerido y debe ser un número decimal'),
    body('metodoPago').notEmpty().isIn(['EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'TARJETA']).withMessage('El método de pago es inválido'),
    body('cuotaNumero').notEmpty().isInt({ min: 1 }).withMessage('El número de cuota es requerido'),
    body('comprobanteReferencia').optional().trim(),
    validate,
    asyncHandler(async (req, res) => {
      const { creditId, monto, metodoPago, cuotaNumero, comprobanteReferencia } = req.body;
      const createdBy = req.user?.userId || req.user?.id || null;

      const paymentData = {
        creditId: parseInt(creditId),
        monto: parseFloat(monto),
        metodoPago,
        cuotaNumero: parseInt(cuotaNumero),
        comprobanteReferencia,
      };

      const result = await createPaymentUseCase.execute(paymentData, createdBy);
      res.status(201).json({ success: true, data: result });
    }),
  ];
}

module.exports = new PaymentsController();
