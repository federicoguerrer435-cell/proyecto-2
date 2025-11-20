/**
 * Entidad Crédito
 * Representa un crédito otorgado a un cliente
 */
class Credit {
  constructor({
    id,
    numeroCredito,
    clienteId,
    montoPrincipal,
    cuotas,
    tasaInteresAplicada,
    fechaVencimiento,
    estado,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy
  }) {
    this.id = id;
    this.numeroCredito = numeroCredito;
    this.clienteId = clienteId;
    this.montoPrincipal = montoPrincipal;
    this.cuotas = cuotas;
    this.tasaInteresAplicada = tasaInteresAplicada;
    this.fechaVencimiento = fechaVencimiento;
    this.estado = estado;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.updatedAt = updatedAt;
    this.updatedBy = updatedBy;
  }

  /**
   * Valida los datos del crédito
   */
  validate() {
    if (!this.numeroCredito || this.numeroCredito.trim().length === 0) {
      throw new Error('El número de crédito es requerido');
    }
    if (!this.clienteId) {
      throw new Error('El cliente es requerido');
    }
    if (!this.montoPrincipal || this.montoPrincipal <= 0) {
      throw new Error('El monto principal debe ser mayor a 0');
    }
    if (!this.cuotas || this.cuotas <= 0) {
      throw new Error('El número de cuotas debe ser mayor a 0');
    }
    if (!this.tasaInteresAplicada || this.tasaInteresAplicada < 0) {
      throw new Error('La tasa de interés debe ser mayor o igual a 0');
    }
    if (!this.fechaVencimiento) {
      throw new Error('La fecha de vencimiento es requerida');
    }
  }

  /**
   * Calcula el monto total a pagar (principal + intereses)
   */
  calcularMontoTotal() {
    const interes = Number(this.montoPrincipal) * Number(this.tasaInteresAplicada);
    return Number(this.montoPrincipal) + interes;
  }

  /**
   * Calcula el valor de cada cuota
   */
  calcularValorCuota() {
    return this.calcularMontoTotal() / this.cuotas;
  }

  /**
   * Verifica si el crédito está vencido
   */
  isVencido() {
    return new Date() > new Date(this.fechaVencimiento) && 
           (this.estado === 'ACTIVO' || this.estado === 'INCUMPLIDO');
  }

  /**
   * Verifica si el crédito está próximo a vencer (dentro de los próximos X días)
   */
  isProximoAVencer(dias = 3) {
    const hoy = new Date();
    const vencimiento = new Date(this.fechaVencimiento);
    const diffTime = vencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= dias && this.estado === 'ACTIVO';
  }
}

module.exports = Credit;
