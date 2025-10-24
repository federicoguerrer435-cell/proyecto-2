const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Email Service
 * Servicio para envío de emails (opcional)
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Inicializa el transporter de nodemailer
   */
  initializeTransporter() {
    const emailConfig = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    };

    // Solo inicializar si está configurado
    if (emailConfig.host && emailConfig.auth.user && emailConfig.auth.pass) {
      this.transporter = nodemailer.createTransporter(emailConfig);
    } else {
      console.warn('Email service not configured');
    }
  }

  /**
   * Envía un email
   * @param {string} to - Destinatario
   * @param {string} subject - Asunto
   * @param {string} text - Contenido en texto plano
   * @param {string} html - Contenido en HTML
   * @returns {Promise<Object>} Resultado del envío
   */
  async sendEmail(to, subject, text, html = null) {
    try {
      if (!this.transporter) {
        console.warn('Email not configured. Email not sent:', { to, subject });
        return {
          success: false,
          error: 'Email service not configured',
          mock: true
        };
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        text,
        html: html || text
      };

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envía notificación de recordatorio de pago
   * @param {string} email - Email del cliente
   * @param {Object} credit - Datos del crédito
   * @returns {Promise<Object>} Resultado del envío
   */
  async sendPaymentReminder(email, credit) {
    const subject = 'Recordatorio de Pago - Crédito ' + credit.numeroCredito;
    const text = `
      Estimado cliente,
      
      Le recordamos que tiene un pago pendiente para su crédito ${credit.numeroCredito}.
      
      Monto del crédito: $${credit.montoPrincipal}
      Fecha de vencimiento: ${new Date(credit.fechaVencimiento).toLocaleDateString('es-ES')}
      
      Por favor, realice su pago a tiempo para evitar cargos adicionales.
      
      Gracias.
    `;

    return this.sendEmail(email, subject, text);
  }
}

module.exports = new EmailService();
