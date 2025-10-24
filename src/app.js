const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Infrastructure
const { testConnection, initializeDatabase } = require('./infrastructure/database/postgres');
const PostgresUserRepository = require('./infrastructure/repositories/PostgresUserRepository');

// Application
const RegisterUserUseCase = require('./application/use-cases/RegisterUserUseCase');
const LoginUserUseCase = require('./application/use-cases/LoginUserUseCase');

// Presentation
const AuthController = require('./presentation/controllers/AuthController');
const createAuthRoutes = require('./presentation/routes/authRoutes');

/**
 * Application class
 * Configures and starts the Express server
 */
class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    
    // Initialize repositories
    this.userRepository = new PostgresUserRepository();
    
    // Initialize use cases
    this.registerUseCase = new RegisterUserUseCase(this.userRepository);
    this.loginUseCase = new LoginUserUseCase(this.userRepository);
    
    // Initialize controllers
    this.authController = new AuthController(
      this.registerUseCase,
      this.loginUseCase
    );
  }

  /**
   * Configure middleware
   */
  configureMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  /**
   * Configure routes
   */
  configureRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
      });
    });

    // API routes
    this.app.use('/api/auth', createAuthRoutes(this.authController));
    const clientRoutes = require('./presentation/routes/clientRoutes');
    this.app.use('/api/clients', clientRoutes);


    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    });

    // Error handler
    this.app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    });
  }

  /**
   * Start the server
   */
  async start() {
    try {
      // Test database connection
      await testConnection();
      
      // Initialize database
      await initializeDatabase();
      
      // Configure middleware and routes
      this.configureMiddleware();
      this.configureRoutes();
      
      // Start listening
      this.app.listen(this.port, () => {
        console.log(`🚀 Server running on port ${this.port}`);
        console.log(`📍 Health check: http://localhost:${this.port}/health`);
        console.log(`🔐 Auth endpoints: http://localhost:${this.port}/api/auth`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

module.exports = App;
