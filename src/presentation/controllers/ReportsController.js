const asyncHandler = require('../middlewares/asyncHandler');
const { query } = require('express-validator');
const validate = require('../middlewares/validate');
const getPaymentScheduleUseCase = require('../../application/use-cases/GetPaymentScheduleUseCase');
const downloadMetricsReportUseCase = require('../../application/use-cases/DownloadMetricsReportUseCase');

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

  downloadMetrics = asyncHandler(async (req, res) => {
    const user = { userId: req.user.userId, role: req.user.role };
    const buffer = await downloadMetricsReportUseCase.execute(user);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte-metricas-${new Date().toISOString().split('T')[0]}.xlsx"`
    );

    res.send(buffer);
  });
}

module.exports = new ReportsController();
