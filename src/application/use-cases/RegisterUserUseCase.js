const passwordService = require('../../infrastructure/security/PasswordService');
const jwtService = require('../../infrastructure/security/JwtService');

/**
 * Register User Use Case
 * Handles user registration business logic
 */
class RegisterUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Execute user registration
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registered user and token
   */
  async execute(userData) {
    const { email, password, name } = userData;

    // Validate input
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await passwordService.hashPassword(password);

    // Create user
    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      name
    });

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

module.exports = RegisterUserUseCase;
