const passwordService = require('../../infrastructure/security/PasswordService');
const jwtService = require('../../infrastructure/security/JwtService');

/**
 * Login User Use Case
 * Handles user login business logic
 */
class LoginUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Execute user login
   * @param {Object} credentials - User login credentials
   * @returns {Promise<Object>} User data and token
   */
  async execute(credentials) {
    const { email, password } = credentials;

    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await passwordService.comparePassword(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwtService.generateToken({
      id: user.id,
      email: user.email
    });

    return {
      user: user.toJSON(),
      token
    };
  }
}

module.exports = LoginUserUseCase;
