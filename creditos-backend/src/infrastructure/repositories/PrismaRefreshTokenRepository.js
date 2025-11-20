const prisma = require('../database/prismaClient');

/**
 * Repositorio de Refresh Tokens usando Prisma
 */
class PrismaRefreshTokenRepository {
  /**
   * Crea un nuevo refresh token
   */
  async create(tokenData) {
    return await prisma.refreshToken.create({
      data: tokenData
    });
  }

  /**
   * Busca un refresh token por token
   */
  async findByToken(token) {
    return await prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            userRoles: {
              include: {
                role: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Revoca un refresh token
   */
  async revoke(token) {
    return await prisma.refreshToken.update({
      where: { token },
      data: { revoked: true }
    });
  }

  /**
   * Revoca todos los refresh tokens de un usuario
   */
  async revokeAllByUser(userId) {
    return await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true }
    });
  }

  /**
   * Elimina refresh tokens expirados
   */
  async deleteExpired() {
    const now = new Date();
    return await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    });
  }

  /**
   * Verifica si un token está vigente
   */
  async isValid(token) {
    const refreshToken = await this.findByToken(token);
    
    if (!refreshToken) return false;
    if (refreshToken.revoked) return false;
    if (new Date(refreshToken.expiresAt) < new Date()) return false;
    
    return true;
  }
}

module.exports = new PrismaRefreshTokenRepository();
