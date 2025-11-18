const paymentRepository = require('../../infrastructure/repositories/PrismaPaymentRepository');
const creditRepository = require('../../infrastructure/repositories/PrismaCreditRepository');
const clientRepository = require('../../infrastructure/repositories/PrismaClientRepository');
const prisma = require('../../infrastructure/database/prismaClient');
const pdfService = require('../../infrastructure/integrations/pdfService');
const telegramService = require('../../infrastructure/integrations/telegramService');
const Payment = require('../../domain/entities/Payment');

/**
 * Caso de uso: Crear Pago
 * Registra un pago, genera ticket PDF, envía Telegram y actualiza estado del crédito
 */
class CreatePaymentUseCase {
  async execute(paymentData, createdBy) {
    // Validar crédito
    const credit = await creditRepository.findById(paymentData.creditId);
    
    if (!credit) {
      throw new Error('Crédito no encontrado');
    }

    // Validar cliente
    const client = await clientRepository.findById(paymentData.clienteId || credit.clienteId);
    
    if (!client) {
      throw new Error('Cliente no encontrado');
    }

    // Crear entidad de pago para validación
    const payment = new Payment({
      ...paymentData,
      clienteId: client.id,
      userId: createdBy || paymentData.userId,
      fechaPago: paymentData.fechaPago || new Date()
    });

    // Validar entidad
    payment.validate();

    // Usar transacción para asegurar consistencia
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear el pago
      const newPayment = await tx.payment.create({
        data: {
          creditId: payment.creditId,
          clienteId: payment.clienteId,
          userId: payment.userId,
          monto: payment.monto,
          fechaPago: payment.fechaPago,
          metodoPago: payment.metodoPago,
          cuotaNumero: payment.cuotaNumero,
          comprobanteReferencia: payment.comprobanteReferencia,
          createdBy,
          createdAt: new Date(),
          updatedBy: createdBy,
          updatedAt: new Date()
        },
        include: {
          credit: true,
          client: true,
          cobrador: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          }
        }
      });

      // 2. Generar número de comprobante
      const numeroComprobante = `COMP-${Date.now()}-${newPayment.id}`;

      // 3. Generar PDF del ticket
      let ticketPdf = null;
      let fileName = null;
      
      try {
        ticketPdf = await pdfService.generateTicketPDF(
          newPayment,
          client,
          credit,
          numeroComprobante
        );
        fileName = `ticket_${numeroComprobante}.pdf`;
      } catch (error) {
        console.error('Error generando PDF:', error);
        // Continuar sin PDF si falla
      }

      // 4. Crear metadata del ticket en texto
      const contenidoTexto = JSON.stringify({
        numeroComprobante,
        cliente: {
          nombre: client.nombre,
          cedula: client.cedula,
          telefono: client.telefono
        },
        credito: {
          numeroCredito: credit.numeroCredito,
          montoPrincipal: credit.montoPrincipal,
          cuotas: credit.cuotas
        },
        pago: {
          monto: newPayment.monto,
          metodoPago: newPayment.metodoPago,
          cuotaNumero: newPayment.cuotaNumero,
          fechaPago: newPayment.fechaPago
        },
        generadoEn: new Date().toISOString()
      });

      // 5. Guardar ticket en la base de datos
      const ticket = await tx.ticket.create({
        data: {
          paymentId: newPayment.id,
          numeroComprobante,
          monto: newPayment.monto,
          fechaEmision: new Date(),
          clienteId: client.id,
          contenidoTexto,
          ticketPdf: ticketPdf,
          fileName: fileName,
          createdBy,
          createdAt: new Date()
        }
      });

      // 6. Calcular montos y saldos
      const montoTotal = Number(credit.montoPrincipal) * (1 + Number(credit.tasaInteresAplicada));

      const totalPagadoResult = await tx.payment.aggregate({
        where: { creditId: credit.id },
        _sum: {
          monto: true
        }
      });
      const totalPagado = Number(totalPagadoResult._sum.monto) || 0;
      const saldoPendiente = montoTotal - totalPagado;
      
      // 7. Actualizar estado del crédito si está completamente pagado
      let nuevoEstado = credit.estado;
      
      if (totalPagado >= montoTotal && credit.estado === 'ACTIVO') {
        nuevoEstado = 'PAGADO';
        await tx.credit.update({
          where: { id: credit.id },
          data: {
            estado: 'PAGADO',
            updatedBy: createdBy,
            updatedAt: new Date()
          }
        });
      }

      return {
        payment: newPayment,
        ticket,
        creditoActualizado: nuevoEstado !== credit.estado,
        nuevoEstadoCredito: nuevoEstado,
        saldoPendiente,
        montoTotal,
      };
    });

    // 8. Enviar notificación por Telegram (fuera de la transacción)
    const mensaje = `
*¡Pago registrado exitosamente!* 🎉

*Comprobante:* \` ${result.ticket.numeroComprobante} \`
*Cliente:* ${client.nombre}
*Crédito:* ${credit.numeroCredito}
*Monto Principal:* $${Number(credit.montoPrincipal).toFixed(2)}
*Cuotas:* ${credit.cuotas}

*Detalles del Pago:*
*Monto Pagado:* $${Number(result.payment.monto).toFixed(2)}
*Cuota:* ${result.payment.cuotaNumero}
*Método:* ${result.payment.metodoPago}

*Saldo Pendiente:* $${result.saldoPendiente.toFixed(2)}

_Gracias por su pago._
    `.trim();

    let telegramResponse = null;
    const chatId = client.telegramChatId;

    if (chatId) {
      try {
        telegramResponse = await telegramService.sendMessage(chatId, mensaje);
      } catch (error) {
        console.error(`Error enviando mensaje de Telegram a ${chatId}:`, error);
      }
    } else {
      console.warn(`Advertencia: El cliente ${client.nombre} (ID: ${client.id}) no tiene un telegramChatId configurado.`);
    }

    // 9. Registrar notificación
    await prisma.notification.create({
      data: {
        client: {
          connect: { id: client.id }
        },
        tipo: 'PAGO_REGISTRADO',
        mensaje,
        medio: 'TELEGRAM',
        estadoEnvio: telegramResponse?.success ? 'ENVIADO' : 'FALLIDO',
        responseApi: JSON.stringify(telegramResponse),
        fechaEnvio: telegramResponse?.success ? new Date() : null,
        createdAt: new Date()
      }
    });

    return {
      payment: result.payment,
      ticket: {
        id: result.ticket.id,
        numeroComprobante: result.ticket.numeroComprobante,
        monto: result.ticket.monto,
        fechaEmision: result.ticket.fechaEmision
      },
      creditoActualizado: result.creditoActualizado,
      nuevoEstadoCredito: result.nuevoEstadoCredito,
      notificacionEnviada: telegramResponse?.success || false
    };
  }
}

module.exports = new CreatePaymentUseCase();
