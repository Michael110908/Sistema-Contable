import {
  crearAsiento,
  agregarDebe,
  agregarHaber
} from "../engines/asientoEngine.js";

import {
  calcularOperacionComercial
} from "../engines/comercialEngine.js";

import {
  calcularIVAIncluido
} from "../engines/ivaEngine.js";


// FACTURA A
export function generarCompraFacturaA({
  cantidad,
  precioUnitario,

  descuento = 0,
  bonificacion = 0,
  recargo = 0,

  cuentaCompra = "Mercaderías",
  cuentaPago = "Proveedores"
}) {

  const subtotal =
    cantidad * precioUnitario;

  const calculo =
    calcularOperacionComercial({
      subtotal,
      descuento,
      bonificacion,
      recargo
    });

  const asiento =
    crearAsiento();

  agregarDebe(
    asiento,
    cuentaCompra,
    calculo.neto
  );

  agregarDebe(
    asiento,
    "IVA Crédito Fiscal",
    calculo.ivaMonto
  );

  agregarHaber(
    asiento,
    cuentaPago,
    calculo.total
  );

  return asiento;
}


// FACTURA B
export function generarCompraFacturaB({
  cantidad,
  precioUnitario,

  cuentaCompra = "Mercaderías",
  cuentaPago = "Proveedores"
}) {

  const total =
    cantidad * precioUnitario;

  const iva =
    calcularIVAIncluido(total);

  const neto =
    total - iva;

  const asiento =
    crearAsiento();

  agregarDebe(
    asiento,
    cuentaCompra,
    neto
  );

  agregarDebe(
    asiento,
    "IVA Crédito Fiscal",
    iva
  );

  agregarHaber(
    asiento,
    cuentaPago,
    total
  );

  return asiento;
}


// FACTURA C
export function generarCompraFacturaC({
  cantidad,
  precioUnitario,

  cuentaCompra = "Mercaderías",
  cuentaPago = "Proveedores"
}) {

  const total =
    cantidad * precioUnitario;

  const asiento =
    crearAsiento();

  agregarDebe(
    asiento,
    cuentaCompra,
    total
  );

  agregarHaber(
    asiento,
    cuentaPago,
    total
  );

  return asiento;
}