import { aplicarPorcentaje }
  from "./porcentajeEngine.js";

import { calcularIVA }
  from "./ivaEngine.js";

export function calcularOperacionComercial({
  subtotal,
  descuento = 0,
  bonificacion = 0,
  recargo = 0,
  iva = 21
}) {

  const descuentoMonto =
    aplicarPorcentaje(
      subtotal,
      descuento
    );

  const bonificacionMonto =
    aplicarPorcentaje(
      subtotal,
      bonificacion
    );

  const recargoMonto =
    aplicarPorcentaje(
      subtotal,
      recargo
    );

  const neto =
    subtotal
    - descuentoMonto
    - bonificacionMonto
    + recargoMonto;

  const ivaMonto =
    calcularIVA(neto, iva);

  const total =
    neto + ivaMonto;

  return {
    subtotal,

    descuentoMonto,
    bonificacionMonto,
    recargoMonto,

    neto,
    ivaMonto,
    total
  };
}