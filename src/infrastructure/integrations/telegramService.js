const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Telegram Service
 * Handles sending messages via the Telegram Bot API
 */
class TelegramService {
  /**
   * Sends a text message to a specific chat.
   * @param {string} chatId - The ID of the chat to send the message to.
   * @param {string} text - The message text.
   * @returns {Promise<Object>} The response from the Telegram API.
   */
  async sendMessage(chatId, text) {
    if (!TELEGRAM_BOT_TOKEN) {
      console.error('Error: El token del bot de Telegram no está configurado.');
      throw new Error('Telegram Bot token not configured.');
    }

    try {
      const response = await axios.post(`${API_URL}/sendMessage`, {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error enviando mensaje de Telegram:', error.response ? error.response.data : error.message);
      return { success: false, error: error.response ? error.response.data : error.message };
    }
  }

  /**
   * Sends a document (PDF, image, etc.) to a specific chat.
   * @param {string} chatId - The ID of the chat to send the document to.
   * @param {Buffer} fileBuffer - The file buffer.
   * @param {string} fileName - The name of the file.
   * @param {string} caption - Optional caption for the document.
   * @returns {Promise<Object>} The response from the Telegram API.
   */
  async sendDocument(chatId, fileBuffer, fileName, caption = '') {
    if (!TELEGRAM_BOT_TOKEN) {
      console.error('Error: El token del bot de Telegram no está configurado.');
      throw new Error('Telegram Bot token not configured.');
    }

    try {
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('document', fileBuffer, { filename: fileName });
      if (caption) {
        formData.append('caption', caption);
        formData.append('parse_mode', 'Markdown');
      }

      const response = await axios.post(`${API_URL}/sendDocument`, formData, {
        headers: formData.getHeaders(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error enviando documento de Telegram:', error.response ? error.response.data : error.message);
      return { success: false, error: error.response ? error.response.data : error.message };
    }
  }

  /**
   * Sends a photo to a specific chat.
   * @param {string} chatId - The ID of the chat to send the photo to.
   * @param {Buffer} photoBuffer - The photo buffer.
   * @param {string} caption - Optional caption for the photo.
   * @returns {Promise<Object>} The response from the Telegram API.
   */
  async sendPhoto(chatId, photoBuffer, caption = '') {
    if (!TELEGRAM_BOT_TOKEN) {
      console.error('Error: El token del bot de Telegram no está configurado.');
      throw new Error('Telegram Bot token not configured.');
    }

    try {
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('photo', photoBuffer, { filename: 'ticket.png' });
      if (caption) {
        formData.append('caption', caption);
        formData.append('parse_mode', 'Markdown');
      }

      const response = await axios.post(`${API_URL}/sendPhoto`, formData, {
        headers: formData.getHeaders(),
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error enviando foto de Telegram:', error.response ? error.response.data : error.message);
      return { success: false, error: error.response ? error.response.data : error.message };
    }
  }
}

module.exports = new TelegramService();
