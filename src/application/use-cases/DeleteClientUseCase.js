const clientRepository = require('../../infrastructure/repositories/PrismaClientRepository');

class DeleteClientUseCase {
  async execute(id, deletedBy = null) {
    const existing = await clientRepository.findById(parseInt(id));
    if (!existing) throw new Error('Cliente no encontrado');

    // Soft delete: marcar deletedAt y isDeleted
    await clientRepository.update(parseInt(id), {
      isDeleted: true,
      deletedAt: new Date(),
      updatedBy: deletedBy,
      updatedAt: new Date()
    });

    return { message: 'Cliente eliminado (soft) exitosamente', id: parseInt(id) };
  }
}

module.exports = new DeleteClientUseCase();
