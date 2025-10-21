/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */
class AuthController {
  constructor(registerUseCase, loginUseCase) {
    this.registerUseCase = registerUseCase;
    this.loginUseCase = loginUseCase;
  }

  /**
   * Handle user registration
   */
  async register(req, res) {
    try {
      const result = await this.registerUseCase.execute(req.body);
      
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Handle user login
   */
  async login(req, res) {
    try {
      const result = await this.loginUseCase.execute(req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req, res) {
    try {
      return res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = AuthController;
