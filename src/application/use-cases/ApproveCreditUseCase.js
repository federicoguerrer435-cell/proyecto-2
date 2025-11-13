const creditRepository = require('../../infrastructure/repositories/PrismaCreditRepository');

class ApproveCreditUseCase {
  async execute(creditId, approvedBy) {
    const credit = await creditRepository.findById(creditId);

    if (!credit) {
      throw new Error('Crédito no encontrado');
    }

    if (credit.estado !== 'PENDIENTE') {
      throw new Error('Solo se pueden aprobar créditos en estado PENDIENTE');
    }

    return await creditRepository.update(creditId, {
      estado: 'ACTIVO',
      updatedBy: approvedBy,
      updatedAt: new Date()
    });
  }
}

module.exports = new ApproveCreditUseCase();
