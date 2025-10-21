const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * Auth Routes
 * Defines authentication endpoints
 */
const createAuthRoutes = (authController) => {
  const router = express.Router();

  /**
   * @route   POST /api/auth/register
   * @desc    Register a new user
   * @access  Public
   */
  router.post('/register', (req, res) => authController.register(req, res));

  /**
   * @route   POST /api/auth/login
   * @desc    Login user
   * @access  Public
   */
  router.post('/login', (req, res) => authController.login(req, res));

  /**
   * @route   GET /api/auth/profile
   * @desc    Get current user profile
   * @access  Private
   */
  router.get('/profile', authMiddleware, (req, res) => authController.getProfile(req, res));

  return router;
};

module.exports = createAuthRoutes;
