const passwordService = require('../../infrastructure/security/PasswordService');
const jwtService = require('../../infrastructure/security/JwtService');
const userRepository = require('../../infrastructure/repositories/PrismaUserRepository');
const refreshTokenRepository = require('../../infrastructure/repositories/PrismaRefreshTokenRepository');

/**
 * Caso de uso: Login de Usuario
 * Autentica un usuario y retorna access token + refresh token
 */
class LoginUserUseCase {
  async execute(email, password) {
    // Validar entrada
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    // Buscar usuario por email
    const user = await userRepository.findByEmail(email);
    
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new Error('Usuario inactivo');
    }

    // Verificar contraseña
    const isPasswordValid = await passwordService.comparePasswords(password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    // Extraer roles y permisos
    const roles = user.userRoles.map(ur => ur.role.name);
    const permissions = [];
    user.userRoles.forEach(ur => {
      ur.role.rolePermissions.forEach(rp => {
        permissions.push({
          name: rp.permission.name,
          module: rp.permission.module,
          action: rp.permission.action
        });
      });
    });

    // Preparar payload del token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      nombre: user.nombre,
      roles
    };

    // Generar access token y refresh token
    const { accessToken, refreshToken } = jwtService.generateTokens(tokenPayload);

    // Guardar refresh token en la base de datos
    await refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: jwtService.getRefreshTokenExpirationDate()
    });

    // Retornar usuario (sin password) y tokens
    const userResponse = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      telefono: user.telefono,
      isActive: user.isActive,
      roles,
      permissions,
      createdAt: user.createdAt
    };

    return {
      user: userResponse,
      accessToken,
      refreshToken
    };
  }
}

module.exports = new LoginUserUseCase();
