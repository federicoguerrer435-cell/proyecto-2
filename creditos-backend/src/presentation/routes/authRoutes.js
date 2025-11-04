const express = require('express');
const authController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authorizeRole } = require('../middlewares/authorize');

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login usuario y obtener access token + refresh token
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar access token usando refresh token
 * @access  Public
 */
router.post('/refresh', authController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout y revocar refresh token
 * @access  Public
 */
router.post('/logout', authController.logout);

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario (solo admin)
 * @access  Private (ADMIN)
 */
router.post('/register', authMiddleware, authorizeRole('ADMIN'), authController.register);

/**
 * @route   GET /api/auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get('/profile', authMiddleware, authController.profile);

module.exports = router;
