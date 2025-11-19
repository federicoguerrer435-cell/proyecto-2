const PDFDocument = require('pdfkit');
const { pdf } = require('pdf-to-img');
const sharp = require('sharp');

/**
 * PDF Service
 * Genera PDFs para tickets de pago
 */
class PDFService {
  /**
   * Genera un PDF de ticket de pago
   * @param {Object} payment - Datos del pago
   * @param {Object} client - Datos del cliente
   * @param {Object} credit - Datos del crédito
   * @param {string} numeroComprobante - Número del comprobante
   * @returns {Promise<Buffer>} Buffer del PDF generado
   */
  async generateTicketPDF(payment, client, credit, numeroComprobante) {
    return new Promise((resolve, reject) => {
      try {
        // Crear documento PDF
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        // Buffer para almacenar el PDF
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Encabezado
        doc.fontSize(20).font('Helvetica-Bold').text('COMPROBANTE DE PAGO', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(`Número: ${numeroComprobante}`, { align: 'center' });
        doc.moveDown(1);

        // Línea divisoria
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);

        // Información del cliente
        doc.fontSize(14).font('Helvetica-Bold').text('DATOS DEL CLIENTE', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        doc.text(`Nombre: ${client.nombre}`);
        doc.text(`Cédula: ${client.cedula}`);
        doc.text(`Teléfono: ${client.telefono}`);
        if (client.direccion) {
          doc.text(`Dirección: ${client.direccion}`);
        }
        doc.moveDown(1);

        // Información del crédito
        doc.fontSize(14).font('Helvetica-Bold').text('DATOS DEL CRÉDITO', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        doc.text(`Número de Crédito: ${credit.numeroCredito}`);
        doc.text(`Monto Principal: $${Number(credit.montoPrincipal).toFixed(2)}`);
        doc.text(`Tasa de Interés: ${(Number(credit.tasaInteresAplicada) * 100).toFixed(2)}%`);
        doc.text(`Cuotas: ${credit.cuotas}`);
        doc.text(`Estado: ${credit.estado}`);
        doc.moveDown(1);

        // Información del pago
        doc.fontSize(14).font('Helvetica-Bold').text('DATOS DEL PAGO', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        doc.text(`Fecha de Pago: ${new Date(payment.fechaPago).toLocaleDateString('es-ES')}`);
        doc.text(`Método de Pago: ${payment.metodoPago}`);
        doc.text(`Cuota Número: ${payment.cuotaNumero} de ${credit.cuotas}`);
        
        // Monto destacado
        doc.moveDown(0.5);
        doc.fontSize(16).font('Helvetica-Bold');
        doc.text(`MONTO PAGADO: $${Number(payment.monto).toFixed(2)}`, { 
          align: 'center',
          underline: true 
        });
        doc.moveDown(1);

        if (payment.comprobanteReferencia) {
          doc.fontSize(11).font('Helvetica');
          doc.text(`Referencia: ${payment.comprobanteReferencia}`);
          doc.moveDown(1);
        }

        // Línea divisoria
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);

        // Pie de página
        doc.fontSize(9).font('Helvetica').text(
          'Este documento es un comprobante de pago válido.',
          { align: 'center' }
        );
        doc.text(
          `Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`,
          { align: 'center' }
        );

        // Finalizar documento
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera un reporte de créditos en PDF
   * @param {Array} credits - Lista de créditos
   * @param {Object} filters - Filtros aplicados
   * @returns {Promise<Buffer>} Buffer del PDF generado
   */
  async generateCreditReportPDF(credits, filters = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Título
        doc.fontSize(18).font('Helvetica-Bold').text('REPORTE DE CRÉDITOS', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(
          `Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`,
          { align: 'center' }
        );
        doc.moveDown(1);

        // Filtros aplicados
        if (Object.keys(filters).length > 0) {
          doc.fontSize(12).font('Helvetica-Bold').text('Filtros aplicados:');
          doc.fontSize(10).font('Helvetica');
          Object.entries(filters).forEach(([key, value]) => {
            if (value) doc.text(`${key}: ${value}`);
          });
          doc.moveDown(1);
        }

        // Lista de créditos
        doc.fontSize(12).font('Helvetica-Bold').text(`Total de créditos: ${credits.length}`);
        doc.moveDown(1);

        credits.forEach((credit, index) => {
          doc.fontSize(11).font('Helvetica-Bold').text(`${index + 1}. ${credit.numeroCredito}`);
          doc.fontSize(9).font('Helvetica');
          doc.text(`   Cliente: ${credit.client?.nombre || 'N/A'}`);
          doc.text(`   Monto: $${Number(credit.montoPrincipal).toFixed(2)}`);
          doc.text(`   Estado: ${credit.estado}`);
          doc.text(`   Vencimiento: ${new Date(credit.fechaVencimiento).toLocaleDateString('es-ES')}`);
          doc.moveDown(0.5);
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Convierte un PDF a imagen PNG
   * @param {Buffer} pdfBuffer - Buffer del PDF
   * @returns {Promise<Buffer>} Buffer de la imagen PNG
   */
  async convertPDFToImage(pdfBuffer) {
    try {
      // Convertir PDF a imágenes (puede tener múltiples páginas)
      const document = await pdf(pdfBuffer, { scale: 2.0 });
      
      // Obtener la primera página
      const pages = [];
      for await (const page of document) {
        pages.push(page);
        break; // Solo necesitamos la primera página
      }

      if (pages.length === 0) {
        throw new Error('No se pudo convertir el PDF a imagen');
      }

      // Optimizar la imagen con sharp
      const imageBuffer = await sharp(pages[0])
        .png({ quality: 90 })
        .toBuffer();

      return imageBuffer;
    } catch (error) {
      console.error('Error convirtiendo PDF a imagen:', error);
      throw error;
    }
  }
}

module.exports = new PDFService();
