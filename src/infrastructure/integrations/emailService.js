const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

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

    if (emailConfig.host && emailConfig.auth.user && emailConfig.auth.pass) {
      this.transporter = nodemailer.createTransport(emailConfig);
    } else {
      console.warn('Email service not configured');
    }
  }

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
