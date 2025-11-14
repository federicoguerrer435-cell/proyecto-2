const prisma = require('../../infrastructure/database/prismaClient');

class GetPaymentScheduleUseCase {
  async execute(date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const credits = await prisma.credit.findMany({
      where: {
        estado: 'ACTIVO',
        fechaVencimiento: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      include: {
        client: true,
      },
    });

    return credits;
  }
}

module.exports = new GetPaymentScheduleUseCase();
