const asyncHandler = require('../middlewares/asyncHandler');
const { query } = require('express-validator');
const validate = require('../middlewares/validate');
const getPaymentScheduleUseCase = require('../../application/use-cases/GetPaymentScheduleUseCase');

class ReportsController {
  getPaymentSchedule = [
    query('date').notEmpty().isISO8601().withMessage('La fecha es requerida y debe estar en formato YYYY-MM-DD'),
    validate,
    asyncHandler(async (req, res) => {
      const { date } = req.query;
      const schedule = await getPaymentScheduleUseCase.execute(date);
      res.json({ success: true, data: schedule });
    }),
  ];
}

module.exports = new ReportsController();
