const userRepository = require('../../infrastructure/repositories/PrismaUserRepository');

/**
 * Caso de uso: Eliminar Usuario
 * Realiza un soft delete del usuario (marca como inactivo)
 */
class DeleteUserUseCase {
  async execute(userId, deletedBy) {
    // Verificar que el usuario existe
    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw new Error('Usuario no encontrado');
    }

    // Validar que no sea el mismo usuario que intenta eliminarse
    if (userId === deletedBy) {
      throw new Error('No puedes eliminar tu propio usuario');
    }

    // Verificar si es el usuario administrador inicial
    if (existingUser.email === 'admin@creditos.com') {
      throw new Error('No se puede eliminar el usuario administrador principal');
    }

    // Soft delete: marcar como inactivo
    await userRepository.update(userId, {
      isActive: false,
      updatedBy: deletedBy,
      updatedAt: new Date()
    });

    // Si se requiere hard delete en el futuro, se puede usar:
    // await userRepository.delete(userId);

    return {
      message: 'Usuario desactivado exitosamente',
      userId
    };
  }

  /**
   * Eliminar permanentemente un usuario (hard delete)
   * Solo usar en casos especiales
   */
  async hardDelete(userId, deletedBy) {
    // Verificar que el usuario existe
    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw new Error('Usuario no encontrado');
    }

    // Validar que no sea el mismo usuario
    if (userId === deletedBy) {
      throw new Error('No puedes eliminar tu propio usuario');
    }

    // Verificar si es el usuario administrador inicial
    if (existingUser.email === 'admin@creditos.com') {
      throw new Error('No se puede eliminar el usuario administrador principal');
    }

    // Verificar que no tenga referencias críticas
    // (El CASCADE en el schema manejará las eliminaciones relacionadas)
    try {
      await userRepository.delete(userId);
      
      return {
        message: 'Usuario eliminado permanentemente',
        userId
      };
    } catch (error) {
      if (error.code === 'P2003') {
        throw new Error('No se puede eliminar el usuario porque tiene datos relacionados');
      }
      throw error;
    }
  }
}

module.exports = new DeleteUserUseCase();
