const pool = require('../database/postgres');
const ClientRepository = require('../../domain/repositories/ClientRepository');
const Client = require('../../domain/entities/Client');

class PostgresClientRepository extends ClientRepository {
  async create(clientData) {
    const {
      name,
      cedula,
      direccion,
      telefono,
      referencias,
      modalidad_pago,
      documento_url,
    } = clientData;

    const query = `
      INSERT INTO clients 
      (name, cedula, direccion, telefono, referencias, modalidad_pago, documento_url, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())
      RETURNING *;
    `;

    const values = [name, cedula, direccion, telefono, referencias, modalidad_pago, documento_url];
    const result = await pool.query(query, values);
    return new Client(result.rows[0]);
  }

  async getAll() {
    const result = await pool.query('SELECT * FROM clients ORDER BY id DESC');
    return result.rows.map(row => new Client(row));
  }
}

module.exports = PostgresClientRepository;
