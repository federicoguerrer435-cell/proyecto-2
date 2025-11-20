const RegisterClientUseCase = require('../../application/use-cases/RegisterClientUseCase');
const GetClientsUseCase = require('../../application/use-cases/GetClientsUseCase');
const PostgresClientRepository = require('../../infrastructure/repositories/PostgresClientRepository');

const clientRepository = new PostgresClientRepository();

class ClientController {
  static async register(req, res) {
    try {
      const useCase = new RegisterClientUseCase(clientRepository);
      const newClient = await useCase.execute(req.body);
      res.status(201).json(newClient);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const useCase = new GetClientsUseCase(clientRepository);
      const clients = await useCase.execute();
      res.status(200).json(clients);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = ClientController;
