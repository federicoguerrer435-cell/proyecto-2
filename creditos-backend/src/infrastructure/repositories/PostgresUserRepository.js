const UserRepository = require('../../domain/repositories/UserRepository');
const User = require('../../domain/entities/User');
const { pool } = require('../database/postgres');

/**
 * PostgreSQL implementation of UserRepository
 */
class PostgresUserRepository extends UserRepository {
  /**
   * Find user by email
   * @param {string} email
   * @returns {Promise<User|null>}
   */
  async findByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        return null;
      }

      return this._mapRowToUser(result.rows[0]);
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  /**
   * Find user by id
   * @param {number} id
   * @returns {Promise<User|null>}
   */
  async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }

      return this._mapRowToUser(result.rows[0]);
    } catch (error) {
      throw new Error(`Error finding user by id: ${error.message}`);
    }
  }

  /**
   * Create a new user
   * @param {Object} userData
   * @returns {Promise<User>}
   */
  async create(userData) {
    try {
      const result = await pool.query(
        `INSERT INTO users (email, password, name) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [userData.email, userData.password, userData.name]
      );

      return this._mapRowToUser(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('User with this email already exists');
      }
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  /**
   * Update an existing user
   * @param {number} id
   * @param {Object} userData
   * @returns {Promise<User>}
   */
  async update(id, userData) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (userData.email) {
        fields.push(`email = $${paramCount++}`);
        values.push(userData.email);
      }
      if (userData.name) {
        fields.push(`name = $${paramCount++}`);
        values.push(userData.name);
      }
      if (userData.password) {
        fields.push(`password = $${paramCount++}`);
        values.push(userData.password);
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await pool.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return this._mapRowToUser(result.rows[0]);
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  /**
   * Delete a user
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );

      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  /**
   * Map database row to User entity
   * @private
   */
  _mapRowToUser(row) {
    return new User({
      id: row.id,
      email: row.email,
      password: row.password,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }
}

module.exports = PostgresUserRepository;
