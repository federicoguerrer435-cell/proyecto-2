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
        },
      },
      Credit: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          numeroCredito: { type: 'string' },
          montoPrincipal: { type: 'number' },
          cuotas: { type: 'integer' },
          estado: { type: 'string' },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          monto: { type: 'number' },
          metodoPago: { type: 'string' },
          cuotaNumero: { type: 'integer' },
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
