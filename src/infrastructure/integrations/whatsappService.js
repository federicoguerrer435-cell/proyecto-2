const axios = require('axios');
require('dotenv').config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';

/**
 * WhatsApp Service
 * Integración con WhatsApp Cloud API para envío de mensajes
 */
class WhatsAppService {
  /**
   * Envía un mensaje de texto por WhatsApp
   * @param {string} phoneNumber - Número de teléfono (formato: 521234567890)
   * @param {string} message - Mensaje a enviar
   * @returns {Promise<Object>} Respuesta de la API
   */
  async sendTextMessage(phoneNumber, message) {
    try {
      // Validar configuración
      if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
        console.warn('WhatsApp not configured. Message not sent:', { phoneNumber, message });
        return {
          success: false,
          error: 'WhatsApp not configured',
          mock: true
        };
      }

      // Formatear número de teléfono (remover caracteres no numéricos)
      const formattedPhone = phoneNumber.replace(/\D/g, '');

      const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`;
      
      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: {
            body: message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        messageId: response.data.messages?.[0]?.id
      };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        errorDetails: error.response?.data
      };
    }
  }

  /**
   * Envía un mensaje con plantilla
   * @param {string} phoneNumber - Número de teléfono
   * @param {string} templateName - Nombre de la plantilla
   * @param {Array} parameters - Parámetros de la plantilla
   * @returns {Promise<Object>} Respuesta de la API
   */
  async sendTemplateMessage(phoneNumber, templateName, parameters = []) {
    try {
      if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
        console.warn('WhatsApp not configured. Template message not sent:', { phoneNumber, templateName });
        return {
          success: false,
          error: 'WhatsApp not configured',
          mock: true
        };
      }

      const formattedPhone = phoneNumber.replace(/\D/g, '');
      const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`;

      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'es'
            },
            components: parameters.length > 0 ? [
              {
                type: 'body',
                parameters: parameters.map(param => ({
                  type: 'text',
                  text: param
                }))
              }
            ] : []
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        messageId: response.data.messages?.[0]?.id
      };
    } catch (error) {
      console.error('Error sending WhatsApp template:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        errorDetails: error.response?.data
      };
    }
  }

  /**
   * Envía el PDF del ticket por WhatsApp
   * @param {string} phoneNumber - Número de teléfono
   * @param {Buffer} pdfBuffer - Buffer del PDF
   * @param {string} caption - Mensaje adjunto al PDF
   * @returns {Promise<Object>} Respuesta de la API
   */
  async sendPDFDocument(phoneNumber, pdfBuffer, caption = '') {
    try {
      if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
        console.warn('WhatsApp not configured. PDF not sent:', { phoneNumber });
        return {
          success: false,
          error: 'WhatsApp not configured',
          mock: true
        };
      }

      // Por simplicidad, enviamos un mensaje de texto indicando que el PDF está disponible
      // En producción, deberías subir el PDF a un servidor y enviar el link
      const message = caption || 'Su comprobante de pago ha sido generado. Puede solicitarlo al cobrador.';
      return await this.sendTextMessage(phoneNumber, message);
    } catch (error) {
      console.error('Error sending PDF via WhatsApp:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new WhatsAppService();
