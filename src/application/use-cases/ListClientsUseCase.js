const clientRepository = require('../../infrastructure/repositories/PrismaClientRepository');

class ListClientsUseCase {
  async execute(filters = {}) {
    const { page = 1, limit = 10, nombre, cedula, telefono, assignedTo, email, isActive, cursor } = filters;

    const { clients, total, nextCursor } = await clientRepository.findAll({
      page,
      limit,
      nombre,
      cedula,
      telefono,
      assignedTo,
      email,
      isActive,
      cursor
    });

    return { clients, total, nextCursor };
  }
}

module.exports = new ListClientsUseCase();
