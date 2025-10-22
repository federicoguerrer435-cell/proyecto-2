const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '15m';
const REFRESH_TOKEN_EXPIRATION_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRATION_DAYS) || 30;

/**
 * JWT Service
 * Handles JWT access token and refresh token generation and verification
 */
class JwtService {
  /**
   * Generate an access token for a user
   * @param {Object} payload - User data to encode in token
   * @returns {string} JWT access token
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION
    });
  }

  /**
   * Generate a refresh token for a user
   * @param {Object} payload - User data to encode in token
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: `${REFRESH_TOKEN_EXPIRATION_DAYS}d`
    });
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} payload - User data to encode in tokens
   * @returns {Object} Object with accessToken and refreshToken
   */
  generateTokens(payload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }

  /**
   * Verify and decode a JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   * @throws {Error} If token is invalid or expired
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Decode token without verifying
   * @param {string} token
   * @returns {Object|null}
   */
  decodeToken(token) {
    return jwt.decode(token);
  }

  /**
   * Calculate refresh token expiration date
   * @returns {Date} Expiration date
   */
  getRefreshTokenExpirationDate() {
    const now = new Date();
    return new Date(now.getTime() + REFRESH_TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
  }
}

module.exports = new JwtService();
