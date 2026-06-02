import {
  calcularOperacionComercial
} from "../engines/comercialEngine.js";

import {
  crearAsiento,
  agregarDebe,
  agregarHaber
} from "../engines/asientoEngine.js";

export function generarVentaFacturaA({

  cantidad,
  precioUnitario,

  descuento = 0,
  bonificacion = 0,
  recargo = 0,

  iva = 21,

  cuentaCobro = "Caja"

}) {

  const subtotal =
    cantidad * precioUnitario;

  const calculo =
    calcularOperacionComercial({

      subtotal,

      descuento,
      bonificacion,
      recargo,

      iva
    });

  const asiento =
    crearAsiento();

  agregarDebe(
    asiento,
    cuentaCobro,
    calculo.total
  );

  agregarHaber(
    asiento,
    "Ventas",
    calculo.neto
  );

  agregarHaber(
    asiento,
    "IVA Débito Fiscal",
    calculo.ivaMonto
  );

  return asiento;
}