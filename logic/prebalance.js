import { generarAjustes } from "./ajustes.js";

/**
 * Genera la planilla de trabajo / prebalance.
 *
 * Estructura de cada cuenta:
 *
 * {
 *   numero,
 *   cuenta,
 *
 *   sumas: {
 *     debe,
 *     haber
 *   },
 *
 *   saldos: {
 *     deudor,
 *     acreedor
 *   },
 *
 *   ajustes: {
 *     debe,
 *     haber
 *   },
 *
 *   saldosAjustados: {
 *     deudor,
 *     acreedor
 *   },
 *
 *   estadoPatrimonial: {
 *     activo,
 *     pasivoPatrimonio
 *   },
 *
 *   estadoResultados: {
 *     negativo,
 *     positivo
 *   }
 * }
 */
export function generarPrebalance(balance, ajustes, cuentas) {
  const movimientosAjuste = generarAjustes(ajustes);

  const cuentasPorNombre = new Set();

  // Cuentas que ya estaban en el Balance de Sumas y Saldos.
  balance?.cuentas?.forEach(item => {
    if (item?.cuenta) {
      cuentasPorNombre.add(item.cuenta);
    }
  });

  // Cuentas que aparecen únicamente por los ajustes.
  Object.keys(movimientosAjuste).forEach(cuenta => {
    cuentasPorNombre.add(cuenta);
  });

  const filas = [];

  let numero = 1;

  for (const cuenta of cuentasPorNombre) {
    const balanceItem =
      balance.cuentas.find(item => item.cuenta === cuenta) || null;

    const info = cuentas?.[cuenta];

    /*
     * Si una cuenta aparece en un asiento pero no existe
     * en cuentas.json, no podemos clasificarla correctamente.
     *
     * La conservamos igualmente en el prebalance para no
     * perder información.
     */
    const sumasDebe = Number(balanceItem?.debe) || 0;
    const sumasHaber = Number(balanceItem?.haber) || 0;

    const saldoDeudor = Number(balanceItem?.saldoDeudor) || 0;
    const saldoAcreedor = Number(balanceItem?.saldoAcreedor) || 0;

    const ajuste = movimientosAjuste[cuenta] || {
      debe: 0,
      haber: 0
    };

    const ajusteDebe = Number(ajuste.debe) || 0;
    const ajusteHaber = Number(ajuste.haber) || 0;

    /*
     * Trabajamos internamente con un saldo firmado:
     *
     *   positivo = deudor
     *   negativo = acreedor
     *
     * Esto permite resolver correctamente casos como:
     *
     * Saldo deudor 100
     * Ajuste acreedor 150
     *
     * Resultado:
     * Acreedor 50
     */
    const saldoInicialFirmado =
      saldoDeudor - saldoAcreedor;

    const ajusteFirmado =
      ajusteDebe - ajusteHaber;

    const saldoAjustadoFirmado =
      saldoInicialFirmado + ajusteFirmado;

    const saldoAjustadoDeudor =
      saldoAjustadoFirmado > 0
        ? saldoAjustadoFirmado
        : 0;

    const saldoAjustadoAcreedor =
      saldoAjustadoFirmado < 0
        ? Math.abs(saldoAjustadoFirmado)
        : 0;

    const estadoPatrimonial = {
      activo: 0,
      pasivoPatrimonio: 0
    };

    const estadoResultados = {
      negativo: 0,
      positivo: 0
    };

    clasificarCuenta(
      info,
      saldoAjustadoDeudor,
      saldoAjustadoAcreedor,
      estadoPatrimonial,
      estadoResultados
    );

    filas.push({
      numero,
      cuenta,

      sumas: {
        debe: sumasDebe,
        haber: sumasHaber
      },

      saldos: {
        deudor: saldoDeudor,
        acreedor: saldoAcreedor
      },

      ajustes: {
        debe: ajusteDebe,
        haber: ajusteHaber
      },

      saldosAjustados: {
        deudor: saldoAjustadoDeudor,
        acreedor: saldoAjustadoAcreedor
      },

      estadoPatrimonial,

      estadoResultados
    });

    numero++;
  }

  const subtotales = calcularSubtotales(filas);

  const resultadoEjercicio =
    subtotales.estadoResultados.positivo -
    subtotales.estadoResultados.negativo;

  const resultadoFila =
    generarFilaResultado(resultadoEjercicio);

  const totales =
    calcularTotales(
      subtotales,
      resultadoFila
    );

  return {
    cuentas: filas,
    subtotales,
    resultadoEjercicio: resultadoFila,
    totales
  };
}


/**
 * Clasifica el saldo ajustado de una cuenta.
 */
