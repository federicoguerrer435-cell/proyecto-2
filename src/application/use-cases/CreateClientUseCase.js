const clientRepository = require('../../infrastructure/repositories/PrismaClientRepository');

class CreateClientUseCase {
  async execute(clientData, createdBy = null) {
    const { nombre, cedula, telefono } = clientData;

    // DEBUG: log input to help trace server 500 during tests
    console.log('CreateClientUseCase input:', JSON.stringify(clientData));

    if (!nombre || !cedula) {
      throw new Error('Nombre y cédula son obligatorios');
    }

    // Validar longitud básica
    if (nombre.trim().length < 2) throw new Error('El nombre es muy corto');

    // Verificar cedula única
    const existing = await clientRepository.findByCedula(cedula);
    if (existing) {
      const err = new Error('La cédula ya está registrada');
      // marcar como conflicto para que el error handler pueda devolver 409
      err.statusCode = 409;
      err.code = 'DUPLICATE_ENTRY';
      err.field = 'cedula';
      throw err;
    }

    try {
      const newClient = await clientRepository.create({
      nombre: nombre.trim(),
      cedula: cedula.trim(),
      direccion: clientData.direccion || null,
      telefono: telefono || null,
      email: clientData.email || null,
      isActive: clientData.isActive !== undefined ? Boolean(clientData.isActive) : true,
      referencias: clientData.referencias || null,
      modalidadPago: clientData.modalidadPago || null,
      assignedTo: clientData.assignedTo || null,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
      });

      return newClient;
    } catch (err) {
      console.error('CreateClientUseCase error:', err);
      throw err;
    }
  }
}

module.exports = new CreateClientUseCase();
