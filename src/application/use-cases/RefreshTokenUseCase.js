const jwtService = require('../../infrastructure/security/JwtService');
const refreshTokenRepository = require('../../infrastructure/repositories/PrismaRefreshTokenRepository');
const userRepository = require('../../infrastructure/repositories/PrismaUserRepository');

/**
 * Caso de uso: Refresh Token
 * Genera un nuevo access token usando un refresh token válido
 */
class RefreshTokenUseCase {
  async execute(refreshToken) {
    if (!refreshToken) {
      throw new Error('Refresh token es requerido');
    }

    // Verificar el token JWT
    let decoded;
    try {
      decoded = jwtService.verifyToken(refreshToken);
    } catch (error) {
      throw new Error('Refresh token inválido o expirado');
    }

    // Verificar que el refresh token existe en la base de datos y no está revocado
    const storedToken = await refreshTokenRepository.findByToken(refreshToken);
    
    if (!storedToken) {
      throw new Error('Refresh token no encontrado');
    }

    if (storedToken.revoked) {
      throw new Error('Refresh token revocado');
    }

    if (new Date(storedToken.expiresAt) < new Date()) {
      throw new Error('Refresh token expirado');
    }

    // Obtener usuario actualizado
    const user = await userRepository.findById(storedToken.userId);
    
    if (!user || !user.isActive) {
      throw new Error('Usuario no válido');
    }

    // Extraer roles
    const roles = user.userRoles.map(ur => ur.role.name);

    // Generar nuevo access token
    const newAccessToken = jwtService.generateAccessToken({
      userId: user.id,
      email: user.email,
      nombre: user.nombre,
      roles
    });

    // Opcional: Implementar refresh token rotation
    // Esto mejora la seguridad revocando el token viejo y generando uno nuevo
    const rotateTokens = process.env.REFRESH_TOKEN_ROTATION === 'true';
    
    let newRefreshToken = refreshToken;
    
    if (rotateTokens) {
      // Revocar el refresh token antiguo
      await refreshTokenRepository.revoke(refreshToken);
      
      // Generar nuevo refresh token
      newRefreshToken = jwtService.generateRefreshToken({
        userId: user.id,
        email: user.email,
        nombre: user.nombre,
        roles
      });
      
      // Guardar nuevo refresh token
      await refreshTokenRepository.create({
        userId: user.id,
        token: newRefreshToken,
        expiresAt: jwtService.getRefreshTokenExpirationDate(),
        revoked: false
      });
    }

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }
}

module.exports = new RefreshTokenUseCase();
