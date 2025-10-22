/**
 * Entidad Cliente
 * Representa un cliente del sistema de créditos
 */
class Client {
  constructor({
    id,
    nombre,
    cedula,
    direccion,
    telefono,
    referencias,
    modalidadPago,
    assignedTo,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy
  }) {
    this.id = id;
    this.nombre = nombre;
    this.cedula = cedula;
    this.direccion = direccion;
    this.telefono = telefono;
    this.referencias = referencias;
    this.modalidadPago = modalidadPago;
    this.assignedTo = assignedTo;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.updatedAt = updatedAt;
    this.updatedBy = updatedBy;
  }

  /**
   * Valida que los datos básicos del cliente sean correctos
   */
  validate() {
    if (!this.nombre || this.nombre.trim().length === 0) {
      throw new Error('El nombre del cliente es requerido');
    }
    if (!this.cedula || this.cedula.trim().length === 0) {
      throw new Error('La cédula del cliente es requerida');
    }
    if (!this.telefono || this.telefono.trim().length === 0) {
      throw new Error('El teléfono del cliente es requerido');
    }
  }
}

module.exports = Client;
