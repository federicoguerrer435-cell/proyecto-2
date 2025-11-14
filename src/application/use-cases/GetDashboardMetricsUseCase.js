const prisma = require('../../infrastructure/database/prismaClient');

class GetDashboardMetricsUseCase {
  async execute(user) {
    const isAdmin = user.roles.includes('ADMIN');
    const collectorId = !isAdmin ? user.userId : null;

    const whereClause = {
      client: {},
    };

    if (collectorId) {
      whereClause.client.assignedTo = collectorId;
    }

    const totalClients = await prisma.client.count({
      where: collectorId ? { assignedTo: collectorId } : {},
    });

    const activeCredits = await prisma.credit.count({
      where: {
        ...whereClause,
        estado: 'ACTIVO',
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const paymentsToday = await prisma.payment.aggregate({
      where: {
        ...whereClause,
        fechaPago: {
          gte: today,
          lt: tomorrow,
        },
      },
      _sum: {
        monto: true,
      },
    });

    const totalPortfolio = await prisma.credit.aggregate({
      where: {
        ...whereClause,
        estado: 'ACTIVO',
      },
      _sum: {
        montoPrincipal: true,
      },
    });

    return {
      totalClients,
      activeCredits,
      paymentsToday: paymentsToday._sum.monto || 0,
      totalPortfolio: totalPortfolio._sum.montoPrincipal || 0,
    };
  }
}

module.exports = new GetDashboardMetricsUseCase();
