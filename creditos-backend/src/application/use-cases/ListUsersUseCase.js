const userRepository = require('../../infrastructure/repositories/PrismaUserRepository');

/**
 * Caso de uso: Listar Usuarios
 * Lista usuarios con paginación y filtros
 */
class ListUsersUseCase {
  async execute({ page = 1, limit = 10, search = '', isActive = null, role = null }) {
    // Validar parámetros
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    
    // Limitar el límite máximo
    if (limit > 100) limit = 100;
    if (page < 1) page = 1;

    // Obtener usuarios
    const { users, total } = await userRepository.findAll({
      page,
      limit,
      search,
      isActive,
      role
    });

    // Calcular metadata de paginación
    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => ({
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        isActive: user.isActive,
        roles: user.userRoles.map(ur => ur.role.name),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
      meta: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }
}

module.exports = new ListUsersUseCase();
