const clientRepository = require('../../infrastructure/repositories/PrismaClientRepository');

class UpdateClientUseCase {
  async execute(id, clientData, updatedBy = null) {
    const existing = await clientRepository.findById(parseInt(id));
    if (!existing) throw new Error('Cliente no encontrado');

    const updateData = {
      updatedBy,
      updatedAt: new Date()
    };

    if (clientData.nombre !== undefined) {
      if (clientData.nombre.trim().length === 0) throw new Error('El nombre no puede estar vacío');
      updateData.nombre = clientData.nombre.trim();
    }

    if (clientData.email !== undefined) updateData.email = clientData.email || null;
    if (clientData.direccion !== undefined) updateData.direccion = clientData.direccion || null;
    if (clientData.telefono !== undefined) updateData.telefono = clientData.telefono || null;
    if (clientData.isActive !== undefined) updateData.isActive = Boolean(clientData.isActive);
    if (clientData.referencias !== undefined) updateData.referencias = clientData.referencias || null;
    if (clientData.modalidadPago !== undefined) updateData.modalidadPago = clientData.modalidadPago || null;
    if (clientData.assignedTo !== undefined) updateData.assignedTo = clientData.assignedTo || null;

    await clientRepository.update(parseInt(id), updateData);

    const updated = await clientRepository.findById(parseInt(id));
    return updated;
  }
}

module.exports = new UpdateClientUseCase();
