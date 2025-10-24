const prisma = require('../database/prismaClient');

/**
 * Repositorio de Pagos usando Prisma
 */
class PrismaPaymentRepository {
  /**
   * Crea un nuevo pago
   */
  async create(paymentData) {
    return await prisma.payment.create({
      data: paymentData,
      include: {
        credit: true,
        client: true,
        cobrador: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Busca un pago por ID
   */
  async findById(id) {
    return await prisma.payment.findUnique({
      where: { id },
      include: {
        credit: true,
        client: true,
        cobrador: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        },
        tickets: true
      }
    });
  }

  /**
   * Lista pagos con paginación y filtros
   */
  async findAll({ page = 1, limit = 10, clienteId, creditId, userId, fechaDesde, fechaHasta }) {
    const skip = (page - 1) * limit;
    
    const where = {};
    
    if (clienteId) {
      where.clienteId = parseInt(clienteId);
    }
    if (creditId) {
      where.creditId = parseInt(creditId);
    }
    if (userId) {
      where.userId = parseInt(userId);
    }
    if (fechaDesde || fechaHasta) {
      where.fechaPago = {};
      if (fechaDesde) {
        where.fechaPago.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.fechaPago.lte = new Date(fechaHasta);
      }
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          credit: {
            select: {
              id: true,
              numeroCredito: true,
              montoPrincipal: true
            }
          },
          client: {
            select: {
              id: true,
              nombre: true,
              cedula: true
            }
          },
          cobrador: {
            select: {
              id: true,
              nombre: true
            }
          }
        },
        orderBy: { fechaPago: 'desc' }
      }),
      prisma.payment.count({ where })
    ]);

    return { payments, total };
  }

  /**
   * Obtiene pagos por crédito
   */
  async findByCreditId(creditId) {
    return await prisma.payment.findMany({
      where: { creditId },
      orderBy: { cuotaNumero: 'asc' }
    });
  }

  /**
   * Obtiene el total pagado por un crédito
   */
  async getTotalPaidByCredit(creditId) {
    const result = await prisma.payment.aggregate({
      where: { creditId },
      _sum: {
        monto: true
      }
    });

    return result._sum.monto || 0;
  }
}

module.exports = new PrismaPaymentRepository();
