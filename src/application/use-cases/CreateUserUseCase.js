const userRepository = require('../../infrastructure/repositories/PrismaUserRepository');
const passwordService = require('../../infrastructure/security/PasswordService');

/**
 * Caso de uso: Crear Usuario
 * Crea un nuevo usuario con validaciones
 */
class CreateUserUseCase {
  async execute(userData, createdBy) {
    const { nombre, email, password, telefono, roleIds = [] } = userData;

    // Validaciones
    if (!nombre || nombre.trim().length === 0) {
      throw new Error('El nombre es requerido');
    }

    if (!email || email.trim().length === 0) {
      throw new Error('El email es requerido');
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Formato de email inválido');
    }

    if (!password || password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    // Verificar que el email no exista
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hashear contraseña
    const passwordHash = await passwordService.hashPassword(password);

    // Crear usuario
    const newUser = await userRepository.create({
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      telefono: telefono?.trim() || null,
      isActive: true,
      createdBy,
      createdAt: new Date(),
      updatedBy: createdBy,
      updatedAt: new Date()
    });

    // Asignar roles si se proporcionan
    if (roleIds && roleIds.length > 0) {
      for (const roleId of roleIds) {
        await userRepository.assignRole(newUser.id, parseInt(roleId));
      }
    }

    // Obtener usuario con roles
    const userWithRoles = await userRepository.findById(newUser.id);
    const roles = userWithRoles.userRoles.map(ur => ur.role.name);

    return {
      id: newUser.id,
      nombre: newUser.nombre,
      email: newUser.email,
      telefono: newUser.telefono,
      isActive: newUser.isActive,
      roles,
      createdAt: newUser.createdAt
    };
  }
}

module.exports = new CreateUserUseCase();
