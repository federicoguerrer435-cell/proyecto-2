const clientRepository = require('../../infrastructure/repositories/PrismaClientRepository');

class GetClientByIdUseCase {
  async execute(id) {
    if (!id) throw new Error('ID de cliente es requerido');

    const client = await clientRepository.findById(parseInt(id));
    if (!client) throw new Error('Cliente no encontrado');

    return client;
  }
}

module.exports = new GetClientByIdUseCase();
