/**
 * User Entity
 * Represents a user in the domain layer
 */
class User {
  constructor({ id, email, password, name, createdAt, updatedAt }) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Validates if the user data is complete
   * @returns {boolean}
   */
  isValid() {
    return !!(this.email && this.password && this.name);
  }

  /**
   * Returns user data without password
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;
