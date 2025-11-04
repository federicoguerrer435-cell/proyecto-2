class RegisterClientUseCase {
  constructor(clientRepository) {
    this.clientRepository = clientRepository;
  }

  async execute(clientData) {
    if (!clientData.name || !clientData.cedula) {
      throw new Error('El nombre y la cédula son obligatorios.');
    }
    return await this.clientRepository.create(clientData);
  }
}

module.exports = RegisterClientUseCase;
