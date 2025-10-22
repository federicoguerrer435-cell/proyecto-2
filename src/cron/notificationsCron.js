const cron = require('node-cron');
const creditRepository = require('../../infrastructure/repositories/PrismaCreditRepository');
const whatsappService = require('../../infrastructure/integrations/whatsappService');
const prisma = require('../../infrastructure/database/prismaClient');

/**
 * Cron Job para Notificaciones
 * Envía recordatorios de pago diarios a clientes con créditos próximos a vencer o vencidos
 */
class NotificationsCron {
  constructor() {
    this.schedule = process.env.CRON_SCHEDULE || '0 8 * * *'; // Default: 8 AM diario
    this.task = null;
  }

  /**
   * Inicia el cron job
   */
  start() {
    console.log(`🕐 Cron job de notificaciones iniciado. Schedule: ${this.schedule}`);

    this.task = cron.schedule(this.schedule, async () => {
      console.log('⏰ Ejecutando tarea de notificaciones...');
      await this.sendReminders();
    });
  }

  /**
   * Detiene el cron job
   */
  stop() {
    if (this.task) {
      this.task.stop();
      console.log('🛑 Cron job de notificaciones detenido');
    }
  }

  /**
   * Envía recordatorios de pago
   */
  async sendReminders() {
    try {
      const hoy = new Date();
      console.log(`📅 Enviando recordatorios - ${hoy.toISOString()}`);

      // 1. Obtener créditos próximos a vencer (3 días)
      const creditosProximos = await creditRepository.findUpcomingDue(3);
      console.log(`📋 Créditos próximos a vencer: ${creditosProximos.length}`);

      for (const credit of creditosProximos) {
        await this.sendUpcomingDueReminder(credit);
      }

      // 2. Obtener créditos vencidos
      const creditosVencidos = await creditRepository.findOverdue();
      console.log(`⚠️ Créditos vencidos: ${creditosVencidos.length}`);

      for (const credit of creditosVencidos) {
        await this.sendOverdueReminder(credit);
      }

      console.log('✅ Tarea de notificaciones completada');
    } catch (error) {
      console.error('❌ Error en tarea de notificaciones:', error);
    }
  }

  /**
   * Envía recordatorio de vencimiento próximo
   */
  async sendUpcomingDueReminder(credit) {
    try {
      const client = credit.client;
      const diasRestantes = Math.ceil(
        (new Date(credit.fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24)
      );

      const mensaje = `
🔔 Recordatorio de Pago

Estimado/a ${client.nombre},

Le recordamos que su crédito está próximo a vencer.

📋 Detalles:
• Crédito: ${credit.numeroCredito}
• Monto: $${Number(credit.montoPrincipal).toFixed(2)}
• Vence en: ${diasRestantes} día(s)
• Fecha de vencimiento: ${new Date(credit.fechaVencimiento).toLocaleDateString('es-ES')}

Por favor, realice su pago a tiempo para evitar cargos adicionales.

Gracias.
      `.trim();

      // Enviar WhatsApp
      const response = await whatsappService.sendTextMessage(client.telefono, mensaje);

      // Registrar notificación
      await prisma.notification.create({
        data: {
          clienteId: client.id,
          tipo: 'VENCIMIENTO_PROXIMO',
          mensaje,
          medio: 'WHATSAPP',
          estadoEnvio: response.success ? 'ENVIADO' : 'FALLIDO',
          responseApi: JSON.stringify(response),
          fechaEnvio: response.success ? new Date() : null,
          createdAt: new Date()
        }
      });

      if (response.success) {
        console.log(`✅ Recordatorio enviado a ${client.nombre} (${credit.numeroCredito})`);
      } else {
        console.error(`❌ Error enviando a ${client.nombre}:`, response.error);
      }
    } catch (error) {
      console.error(`❌ Error procesando crédito ${credit.numeroCredito}:`, error);
    }
  }

  /**
   * Envía recordatorio de crédito vencido
   */
  async sendOverdueReminder(credit) {
    try {
      const client = credit.client;
      const diasVencidos = Math.ceil(
        (new Date() - new Date(credit.fechaVencimiento)) / (1000 * 60 * 60 * 24)
      );

      const mensaje = `
⚠️ CRÉDITO VENCIDO

Estimado/a ${client.nombre},

Su crédito se encuentra VENCIDO.

📋 Detalles:
• Crédito: ${credit.numeroCredito}
• Monto: $${Number(credit.montoPrincipal).toFixed(2)}
• Días vencidos: ${diasVencidos}
• Fecha de vencimiento: ${new Date(credit.fechaVencimiento).toLocaleDateString('es-ES')}

⚠️ Es importante que regularice su pago lo antes posible para evitar cargos adicionales.

Por favor, comuníquese con nosotros.
      `.trim();

      // Enviar WhatsApp
      const response = await whatsappService.sendTextMessage(client.telefono, mensaje);

      // Registrar notificación
      await prisma.notification.create({
        data: {
          clienteId: client.id,
          tipo: 'CREDITO_VENCIDO',
          mensaje,
          medio: 'WHATSAPP',
          estadoEnvio: response.success ? 'ENVIADO' : 'FALLIDO',
          responseApi: JSON.stringify(response),
          fechaEnvio: response.success ? new Date() : null,
          createdAt: new Date()
        }
      });

      // Actualizar estado del crédito a INCUMPLIDO si está en ACTIVO
      if (credit.estado === 'ACTIVO') {
        await prisma.credit.update({
          where: { id: credit.id },
          data: {
            estado: 'INCUMPLIDO',
            updatedAt: new Date()
          }
        });
        console.log(`📝 Crédito ${credit.numeroCredito} marcado como INCUMPLIDO`);
      }

      if (response.success) {
        console.log(`✅ Recordatorio de vencido enviado a ${client.nombre} (${credit.numeroCredito})`);
      } else {
        console.error(`❌ Error enviando a ${client.nombre}:`, response.error);
      }
    } catch (error) {
      console.error(`❌ Error procesando crédito vencido ${credit.numeroCredito}:`, error);
    }
  }

  /**
   * Ejecuta la tarea manualmente (para testing)
   */
  async runManually() {
    console.log('🔧 Ejecutando tarea de notificaciones manualmente...');
    await this.sendReminders();
  }
}

// Exportar instancia singleton
module.exports = new NotificationsCron();