function clasificarCuenta(
  info,
  saldoDeudor,
  saldoAcreedor,
  estadoPatrimonial,
  estadoResultados
) {
  if (!info) return;

  const tipo = info.tipo;

  /*
   * CUENTAS DE ACTIVO
   */
  if (tipo === "activo") {
    if (saldoDeudor > 0) {
      estadoPatrimonial.activo = saldoDeudor;
    }

    return;
  }

  /*
   * CUENTAS DE PASIVO
   */
  if (tipo === "pasivo") {
    if (saldoAcreedor > 0) {
      estadoPatrimonial.pasivoPatrimonio = saldoAcreedor;
    }

    return;
  }

  /*
   * CUENTAS DE PATRIMONIO
   */
  if (tipo === "patrimonio") {
    if (saldoAcreedor > 0) {
      estadoPatrimonial.pasivoPatrimonio = saldoAcreedor;
    }

    return;
  }

  /*
   * CUENTAS DE RESULTADO
   *
   * Las cuentas con naturaleza deudora representan
   * resultados negativos.
   *
   * Las cuentas con naturaleza acreedora representan
   * resultados positivos.
   */
  if (tipo === "resultado") {
    if (saldoDeudor > 0) {
      estadoResultados.negativo = saldoDeudor;
    }

    if (saldoAcreedor > 0) {
      estadoResultados.positivo = saldoAcreedor;
    }

    return;
  }

  /*
   * CUENTAS DINÁMICAS
   *
   * Ejemplo:
   * Arca IVA Saldo
   *
   * Su ubicación depende del saldo que tengan.
   */
  if (tipo === "dinamica") {
    if (saldoDeudor > 0) {
      estadoPatrimonial.activo = saldoDeudor;
    }

    if (saldoAcreedor > 0) {
      estadoPatrimonial.pasivoPatrimonio = saldoAcreedor;
    }
  }
}


/**
 * Calcula los subtotales de la planilla.
 */
function calcularSubtotales(filas) {
  const subtotales = {
    sumas: {
      debe: 0,
      haber: 0
    },

    saldos: {
      deudor: 0,
      acreedor: 0
    },

    ajustes: {
      debe: 0,
      haber: 0
    },

    saldosAjustados: {
      deudor: 0,
      acreedor: 0
    },

    estadoPatrimonial: {
      activo: 0,
      pasivoPatrimonio: 0
    },

    estadoResultados: {
      negativo: 0,
      positivo: 0
    }
  };

  filas.forEach(fila => {
    subtotales.sumas.debe += fila.sumas.debe;
    subtotales.sumas.haber += fila.sumas.haber;

    subtotales.saldos.deudor += fila.saldos.deudor;
    subtotales.saldos.acreedor += fila.saldos.acreedor;

    subtotales.ajustes.debe += fila.ajustes.debe;
    subtotales.ajustes.haber += fila.ajustes.haber;

    subtotales.saldosAjustados.deudor +=
      fila.saldosAjustados.deudor;

    subtotales.saldosAjustados.acreedor +=
      fila.saldosAjustados.acreedor;

    subtotales.estadoPatrimonial.activo +=
      fila.estadoPatrimonial.activo;

    subtotales.estadoPatrimonial.pasivoPatrimonio +=
      fila.estadoPatrimonial.pasivoPatrimonio;

    subtotales.estadoResultados.negativo +=
      fila.estadoResultados.negativo;

    subtotales.estadoResultados.positivo +=
      fila.estadoResultados.positivo;
  });

  return subtotales;
}


/**
 * Genera la fila "Resultado del Ejercicio".
 *
 * Si hay ganancia:
 *
 *   P + PN  ← resultado
 *   R.N.    ← resultado
 *
 * Si hay pérdida:
 *
 *   Activo  ← resultado
 *   R.P.    ← resultado
 *
 * De esta forma se equilibran las columnas.
 */
function generarFilaResultado(resultado) {
  return {
    nombre: "Resultado del Ejercicio",

    estadoPatrimonial: {
      activo: resultado < 0
        ? Math.abs(resultado)
        : 0,

      pasivoPatrimonio: resultado > 0
        ? resultado
        : 0
    },

    estadoResultados: {
      negativo: resultado > 0
        ? resultado
        : 0,

      positivo: resultado < 0
        ? Math.abs(resultado)
        : 0
    }
  };
}


/**
 * Calcula la fila TOTAL.
 */
function calcularTotales(subtotales, resultadoFila) {
  return {
    sumas: {
      debe: subtotales.sumas.debe,
      haber: subtotales.sumas.haber
    },

    saldos: {
      deudor: subtotales.saldos.deudor,
      acreedor: subtotales.saldos.acreedor
    },

    ajustes: {
      debe: subtotales.ajustes.debe,
      haber: subtotales.ajustes.haber
    },

    saldosAjustados: {
      deudor: subtotales.saldosAjustados.deudor,
      acreedor: subtotales.saldosAjustados.acreedor
    },

    estadoPatrimonial: {
      activo:
        subtotales.estadoPatrimonial.activo +
        resultadoFila.estadoPatrimonial.activo,

      pasivoPatrimonio:
        subtotales.estadoPatrimonial.pasivoPatrimonio +
        resultadoFila.estadoPatrimonial.pasivoPatrimonio
    },

    estadoResultados: {
      negativo:
        subtotales.estadoResultados.negativo +
        resultadoFila.estadoResultados.negativo,

      positivo:
        subtotales.estadoResultados.positivo +
        resultadoFila.estadoResultados.positivo
    }
  };
}