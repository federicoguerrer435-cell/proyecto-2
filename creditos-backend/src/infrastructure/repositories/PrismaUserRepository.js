const prisma = require('../database/prismaClient');

/**
 * Repositorio de Usuarios usando Prisma
 */
class PrismaUserRepository {
  /**
   * Busca un usuario por email
   */
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  /**
   * Busca un usuario por ID
   */
  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  /**
   * Crea un nuevo usuario
   */
  async create(userData) {
    return await prisma.user.create({
      data: userData
    });
  }

  /**
   * Actualiza un usuario
   */
  async update(id, userData) {
    return await prisma.user.update({
      where: { id },
      data: userData
    });
  }

  /**
   * Elimina un usuario
   */
  async delete(id) {
    return await prisma.user.delete({
      where: { id }
    });
  }

  /**
   * Lista usuarios con paginación
   */
  async findAll({ page = 1, limit = 10, search = '', isActive = null }) {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (isActive !== null) {
      where.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          userRoles: {
            include: {
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return { users, total };
  }

  /**
   * Asigna un rol a un usuario
   */
  async assignRole(userId, roleId) {
    return await prisma.userRole.create({
      data: {
        userId,
        roleId
      }
    });
  }

  /**
   * Remueve un rol de un usuario
   */
  async removeRole(userId, roleId) {
    return await prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      }
    });
  }

  /**
   * Obtiene los permisos de un usuario
   */
  async getUserPermissions(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) return [];

    const permissions = [];
    user.userRoles.forEach(userRole => {
      userRole.role.rolePermissions.forEach(rp => {
        permissions.push(rp.permission);
      });
    });

    return permissions;
  }
}

module.exports = new PrismaUserRepository();
