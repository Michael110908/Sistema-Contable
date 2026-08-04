/**
 * Genera los movimientos producidos exclusivamente
 * por los asientos de ajuste.
 *
 * No mezcla los asientos principales.
 *
 * Resultado:
 *
 * {
 *   Caja: {
 *     debe: 80,
 *     haber: 0
 *   },
 *
 *   "Faltante de Caja": {
 *     debe: 80,
 *     haber: 0
 *   }
 * }
 */

export function generarAjustes(ajustes) {
  const resultado = {};

  if (!Array.isArray(ajustes)) {
    return resultado;
  }

  ajustes.forEach(ajuste => {
    if (!ajuste) return;

    procesarMovimientos(ajuste.debe, "debe", resultado);
    procesarMovimientos(ajuste.haber, "haber", resultado);
  });

  return resultado;
}


/**
 * Procesa las líneas de Debe o Haber de un asiento.
 */
function procesarMovimientos(movimientos, lado, resultado) {
  if (!Array.isArray(movimientos)) return;

  movimientos.forEach(movimiento => {
    if (!movimiento) return;

    const cuenta = movimiento.cuenta;
    const monto = Number(movimiento.monto) || 0;

    if (!cuenta || monto <= 0) return;

    if (!resultado[cuenta]) {
      resultado[cuenta] = {
        debe: 0,
        haber: 0
      };
    }

    resultado[cuenta][lado] += monto;
  });
}


/**
 * Devuelve todas las cuentas que aparecen
 * en los ajustes.
 */
export function obtenerCuentasAjustadas(ajustes) {
  const ajustesGenerados = generarAjustes(ajustes);

  return Object.keys(ajustesGenerados);
}


/**
 * Obtiene el movimiento de ajuste de una cuenta.
 *
 * Si la cuenta no aparece en ningún ajuste,
 * devuelve Debe = 0 y Haber = 0.
 */
export function obtenerAjusteCuenta(ajustes, cuenta) {
  const ajustesGenerados = generarAjustes(ajustes);

  return ajustesGenerados[cuenta] || {
    debe: 0,
    haber: 0
  };
}