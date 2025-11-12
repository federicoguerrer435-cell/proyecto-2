const creditRepository = require('../../infrastructure/repositories/PrismaCreditRepository');

class GetCreditByIdUseCase {
  async execute(id) {
    const creditId = parseInt(id);
    if (Number.isNaN(creditId)) throw new Error('ID inválido');

    const credit = await creditRepository.findById(creditId);
    if (!credit) {
      const err = new Error('Crédito no encontrado');
      err.statusCode = 404;
      throw err;
    }

    return credit;
  }
}

module.exports = new GetCreditByIdUseCase();
