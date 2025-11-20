/**
 * UserRepository Interface
 * Defines the contract for user data persistence
 */
class UserRepository {
  /**
   * Find user by email
   * @param {string} email
   * @returns {Promise<User|null>}
   */
  async findByEmail(email) {
    throw new Error('Method not implemented');
  }

  /**
   * Find user by id
   * @param {number} id
   * @returns {Promise<User|null>}
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Create a new user
   * @param {Object} userData
   * @returns {Promise<User>}
   */
  async create(userData) {
    throw new Error('Method not implemented');
  }

  /**
   * Update an existing user
   * @param {number} id
   * @param {Object} userData
   * @returns {Promise<User>}
   */
  async update(id, userData) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a user
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }
}

module.exports = UserRepository;
