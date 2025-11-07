const creditRepository = require('../../infrastructure/repositories/PrismaCreditRepository');

class ListCreditsUseCase {
  async execute(filters = {}) {
    const { page = 1, limit = 10, estado, cobradorId, clienteId, fechaDesde, fechaHasta, nombre, cedula, telefono, cursor } = filters;

    const { credits, total, nextCursor } = await creditRepository.findAll({
      page,
      limit,
      estado,
      cobradorId,
      clienteId,
      fechaDesde,
      fechaHasta,
      nombre,
      cedula,
      telefono,
      cursor
    });

    return { credits, total, nextCursor };
  }
}

module.exports = new ListCreditsUseCase();
