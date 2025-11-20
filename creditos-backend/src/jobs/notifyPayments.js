/**
 * src/jobs/notifyPayments.js
 *
 * Job periódico (node-cron) que busca créditos próximos a vencer
 * y envía (simulados) recordatorios por email o WhatsApp.
 */

const cron = require('node-cron');
const dotenv = require('dotenv');
dotenv.config();

// Importa prisma desde la ruta correcta
let prisma;
try {
  prisma = require('../infrastructure/database/prismaClient');
} catch (err) {
  console.error('❌ No se pudo cargar prisma desde ../infrastructure/database/prismaClient');
  console.error('Ajusta la ruta en src/jobs/notifyPayments.js según tu proyecto.');
  console.error('Error:', err.message);
  process.exit(1);
}

// ==================== Configuración ====================

const SCHEDULE = process.env.NOTIFY_CRON || '0 8 * * *';
const DAYS_AHEAD = Number(process.env.NOTIFY_DAYS_AHEAD || 3);

// ==================== Envío (simulado o real) ====================

let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

let twilioClient = null;
if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  } catch (e) {
    console.warn('⚠️ Twilio no instalado o no pudo inicializarse. Usa npm install twilio si deseas WhatsApp/SMS.');
  }
}

// ==================== Lógica principal ====================

async function findCreditsNearDue() {
  const today = new Date();
  const target = new Date();
  target.setDate(today.getDate() + DAYS_AHEAD);

  const credits = await prisma.credit.findMany({
    where: {
      fechaVencimiento: { lte: target },
      estado: { in: ['ACTIVO', 'PENDIENTE'] },
    },
    include: {
      client: true, // relación con el cliente
    },
  });

  return credits;
}

async function sendEmail(to, subject, text) {
  if (!transporter) {
    console.log(`[EMAIL MOCK] to=${to} subject=${subject} text=${text}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.NOTIFY_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });
}

async function sendWhatsApp(to, body) {
  if (!twilioClient) {
    console.log(`[WHATSAPP MOCK] to=${to} body=${body}`);
    return;
  }
  await twilioClient.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: `whatsapp:${to}`,
    body,
  });
}

async function recordNotification(clienteId, mensaje, medio) {
  try {
    await prisma.notification.create({
      data: {
        clienteId,
        tipo: 'RECORDATORIO_PAGO',
        mensaje,
        medio,
        estadoEnvio: 'ENVIADO',
        fechaEnvio: new Date(),
      },
    });
  } catch (e) {
    console.warn('⚠️ No se pudo registrar notificación:', e.message);
  }
}

async function processNotifications() {
  console.log(`[notifyPayments] buscando créditos con vencimiento <= hoy+${DAYS_AHEAD} días ...`);
  let credits = [];
  try {
    credits = await findCreditsNearDue();
  } catch (err) {
    console.error('[notifyPayments] Error al buscar créditos:', err.message);
    return;
  }

  if (!credits.length) {
    console.log('[notifyPayments] No hay créditos próximos a vencer.');
    return;
  }

  console.log(`[notifyPayments] Encontrados ${credits.length} créditos próximos a vencer.`);

  for (const c of credits) {
    const client = c.client;
    const nombre = client?.nombre || 'Cliente';
    const telefono = client?.telefono || null;
    const monto = c.montoPrincipal;
    const fechaVenc = new Date(c.fechaVencimiento).toISOString().slice(0, 10);

    const mensaje = `Hola ${nombre}, tu crédito N°${c.numeroCredito} por ${monto} vence el ${fechaVenc}. Por favor realiza el pago a tiempo para evitar recargos.`;

    try {
      if (telefono) await sendWhatsApp(telefono, mensaje);
      await recordNotification(client.id, mensaje, telefono ? 'WHATSAPP' : 'EMAIL');
      console.log(`[notifyPayments] Notificación enviada a ${nombre}`);
    } catch (e) {
      console.error(`[notifyPayments] Error al enviar notificación a ${nombre}:`, e.message);
    }
  }
}

// ==================== Ejecución ====================

if (process.argv.includes('--once')) {
  (async () => {
    await processNotifications();
    process.exit(0);
  })();
} else {
  console.log(`[notifyPayments] Scheduler iniciado con cron: "${SCHEDULE}" (DAYS_AHEAD=${DAYS_AHEAD})`);
  cron.schedule(
    SCHEDULE,
    async () => {
      console.log(`[notifyPayments] ejecución programada: ${new Date().toISOString()}`);
      await processNotifications();
    },
    { timezone: process.env.NOTIFY_TZ || 'America/Bogota' }
  );
}
