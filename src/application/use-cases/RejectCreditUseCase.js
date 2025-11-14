const creditRepository = require('../../infrastructure/repositories/PrismaCreditRepository');

class RejectCreditUseCase {
  async execute(creditId, rejectedBy) {
    const credit = await creditRepository.findById(creditId);

    if (!credit) {
      throw new Error('Crédito no encontrado');
    }

    if (credit.estado !== 'PENDIENTE') {
      throw new Error('Solo se pueden rechazar créditos en estado PENDIENTE');
    }

    return await creditRepository.update(creditId, {
      estado: 'RECHAZADO',
      updatedBy: rejectedBy,
      updatedAt: new Date()
    });
  }
}

module.exports = new RejectCreditUseCase();
