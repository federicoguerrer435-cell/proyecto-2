const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * Password Service
 * Handles password hashing and verification
 */
class PasswordService {
  /**
   * Hash a password
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    try {
      return await bcrypt.hash(password, SALT_ROUNDS);
    } catch (error) {
      throw new Error(`Error hashing password: ${error.message}`);
    }
  }

  /**
   * Compare a plain text password with a hashed password
   * @param {string} password - Plain text password
   * @param {string} hashedPassword - Hashed password to compare with
   * @returns {Promise<boolean>} True if passwords match
   */
  async comparePassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new Error(`Error comparing passwords: ${error.message}`);
    }
  }

  /**
   * Backwards-compatible alias used in some parts of the codebase
   * (older name: comparePasswords)
   */
  async comparePasswords(password, hashedPassword) {
    return this.comparePassword(password, hashedPassword);
  }
}

module.exports = new PasswordService();
