const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de Créditos',
    version: '1.0.0',
    description: 'Documentación de la API para el sistema de gestión de créditos.',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Servidor de desarrollo',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          nombre: { type: 'string' },
          email: { type: 'string' },
          telefono: { type: 'string' },
          isActive: { type: 'boolean' },
        },
      },
      Client: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          nombre: { type: 'string' },
          cedula: { type: 'string' },
          email: { type: 'string' },
          telefono: { type: 'string' },
          direccion: { type: 'string' },
          telegramChatId: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
          referencias: { type: 'string', nullable: true },
          modalidadPago: { type: 'string', nullable: true },
          assignedTo: { type: 'integer', nullable: true },
        },
      },
      Credit: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          numeroCredito: { type: 'string' },
          clienteId: { type: 'integer' },
          montoPrincipal: { type: 'string' },
          nota: { type: 'string', nullable: true },
          cuotas: { type: 'integer' },
          tasaInteresAplicada: { type: 'string' },
          fechaVencimiento: { type: 'string', format: 'date-time' },
          estado: { 
            type: 'string',
            enum: ['PENDIENTE', 'ACTIVO', 'PAGADO', 'INCUMPLIDO', 'RENOVADO', 'RECHAZADO']
          },
          montoTotal: { type: 'string' },
          valorCuota: { type: 'string' },
          totalInteres: { type: 'string' },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          creditId: { type: 'integer' },
          clienteId: { type: 'integer' },
          userId: { type: 'integer' },
          monto: { type: 'string' },
          fechaPago: { type: 'string', format: 'date-time' },
          metodoPago: { 
            type: 'string',
            enum: ['EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'TARJETA']
          },
          cuotaNumero: { type: 'integer' },
          comprobanteReferencia: { type: 'string', nullable: true },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            nullable: true,
          },
          error: {
            type: 'string',
            nullable: true,
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/presentation/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
