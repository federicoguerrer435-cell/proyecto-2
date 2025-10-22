const express = require('express');
const cors = require('cors');
require('dotenv').config();

const prisma = require('./infrastructure/database/prismaClient');
const { errorHandler, notFound } = require('./presentation/middlewares/errorHandler');
const notificationsCron = require('./cron/notificationsCron');

// Rutas
const authRoutes = require('./presentation/routes/authRoutes');

/**
 * Application class
 * Configura y arranca el servidor Express
 */
class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
  }

  /**
   * Configura middleware
   */
  configureMiddleware() {
    // CORS
    this.app.use(cors());
    
    // Body parsers
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Log de requests en desarrollo
    if (process.env.NODE_ENV === 'development') {
      this.app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
      });
    }
  }

  /**
   * Configura rutas
   */
  configureRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);

    // TODO: Agregar más rutas
    // this.app.use('/api/users', userRoutes);
    // this.app.use('/api/clients', clientRoutes);
    // this.app.use('/api/credits', creditRoutes);
    // this.app.use('/api/payments', paymentRoutes);
    // this.app.use('/api/dashboard', dashboardRoutes);
    // this.app.use('/api/reports', reportRoutes);

    // 404 handler
    this.app.use(notFound);

    // Global error handler (debe ser el último)
    this.app.use(errorHandler);
  }

  /**
   * Inicia el servidor
   */
  async start() {
    try {
      // Test database connection
      console.log('🔍 Verificando conexión a base de datos...');
      await prisma.$connect();
      console.log('✅ Conexión a base de datos exitosa');

      // Configure middleware and routes
      this.configureMiddleware();
      this.configureRoutes();

      // Iniciar cron jobs
      if (process.env.NODE_ENV !== 'test') {
        notificationsCron.start();
      }

      // Start listening
      this.app.listen(this.port, () => {
        console.log('\n🚀 ====================================');
        console.log(`🚀 Servidor corriendo en puerto ${this.port}`);
        console.log(`🚀 Entorno: ${process.env.NODE_ENV || 'development'}`);
        console.log('🚀 ====================================');
        console.log(`📍 Health check: http://localhost:${this.port}/health`);
        console.log(`🔐 Auth endpoints: http://localhost:${this.port}/api/auth`);
        console.log('🚀 ====================================\n');
      });

      // Manejo de cierre gracioso
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());
      
    } catch (error) {
      console.error('❌ Error iniciando servidor:', error);
      process.exit(1);
    }
  }

  /**
   * Cierre gracioso del servidor
   */
  async shutdown() {
    console.log('\n⏳ Cerrando servidor...');
    
    // Detener cron jobs
    notificationsCron.stop();
    
    // Desconectar Prisma
    await prisma.$disconnect();
    
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  }
}

module.exports = App;
