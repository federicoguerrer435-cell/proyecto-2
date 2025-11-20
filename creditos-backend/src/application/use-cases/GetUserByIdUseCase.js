const userRepository = require('../../infrastructure/repositories/PrismaUserRepository');

/**
 * Caso de uso: Obtener Usuario por ID
 * Retorna información detallada de un usuario
 */
class GetUserByIdUseCase {
  async execute(userId) {
    if (!userId) {
      throw new Error('ID de usuario es requerido');
    }

    const user = await userRepository.findById(parseInt(userId));

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Extraer roles y permisos
    const roles = user.userRoles.map(ur => ur.role.name);
    const permissions = [];
    
    user.userRoles.forEach(ur => {
      ur.role.rolePermissions.forEach(rp => {
        if (!permissions.find(p => p.name === rp.permission.name)) {
          permissions.push({
            name: rp.permission.name,
            module: rp.permission.module,
            action: rp.permission.action,
            description: rp.permission.description
          });
        }
      });
    });

    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono,
      isActive: user.isActive,
      roles,
      permissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      createdBy: user.createdBy,
      updatedBy: user.updatedBy
    };
  }
}

module.exports = new GetUserByIdUseCase();
