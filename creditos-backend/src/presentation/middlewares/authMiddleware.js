const jwtService = require('../../infrastructure/security/JwtService');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user data to request
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Extract token (format: "Bearer <token>")
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    const token = parts[1];

    // Verify token
    const decoded = jwtService.verifyToken(token);
    
    // Attach user data to request
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = authMiddleware;
