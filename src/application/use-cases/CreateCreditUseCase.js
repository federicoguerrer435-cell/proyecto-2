const creditRepository = require('../../infrastructure/repositories/PrismaCreditRepository');
const clientRepository = require('../../infrastructure/repositories/PrismaClientRepository');
const Credit = require('../../domain/entities/Credit');

/**
 * Caso de uso: Crear Crédito
 * Crea un nuevo crédito validando que el cliente no tenga créditos activos
 */
class CreateCreditUseCase {
  async execute(creditData, createdBy) {
    // Validar que el cliente existe
    const client = await clientRepository.findById(creditData.clienteId);
    
    if (!client) {
      throw new Error('Cliente no encontrado');
    }

    // VALIDACIÓN CRÍTICA: Verificar que el cliente NO tenga créditos activos o incumplidos
    const hasActiveCredit = await creditRepository.hasActiveCredit(creditData.clienteId);
    
    if (hasActiveCredit) {
      throw new Error('El cliente ya tiene un crédito activo. No se puede crear un nuevo crédito hasta que el actual sea pagado o rechazado.');
    }

    // Generar número de crédito único
    const numeroCredito = await creditRepository.generateCreditNumber();

    // Obtener tasa de interés global si no se proporciona
    let tasaInteres = creditData.tasaInteresAplicada;
    if (!tasaInteres) {
      tasaInteres = parseFloat(process.env.GLOBAL_INTEREST_RATE) || 0.20;
    }

    // Calcular fecha de vencimiento si no se proporciona
    let fechaVencimiento = creditData.fechaVencimiento;
    if (!fechaVencimiento) {
      // Por defecto, vencimiento en 30 días por cuota
      const diasPorCuota = 30;
      const diasTotal = creditData.cuotas * diasPorCuota;
      fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + diasTotal);
    }

    // Crear entidad de crédito para validación
    const credit = new Credit({
      numeroCredito,
      clienteId: creditData.clienteId,
      montoPrincipal: creditData.montoPrincipal,
      cuotas: creditData.cuotas,
      tasaInteresAplicada: tasaInteres,
      fechaVencimiento,
      estado: creditData.estado || 'PENDIENTE',
      createdBy
    });

    // Validar entidad
    credit.validate();

    // Crear crédito en la base de datos
    const newCredit = await creditRepository.create({
      numeroCredito: credit.numeroCredito,
      clienteId: credit.clienteId,
      montoPrincipal: credit.montoPrincipal,
      cuotas: credit.cuotas,
      tasaInteresAplicada: credit.tasaInteresAplicada,
      fechaVencimiento: credit.fechaVencimiento,
      estado: credit.estado,
      createdBy,
      createdAt: new Date(),
      updatedBy: createdBy,
      updatedAt: new Date()
    });

    // Calcular información adicional
    const montoTotal = Number(newCredit.montoPrincipal) * (1 + Number(newCredit.tasaInteresAplicada));
    const valorCuota = montoTotal / newCredit.cuotas;

    return {
      ...newCredit,
      montoTotal: montoTotal.toFixed(2),
      valorCuota: valorCuota.toFixed(2),
      totalInteres: (Number(newCredit.montoPrincipal) * Number(newCredit.tasaInteresAplicada)).toFixed(2)
    };
  }
}

module.exports = new CreateCreditUseCase();
