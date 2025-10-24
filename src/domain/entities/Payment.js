/**
 * Entidad Payment
 * Representa un pago realizado a un crédito
 */
class Payment {
  constructor({
    id,
    creditId,
    clienteId,
    userId,
    monto,
    fechaPago,
    metodoPago,
    cuotaNumero,
    comprobanteReferencia,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy
  }) {
    this.id = id;
    this.creditId = creditId;
    this.clienteId = clienteId;
    this.userId = userId;
    this.monto = monto;
    this.fechaPago = fechaPago;
    this.metodoPago = metodoPago;
    this.cuotaNumero = cuotaNumero;
    this.comprobanteReferencia = comprobanteReferencia;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.updatedAt = updatedAt;
    this.updatedBy = updatedBy;
  }

  /**
   * Valida los datos del pago
   */
  validate() {
    if (!this.creditId) {
      throw new Error('El ID del crédito es requerido');
    }
    if (!this.clienteId) {
      throw new Error('El ID del cliente es requerido');
    }
    if (!this.userId) {
      throw new Error('El ID del cobrador es requerido');
    }
    if (!this.monto || this.monto <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }
    if (!this.metodoPago) {
      throw new Error('El método de pago es requerido');
    }
    if (!this.cuotaNumero || this.cuotaNumero <= 0) {
      throw new Error('El número de cuota debe ser mayor a 0');
    }
  }
}

module.exports = Payment;
