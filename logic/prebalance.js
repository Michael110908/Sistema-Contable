// 📊 GENERAR PREBALANCE / PLANILLA DE TRABAJO

/**
 * Genera el prebalance a partir del Balance de Sumas y Saldos
 * y de los movimientos de ajustes.
 *
 * Estructura:
 *
 * Cuenta
 * ├── Saldos
 * ├── Ajustes
 * ├── Saldos Ajustados
 * ├── Estado Patrimonial
 * └── Estado de Resultados
 *
 * Las cuentas se clasifican según cuentas.json.
 */
export function generarPrebalance(balance, ajustes = {}, cuentas = {}) {
  const cuentasBalance = balance?.cuentas || [];

  /*
   * ajustes puede llegar de distintas formas dependiendo
   * de cómo se genere posteriormente el sistema de ajustes.
   *
   * Esperamos:
   *
   * {
   *   "Caja": {
   *      debe: 0,
   *      haber: 500
   *   }
   * }
   */
  const movimientosAjuste = normalizarAjustes(ajustes);

  /*
   * Usamos Map para mantener una sola fila por cuenta.
   */
  const cuentasMap = new Map();

  // -----------------------------------------
  // 1. CUENTAS DEL BALANCE
  // -----------------------------------------

  cuentasBalance.forEach(item => {
    if (!item?.cuenta) return;

    cuentasMap.set(item.cuenta, {
      cuenta: item.cuenta,
      debe: numero(item.debe),
      haber: numero(item.haber),
      saldoDeudor: numero(item.saldoDeudor),
      saldoAcreedor: numero(item.saldoAcreedor)
    });
  });

  // -----------------------------------------
  // 2. CUENTAS QUE APARECEN SOLO EN AJUSTES
  // -----------------------------------------

  Object.keys(movimientosAjuste).forEach(cuenta => {
    if (cuentasMap.has(cuenta)) return;

    cuentasMap.set(cuenta, {
      cuenta,
      debe: 0,
      haber: 0,
      saldoDeudor: 0,
      saldoAcreedor: 0
    });
  });

  // -----------------------------------------
  // 3. GENERAR FILAS
  // -----------------------------------------

  const filas = [];

  for (const item of cuentasMap.values()) {
    const info = cuentas[item.cuenta];

    const ajuste = movimientosAjuste[item.cuenta] || {
      debe: 0,
      haber: 0
    };

    const ajusteDebe = numero(ajuste.debe);
    const ajusteHaber = numero(ajuste.haber);

    /*
     * Saldo original firmado:
     *
     * Deudor = positivo
     * Acreedor = negativo
     */
    const saldoInicial =
      item.saldoDeudor - item.saldoAcreedor;

    /*
     * Ajuste firmado:
     *
     * Debe = positivo
     * Haber = negativo
     */
    const movimientoAjuste =
      ajusteDebe - ajusteHaber;

    const saldoAjustado =
      saldoInicial + movimientoAjuste;

    const saldoAjustadoDeudor =
      saldoAjustado > 0
        ? saldoAjustado
        : 0;

    const saldoAjustadoAcreedor =
      saldoAjustado < 0
        ? Math.abs(saldoAjustado)
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
      cuenta: item.cuenta,

      saldos: {
        deudor: item.saldoDeudor,
        acreedor: item.saldoAcreedor
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
  }

  // -----------------------------------------
  // 4. SUBTOTALES
  // -----------------------------------------

  const subtotales = calcularSubtotales(filas);

  // -----------------------------------------
  // 5. RESULTADO DEL EJERCICIO
  // -----------------------------------------

  const resultadoEjercicio =
    subtotales.estadoResultados.positivo -
    subtotales.estadoResultados.negativo;

  const resultadoFila =
    generarFilaResultado(resultadoEjercicio);

  // -----------------------------------------
  // 6. TOTALES
  // -----------------------------------------

  const totales =
    calcularTotales(
      subtotales,
      resultadoFila
    );

  return {
    cuentas: filas,

    subtotales,

    resultadoEjercicio: resultadoFila,

    resultado: resultadoEjercicio,

    totales
  };
}


/* =========================================================
   CLASIFICACIÓN DE CUENTAS
   ========================================================= */

function clasificarCuenta(
  info,
  saldoDeudor,
  saldoAcreedor,
  estadoPatrimonial,
  estadoResultados
) {
  if (!info) return;

  const tipo = info.tipo;
  const comportamiento = info.comportamiento;

  // -----------------------------------------
  // ACTIVO
  // -----------------------------------------

  if (tipo === "activo") {
    if (saldoDeudor > 0) {
      estadoPatrimonial.activo = saldoDeudor;
    }

    return;
  }

  // -----------------------------------------
  // PASIVO
  // -----------------------------------------

  if (tipo === "pasivo") {
    if (saldoAcreedor > 0) {
      estadoPatrimonial.pasivoPatrimonio =
        saldoAcreedor;
    }

    return;
  }

  // -----------------------------------------
  // PATRIMONIO
  // -----------------------------------------

  if (tipo === "patrimonio") {
    if (saldoAcreedor > 0) {
      estadoPatrimonial.pasivoPatrimonio =
        saldoAcreedor;
    }

    return;
  }

  // -----------------------------------------
  // RESULTADO
  // -----------------------------------------

  if (tipo === "resultado") {
    clasificarResultado(
      saldoDeudor,
      saldoAcreedor,
      estadoResultados
    );

    return;
  }

  // -----------------------------------------
  // REGULARIZADORA DE ACTIVO
  // -----------------------------------------

  if (tipo === "regularizadora_activo") {
    /*
     * Una regularizadora de activo normalmente
     * posee saldo acreedor.
     *
     * No la sumamos al activo:
     * la colocamos como reducción del activo.
     *
     * Ejemplo:
     *
     * Inmuebles                  1.000.000
     * Amortización acumulada      -100.000
     */
    if (saldoAcreedor > 0) {
      estadoPatrimonial.activo =
        -saldoAcreedor;
    }

    /*
     * Si por alguna razón posee saldo deudor,
     * se comporta como un aumento del activo.
     */
    if (saldoDeudor > 0) {
      estadoPatrimonial.activo =
        saldoDeudor;
    }

    return;
  }

  // -----------------------------------------
  // CUENTAS DE MOVIMIENTO
  // -----------------------------------------

  if (tipo === "movimiento") {
    /*
     * Compras, por ejemplo, no pasa directamente
     * al Estado Patrimonial ni al Estado de Resultados.
     *
     * Se utiliza posteriormente para determinar
     * el CMV / costo correspondiente.
     */
    return;
  }

  // -----------------------------------------
  // CUENTAS DINÁMICAS
  // -----------------------------------------

  if (tipo === "dinamica") {

    // ---------------------------------------
    // DINÁMICA PATRIMONIAL
    // ---------------------------------------

    if (comportamiento === "patrimonial") {

      if (saldoDeudor > 0) {
        estadoPatrimonial.activo =
          saldoDeudor;
      }

      if (saldoAcreedor > 0) {
        estadoPatrimonial.pasivoPatrimonio =
          saldoAcreedor;
      }

      return;
    }

    // ---------------------------------------
    // DINÁMICA DE RESULTADO
    // ---------------------------------------

    if (comportamiento === "resultado") {

      clasificarResultado(
        saldoDeudor,
        saldoAcreedor,
        estadoResultados
      );

      return;
    }

    /*
     * Fallback:
     *
     * Si en el futuro agregamos una dinámica
     * sin comportamiento explícito, utilizamos
     * la naturaleza para decidir.
     */

    if (info.naturaleza === "deudora") {
      if (saldoDeudor > 0) {
        estadoPatrimonial.activo =
          saldoDeudor;
      }

      return;
    }

    if (info.naturaleza === "acreedora") {
      if (saldoAcreedor > 0) {
        estadoPatrimonial.pasivoPatrimonio =
          saldoAcreedor;
      }

      return;
    }
  }

  // -----------------------------------------
  // CUENTAS CALCULADAS
  // -----------------------------------------

  if (tipo === "calculada") {
    /*
     * Ejemplo:
     * Resultado del Ejercicio
     *
     * No se clasifica desde el saldo de la cuenta.
     * El sistema lo genera por separado.
     */
    return;
  }
}


/* =========================================================
   RESULTADOS
   ========================================================= */

function clasificarResultado(
  saldoDeudor,
  saldoAcreedor,
  estadoResultados
) {
  /*
   * Saldo deudor → resultado negativo
   *
   * Ej:
   * CMV
   * Faltante de Caja
   * Amortización
   * Intereses Perdidos
   */

  if (saldoDeudor > 0) {
    estadoResultados.negativo =
      saldoDeudor;
  }

  /*
   * Saldo acreedor → resultado positivo
   *
   * Ej:
   * Ventas
   * Sobrante de Caja
   * Intereses Ganados
   * Cambio de Cotización positivo
   */

  if (saldoAcreedor > 0) {
    estadoResultados.positivo =
      saldoAcreedor;
  }
}


/* =========================================================
   SUBTOTALES
   ========================================================= */

function calcularSubtotales(filas) {
  const subtotales = {
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

    subtotales.saldos.deudor +=
      fila.saldos.deudor;

    subtotales.saldos.acreedor +=
      fila.saldos.acreedor;

    subtotales.ajustes.debe +=
      fila.ajustes.debe;

    subtotales.ajustes.haber +=
      fila.ajustes.haber;

    subtotales.saldosAjustados.deudor +=
      fila.saldosAjustados.deudor;

    subtotales.saldosAjustados.acreedor +=
      fila.saldosAjustados.acreedor;

    /*
     * El activo puede tener valores negativos
     * por las regularizadoras.
     */
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


/* =========================================================
   RESULTADO DEL EJERCICIO
   ========================================================= */

function generarFilaResultado(resultado) {
  /*
   * GANANCIA
   *
   * Resultado positivo:
   *
   * Estado Patrimonial → Pasivo + PN
   * Estado de Resultados → Negativo
   *
   * Esto permite igualar ambas columnas
   * de la planilla.
   */

  if (resultado > 0) {
    return {
      nombre: "Resultado del Ejercicio",

      estadoPatrimonial: {
        activo: 0,
        pasivoPatrimonio: resultado
      },

      estadoResultados: {
        negativo: resultado,
        positivo: 0
      }
    };
  }

  /*
   * PÉRDIDA
   *
   * Estado Patrimonial → Activo
   * Estado de Resultados → Positivo
   */

  if (resultado < 0) {
    const perdida =
      Math.abs(resultado);

    return {
      nombre: "Resultado del Ejercicio",

      estadoPatrimonial: {
        activo: perdida,
        pasivoPatrimonio: 0
      },

      estadoResultados: {
        negativo: 0,
        positivo: perdida
      }
    };
  }

  return {
    nombre: "Resultado del Ejercicio",

    estadoPatrimonial: {
      activo: 0,
      pasivoPatrimonio: 0
    },

    estadoResultados: {
      negativo: 0,
      positivo: 0
    }
  };
}


/* =========================================================
   TOTALES
   ========================================================= */

function calcularTotales(
  subtotales,
  resultadoFila
) {
  return {
    saldos: {
      deudor:
        subtotales.saldos.deudor,

      acreedor:
        subtotales.saldos.acreedor
    },

    ajustes: {
      debe:
        subtotales.ajustes.debe,

      haber:
        subtotales.ajustes.haber
    },

    saldosAjustados: {
      deudor:
        subtotales.saldosAjustados.deudor,

      acreedor:
        subtotales.saldosAjustados.acreedor
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


/* =========================================================
   NORMALIZACIÓN DE AJUSTES
   ========================================================= */

function normalizarAjustes(ajustes) {
  const resultado = {};

  /*
   * Caso:
   *
   * {
   *   Caja: {
   *      debe: 100,
   *      haber: 0
   *   }
   * }
   */

  if (
    ajustes &&
    typeof ajustes === "object" &&
    !Array.isArray(ajustes)
  ) {
    for (const cuenta in ajustes) {
      const movimiento =
        ajustes[cuenta];

      if (!movimiento) continue;

      resultado[cuenta] = {
        debe: numero(movimiento.debe),
        haber: numero(movimiento.haber)
      };
    }

    return resultado;
  }

  /*
   * También dejamos preparado el motor para
   * recibir posteriormente un array de ajustes:
   *
   * [
   *   {
   *      cuenta: "Caja",
   *      debe: 100,
   *      haber: 0
   *   }
   * ]
   */

  if (Array.isArray(ajustes)) {
    ajustes.forEach(movimiento => {
      if (!movimiento?.cuenta) return;

      if (!resultado[movimiento.cuenta]) {
        resultado[movimiento.cuenta] = {
          debe: 0,
          haber: 0
        };
      }

      resultado[movimiento.cuenta].debe +=
        numero(movimiento.debe);

      resultado[movimiento.cuenta].haber +=
        numero(movimiento.haber);
    });
  }

  return resultado;
}


/* =========================================================
   UTILIDADES
   ========================================================= */

function numero(valor) {
  const n = Number(valor);

  return Number.isFinite(n)
    ? n
    : 0;
}