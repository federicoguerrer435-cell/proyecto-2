const prisma = require('../database/prismaClient');

/**
 * Repositorio de Créditos usando Prisma
 */
class PrismaCreditRepository {
  /**
   * Crea un nuevo crédito
   */
  async create(creditData) {
    return await prisma.credit.create({
      data: creditData,
      include: {
        client: true
      }
    });
  }

  /**
   * Busca un crédito por ID
   */
  async findById(id) {
    return await prisma.credit.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            cobrador: {
              select: {
                id: true,
                nombre: true,
                email: true
              }
            }
          }
        },
        payments: {
          orderBy: { fechaPago: 'desc' }
        }
      }
    });
  }

  /**
   * Busca un crédito por número
   */
  async findByNumeroCredito(numeroCredito) {
    return await prisma.credit.findUnique({
      where: { numeroCredito },
      include: {
        client: true
      }
    });
  }

  /**
   * Verifica si un cliente tiene créditos activos o incumplidos
   * (Solo debe tener UN crédito activo a la vez)
   */
  async hasActiveCredit(clienteId) {
    const activeCredit = await prisma.credit.findFirst({
      where: {
        clienteId,
        OR: [
          { estado: 'ACTIVO' },
          { estado: 'INCUMPLIDO' }
        ]
      }
    });

    return activeCredit !== null;
  }

  /**
   * Lista créditos con paginación y filtros
   */
  async findAll({ page = 1, limit = 10, estado, cobradorId, clienteId, fechaDesde, fechaHasta, nombre, cedula, telefono, cursor = null }) {
    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const cursorId = cursor ? parseInt(cursor) : null;
    const skip = cursorId ? 0 : (p - 1) * l;

    const where = {};

    if (estado) {
      where.estado = estado;
    }
    if (clienteId) {
      where.clienteId = parseInt(clienteId);
    }
    if (cobradorId) {
      where.client = { assignedTo: parseInt(cobradorId) };
    }
    if (fechaDesde || fechaHasta) {
      where.createdAt = {};
      if (fechaDesde) {
        where.createdAt.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.createdAt.lte = new Date(fechaHasta);
      }
    }

    // client related filters
    if (nombre || cedula || telefono) {
      where.client = where.client || {};
      where.client = {
        ...where.client,
        ...(nombre ? { nombre: { contains: nombre, mode: 'insensitive' } } : {}),
        ...(cedula ? { cedula: cedula } : {}),
        ...(telefono ? { telefono: { contains: telefono } } : {})
      };
    }

    const findArgs = {
      where,
      include: {
        client: {
          select: {
            id: true,
            nombre: true,
            cedula: true,
            telefono: true,
            assignedTo: true,
            cobrador: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        },
        _count: {
          select: {
            payments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    };

    if (cursorId) {
      findArgs.cursor = { id: cursorId };
      findArgs.skip = 1;
      findArgs.take = l;
    } else {
      findArgs.skip = skip;
      findArgs.take = l;
    }

    const [credits, total] = await Promise.all([
      prisma.credit.findMany(findArgs),
      prisma.credit.count({ where })
    ]);

    let nextCursor = null;
    if (credits.length === l) nextCursor = credits[credits.length - 1].id;

    return { credits, total, nextCursor };
  }

  /**
   * Actualiza un crédito
   */
  async update(id, creditData) {
    return await prisma.credit.update({
      where: { id },
      data: creditData,
      include: {
        client: true
      }
    });
  }

  /**
   * Elimina un crédito
   */
  async delete(id) {
  return await prisma.credit.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

  /**
   * Obtiene créditos próximos a vencer (para recordatorios)
   */
  async findUpcomingDue(dias = 3) {
    const hoy = new Date();
    const futuro = new Date();
    futuro.setDate(futuro.getDate() + dias);

    return await prisma.credit.findMany({
      where: {
        estado: 'ACTIVO',
        fechaVencimiento: {
          gte: hoy,
          lte: futuro
        }
      },
      include: {
        client: true
      }
    });
  }

  /**
   * Obtiene créditos vencidos
   */
  async findOverdue() {
    const hoy = new Date();

    return await prisma.credit.findMany({
      where: {
        OR: [
          { estado: 'ACTIVO' },
          { estado: 'INCUMPLIDO' }
        ],
        fechaVencimiento: {
          lt: hoy
        }
      },
      include: {
        client: true
      }
    });
  }

  /**
   * Calcula el total pagado de un crédito
   */
  async getTotalPaid(creditId) {
    const result = await prisma.payment.aggregate({
      where: { creditId },
      _sum: {
        monto: true
      }
    });

    return result._sum.monto || 0;
  }

  /**
   * Genera número de crédito único
   */
  async generateCreditNumber() {
    const year = new Date().getFullYear();
    const prefix = `CRE-${year}-`;
    
    // Obtener el último número
    const lastCredit = await prisma.credit.findFirst({
      where: {
        numeroCredito: {
          startsWith: prefix
        }
      },
      orderBy: {
        numeroCredito: 'desc'
      }
    });

    let nextNumber = 1;
    if (lastCredit) {
      const lastNumber = parseInt(lastCredit.numeroCredito.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${String(nextNumber).padStart(6, '0')}`;
  }
}

module.exports = new PrismaCreditRepository();
