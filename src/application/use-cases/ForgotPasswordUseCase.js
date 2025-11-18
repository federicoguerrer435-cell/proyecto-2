const prisma = require('../../infrastructure/database/prismaClient');
const emailService = require('../../infrastructure/integrations/emailService');
const telegramService = require('../../infrastructure/integrations/telegramService');
const crypto = require('crypto');

class ForgotPasswordUseCase {
  async execute(email) {
    // 1. Buscar al usuario por email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Por seguridad, no revelamos si el usuario existe o no
      console.warn(`Intento de recuperación de contraseña para email no existente: ${email}`);
      return { success: true, message: 'Si su email está registrado, recibirá un correo de recuperación.' };
    }

    // 2. Generar un token de reseteo
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // 3. Establecer fecha de expiración (e.g., 1 hora)
    const resetPasswordExpires = new Date(Date.now() + 3600000);

    // 4. Guardar el token y la fecha de expiración en la base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken,
        resetPasswordExpires,
      },
    });

    // 5. Enviar el email de recuperación
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const subject = 'Recuperación de Contraseña';
    const text = `Ha solicitado un reseteo de contraseña. Por favor, haga clic en el siguiente enlace o péguelo en su navegador para completar el proceso:\n\n${resetUrl}\n\nSi no ha solicitado esto, por favor ignore este email.`;

    await emailService.sendEmail(user.email, subject, text);

    // Enviar también por Telegram si el usuario tiene un chatId
    if (user.telegramChatId) {
      const telegramMessage = `Hola ${user.nombre}, ha solicitado un reseteo de contraseña. Use el siguiente enlace para continuar: ${resetUrl}`;
      try {
        await telegramService.sendMessage(user.telegramChatId, telegramMessage);
      } catch (error) {
        console.error(`Error enviando notificación de reseteo por Telegram a ${user.telegramChatId}:`, error);
      }
    }

    const response = { success: true, message: 'Se han enviado las instrucciones de recuperación.' };

    // Solo para fines de prueba en desarrollo
    if (process.env.NODE_ENV === 'development') {
      response.resetToken = resetToken;
    }

    return response;
  }
}

module.exports = new ForgotPasswordUseCase();
