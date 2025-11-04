const creditRepository = require('../../infrastructure/repositories/PrismaCreditRepository');
const clientRepository = require('../../infrastructure/repositories/PrismaClientRepository');
const whatsappService = require('../../infrastructure/integrations/whatsappService');
const prisma = require('../../infrastructure/database/prismaClient');

/**
 * Caso de uso: Gestionar Estado de Crédito (Aprobar/Rechazar)
 * Maneja la aprobación y rechazo de créditos con auditoría y notificaciones
 */
class ManageCreditStatusUseCase {
  /**
   * Aprueba un crédito
   * @param {number} creditId - ID del crédito
   * @param {number} approvedBy - ID del usuario que aprueba
   * @returns {Promise<Object>} Crédito actualizado
   */
  async approve(creditId, approvedBy) {
    // Validar que el crédito existe
    const credit = await creditRepository.findById(creditId);
    
    if (!credit) {
      throw new Error('Crédito no encontrado');
    }

    // Validar que el crédito esté en estado PENDIENTE
    if (credit.estado !== 'PENDIENTE') {
      throw new Error(`No se puede aprobar un crédito en estado ${credit.estado}. Solo se pueden aprobar créditos PENDIENTES.`);
    }

    // Validar que el cliente existe
    const client = await clientRepository.findById(credit.clienteId);
    if (!client) {
      throw new Error('Cliente no encontrado');
    }

    // VALIDACIÓN CRÍTICA: Verificar que el cliente NO tenga otro crédito activo
    const hasActiveCredit = await creditRepository.hasActiveCredit(credit.clienteId);
    if (hasActiveCredit) {
      throw new Error('El cliente ya tiene un crédito ACTIVO o INCUMPLIDO. No se puede aprobar este crédito.');
    }

    // Actualizar estado del crédito a ACTIVO
    const updatedCredit = await creditRepository.update(creditId, {
      estado: 'ACTIVO',
      updatedBy: approvedBy,
      updatedAt: new Date()
    });

    // Preparar mensaje de notificación
    const montoTotal = Number(credit.montoPrincipal) * (1 + Number(credit.tasaInteresAplicada));
    const valorCuota = montoTotal / credit.cuotas;
    
    const mensaje = `
¡CRÉDITO APROBADO! ✅

Estimado/a ${client.nombre},

Su crédito ha sido APROBADO.

📋 Detalles del crédito:
• Número: ${credit.numeroCredito}
• Monto: $${Number(credit.montoPrincipal).toFixed(2)}
• Tasa de interés: ${(Number(credit.tasaInteresAplicada) * 100).toFixed(2)}%
• Total a pagar: $${montoTotal.toFixed(2)}
• Número de cuotas: ${credit.cuotas}
• Valor por cuota: $${valorCuota.toFixed(2)}
• Fecha de vencimiento: ${new Date(credit.fechaVencimiento).toLocaleDateString('es-ES')}

¡Gracias por su confianza!
    `.trim();

    // Enviar notificación por WhatsApp
    let whatsappResponse = null;
    try {
      whatsappResponse = await whatsappService.sendTextMessage(client.telefono, mensaje);
    } catch (error) {
      console.error('Error enviando WhatsApp:', error);
    }

    // Registrar notificación en la base de datos
    await prisma.notification.create({
      data: {
        clienteId: client.id,
        tipo: 'CREDITO_APROBADO',
        mensaje,
        medio: 'WHATSAPP',
        estadoEnvio: whatsappResponse?.success ? 'ENVIADO' : 'FALLIDO',
        responseApi: JSON.stringify(whatsappResponse),
        fechaEnvio: whatsappResponse?.success ? new Date() : null,
        createdAt: new Date()
      }
    });

    return {
      credit: updatedCredit,
      notificacionEnviada: whatsappResponse?.success || false,
      mensaje: 'Crédito aprobado exitosamente'
    };
  }

  /**
   * Rechaza un crédito
   * @param {number} creditId - ID del crédito
   * @param {number} rejectedBy - ID del usuario que rechaza
   * @param {string} motivo - Motivo del rechazo (opcional)
   * @returns {Promise<Object>} Crédito actualizado
   */
  async reject(creditId, rejectedBy, motivo = null) {
    // Validar que el crédito existe
    const credit = await creditRepository.findById(creditId);
    
    if (!credit) {
      throw new Error('Crédito no encontrado');
    }

    // Validar que el crédito esté en estado PENDIENTE
    if (credit.estado !== 'PENDIENTE') {
      throw new Error(`No se puede rechazar un crédito en estado ${credit.estado}. Solo se pueden rechazar créditos PENDIENTES.`);
    }

    // Validar que el cliente existe
    const client = await clientRepository.findById(credit.clienteId);
    if (!client) {
      throw new Error('Cliente no encontrado');
    }

    // Actualizar estado del crédito a RECHAZADO
    const updatedCredit = await creditRepository.update(creditId, {
      estado: 'RECHAZADO',
      updatedBy: rejectedBy,
      updatedAt: new Date()
    });

    // Preparar mensaje de notificación
    const motivoTexto = motivo ? `\n\nMotivo: ${motivo}` : '';
    
    const mensaje = `
CRÉDITO RECHAZADO ❌

Estimado/a ${client.nombre},

Lamentamos informarle que su crédito N° ${credit.numeroCredito} ha sido RECHAZADO.${motivoTexto}

📋 Datos del crédito:
• Número: ${credit.numeroCredito}
• Monto solicitado: $${Number(credit.montoPrincipal).toFixed(2)}
• Fecha de solicitud: ${new Date(credit.createdAt).toLocaleDateString('es-ES')}

Para más información, por favor comuníquese con nosotros.

Gracias por su comprensión.
    `.trim();

    // Enviar notificación por WhatsApp
    let whatsappResponse = null;
    try {
      whatsappResponse = await whatsappService.sendTextMessage(client.telefono, mensaje);
    } catch (error) {
      console.error('Error enviando WhatsApp:', error);
    }

    // Registrar notificación en la base de datos
    await prisma.notification.create({
      data: {
        clienteId: client.id,
        tipo: 'CREDITO_RECHAZADO',
        mensaje,
        medio: 'WHATSAPP',
        estadoEnvio: whatsappResponse?.success ? 'ENVIADO' : 'FALLIDO',
        responseApi: JSON.stringify(whatsappResponse),
        fechaEnvio: whatsappResponse?.success ? new Date() : null,
        createdAt: new Date()
      }
    });

    return {
      credit: updatedCredit,
      motivo,
      notificacionEnviada: whatsappResponse?.success || false,
      mensaje: 'Crédito rechazado exitosamente'
    };
  }
}

module.exports = new ManageCreditStatusUseCase();