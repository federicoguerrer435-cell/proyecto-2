class Client {
  constructor({
    id,
    name,
    cedula,
    direccion,
    telefono,
    referencias,
    modalidad_pago,
    documento_url,
    created_at,
    updated_at,
  }) {
    this.id = id;
    this.name = name;
    this.cedula = cedula;
    this.direccion = direccion;
    this.telefono = telefono;
    this.referencias = referencias;
    this.modalidad_pago = modalidad_pago;
    this.documento_url = documento_url;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

module.exports = Client;
