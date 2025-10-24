const userRepository = require('../../infrastructure/repositories/PrismaUserRepository');
const passwordService = require('../../infrastructure/security/PasswordService');

/**
 * Caso de uso: Actualizar Usuario
 * Actualiza los datos de un usuario existente
 */
class UpdateUserUseCase {
  async execute(userId, userData, updatedBy) {
    const { nombre, email, password, telefono, isActive, roleIds } = userData;

    // Verificar que el usuario existe
    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw new Error('Usuario no encontrado');
    }

    const updateData = {
      updatedBy,
      updatedAt: new Date()
    };

    // Validar y actualizar nombre
    if (nombre !== undefined) {
      if (nombre.trim().length === 0) {
        throw new Error('El nombre no puede estar vacío');
      }
      updateData.nombre = nombre.trim();
    }

    // Validar y actualizar email
    if (email !== undefined) {
      if (email.trim().length === 0) {
        throw new Error('El email no puede estar vacío');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Formato de email inválido');
      }

      const emailLower = email.toLowerCase().trim();
      
      // Verificar que el email no esté en uso por otro usuario
      if (emailLower !== existingUser.email.toLowerCase()) {
        const userWithEmail = await userRepository.findByEmail(emailLower);
        if (userWithEmail && userWithEmail.id !== userId) {
          throw new Error('El email ya está en uso por otro usuario');
        }
      }
      
      updateData.email = emailLower;
    }

    // Actualizar contraseña si se proporciona
    if (password !== undefined) {
      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      updateData.passwordHash = await passwordService.hashPassword(password);
    }

    // Actualizar teléfono
    if (telefono !== undefined) {
      updateData.telefono = telefono?.trim() || null;
    }

    // Actualizar estado activo
    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    // Actualizar datos básicos del usuario
    await userRepository.update(userId, updateData);

    // Actualizar roles si se proporcionan
    if (roleIds !== undefined) {
      // Obtener roles actuales
      const currentUser = await userRepository.findById(userId);
      const currentRoleIds = currentUser.userRoles.map(ur => ur.roleId);

      // Roles a agregar
      const roleIdsInt = roleIds.map(id => parseInt(id));
      const rolesToAdd = roleIdsInt.filter(id => !currentRoleIds.includes(id));
      
      // Roles a eliminar
      const rolesToRemove = currentRoleIds.filter(id => !roleIdsInt.includes(id));

      // Agregar nuevos roles
      for (const roleId of rolesToAdd) {
        await userRepository.assignRole(userId, roleId);
      }

      // Eliminar roles que ya no están
      for (const roleId of rolesToRemove) {
        await userRepository.removeRole(userId, roleId);
      }
    }

    // Obtener usuario actualizado con roles
    const updatedUser = await userRepository.findById(userId);
    const roles = updatedUser.userRoles.map(ur => ur.role.name);

    return {
      id: updatedUser.id,
      nombre: updatedUser.nombre,
      email: updatedUser.email,
      telefono: updatedUser.telefono,
      isActive: updatedUser.isActive,
      roles,
      updatedAt: updatedUser.updatedAt
    };
  }
}

module.exports = new UpdateUserUseCase();
