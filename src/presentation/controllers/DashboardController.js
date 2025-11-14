const asyncHandler = require('../middlewares/asyncHandler');
const getDashboardMetricsUseCase = require('../../application/use-cases/GetDashboardMetricsUseCase');

class DashboardController {
  getMetrics = asyncHandler(async (req, res) => {
    const metrics = await getDashboardMetricsUseCase.execute(req.user);
    res.json({ success: true, data: metrics });
  });
}

module.exports = new DashboardController();
