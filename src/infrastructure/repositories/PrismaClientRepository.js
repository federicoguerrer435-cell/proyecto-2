const prisma = require('../database/prismaClient');

/**
 * Repositorio de Clientes usando Prisma
 */
class PrismaClientRepository {
  /**
   * Crea un nuevo cliente
   */
  async create(clientData) {
    return await prisma.client.create({
      data: clientData,
      include: {
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
   * Busca un cliente por ID
   */
  async findById(id) {
    return await prisma.client.findUnique({
      where: { id },
      include: {
        cobrador: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        },
        credits: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
  }

  /**
   * Busca un cliente por cédula
   */
  async findByCedula(cedula) {
    return await prisma.client.findUnique({
      where: { cedula }
    });
  }

  /**
   * Lista clientes con paginación y filtros
   */
  async findAll({ page = 1, limit = 10, nombre, cedula, telefono, assignedTo, email, isActive = null }) {
    // Coerce query params to numbers when they come as strings
    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const skip = (p - 1) * l;

    const where = {};
    
    if (nombre) {
      where.nombre = { contains: nombre, mode: 'insensitive' };
    }
    if (cedula) {
      where.cedula = { contains: cedula, mode: 'insensitive' };
    }
    if (telefono) {
      where.telefono = { contains: telefono, mode: 'insensitive' };
    }
    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }
    if (isActive !== null && isActive !== undefined) {
      // accept boolean or string 'true'/'false' or '1'/'0'
      if (typeof isActive === 'string') {
        where.isActive = (isActive === 'true' || isActive === '1');
      } else {
        where.isActive = Boolean(isActive);
      }
    }
    if (assignedTo) {
      const at = parseInt(assignedTo);
      if (!Number.isNaN(at)) where.assignedTo = at;
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: l,
        include: {
          cobrador: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          },
          _count: {
            select: {
              credits: true,
              payments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.client.count({ where })
    ]);

    return { clients, total };
  }

  /**
   * Actualiza un cliente
   */
  async update(id, clientData) {
    return await prisma.client.update({
      where: { id },
      data: clientData,
      include: {
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
   * Elimina un cliente
   */
  async delete(id) {
  return await prisma.client.update({
    where: { id },
    data: {
      deletedAt: new Date()
    }
  });
}


  /**
   * Busca clientes por nombre (búsqueda parcial)
   */
  async searchByName(nombre) {
    return await prisma.client.findMany({
      where: {
        nombre: {
          contains: nombre,
          mode: 'insensitive'
        }
      },
      take: 10
    });
  }

  /**
   * Busca clientes por teléfono
   */
  async searchByTelefono(telefono) {
    return await prisma.client.findMany({
      where: {
        telefono: {
          contains: telefono
        }
      },
      take: 10
    });
  }
}

module.exports = new PrismaClientRepository();
