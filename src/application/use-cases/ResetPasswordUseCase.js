const prisma = require('../../infrastructure/database/prismaClient');
const passwordService = require('../../infrastructure/security/PasswordService');
const crypto = require('crypto');

class ResetPasswordUseCase {
  async execute(token, newPassword) {
    // 1. Hashear el token recibido para compararlo con el de la base de datos
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // 2. Buscar al usuario por el token y verificar que no haya expirado
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error('El token de reseteo es inválido o ha expirado.');
    }

    // 3. Hashear la nueva contraseña
    const passwordHash = await passwordService.hashPassword(newPassword);

    // 4. Actualizar la contraseña y anular el token de reseteo
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { success: true, message: 'Contraseña actualizada exitosamente.' };
  }
}

module.exports = new ResetPasswordUseCase();
