const refreshTokenRepository = require('../../infrastructure/repositories/PrismaRefreshTokenRepository');

/**
 * Caso de uso: Logout de Usuario
 * Revoca el refresh token del usuario
 */
class LogoutUserUseCase {
  async execute(refreshToken) {
    if (!refreshToken) {
      throw new Error('Refresh token es requerido');
    }

    // Verificar que el token existe
    const storedToken = await refreshTokenRepository.findByToken(refreshToken);
    
    if (!storedToken) {
      // Si el token no existe, simplemente retornar éxito
      // (el usuario ya está "deslogueado")
      return { success: true };
    }

    // Revocar el token
    await refreshTokenRepository.revoke(refreshToken);

    return { success: true };
  }

  /**
   * Revoca todos los refresh tokens de un usuario
   * Útil para "logout de todas las sesiones"
   */
  async executeAll(userId) {
    if (!userId) {
      throw new Error('User ID es requerido');
    }

    await refreshTokenRepository.revokeAllByUser(userId);

    return { success: true };
  }
}

module.exports = new LogoutUserUseCase();
