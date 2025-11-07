const clientRepository = require('../../infrastructure/repositories/PrismaClientRepository');

class ListClientsUseCase {
  async execute(filters = {}) {
    const { page = 1, limit = 10, nombre, cedula, telefono, assignedTo, email, isActive } = filters;

    const { clients, total } = await clientRepository.findAll({
      page,
      limit,
      nombre,
      cedula,
      telefono,
      assignedTo,
      email,
      isActive
    });

    return { clients, total };
  }
}

module.exports = new ListClientsUseCase();
