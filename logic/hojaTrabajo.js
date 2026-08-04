import { redondear } from "../utils.js";

// 🧾 GENERAR HOJA DE TRABAJO (PREBALANCE)
//
// Combina el Balance de Sumas y Saldos original (sin ajustes) con los
// Asientos de Ajuste, y arma la planilla clásica de 12 columnas:
//   Sumas (Debe/Haber) | Saldos (Deudor/Acreedor) | Ajustes (Debe/Haber)
//   | Saldos Ajustados (Deudor/Acreedor) | Estado Patrimonial (Activo/Pas.+P.N.)
//   | Estado de Resultados (R.N./R.P.)
//
// balance: resultado de generarBalance() sobre los asientos del Libro Diario
// ajustes: array de asientos de ajuste { debe: [...], haber: [...] }
// cuentas: contenido de cuentas.json

export function generarHojaTrabajo(balance, ajustes, cuentas) {
  // 1) Sumar Debe/Haber de los ajustes por cuenta
  const ajusteSums = {};

  ajustes.forEach(asiento => {
    asiento.debe.forEach(({ cuenta, monto }) => {
      if (!ajusteSums[cuenta]) ajusteSums[cuenta] = { debe: 0, haber: 0 };
      ajusteSums[cuenta].debe += monto;
    });

    asiento.haber.forEach(({ cuenta, monto }) => {
      if (!ajusteSums[cuenta]) ajusteSums[cuenta] = { debe: 0, haber: 0 };
      ajusteSums[cuenta].haber += monto;
    });
  });

  // 2) Reunir todas las cuentas involucradas (las del balance + las nuevas por ajuste)
  const nombres = new Set([
    ...balance.cuentas.map(c => c.cuenta),
    ...Object.keys(ajusteSums)
  ]);

  const filas = [];

  const subtotales = {
    sumasDebe: 0, sumasHaber: 0,
    saldosDeudor: 0, saldosAcreedor: 0,
    ajustesDebe: 0, ajustesHaber: 0,
    sdoAjustDeudor: 0, sdoAjustAcreedor: 0,
    activo: 0, pasivoPN: 0,
    rn: 0, rp: 0
  };

  nombres.forEach(cuenta => {
    const orig = balance.cuentas.find(c => c.cuenta === cuenta) ||
      { debe: 0, haber: 0, saldoDeudor: 0, saldoAcreedor: 0 };

    const ajuste = ajusteSums[cuenta] || { debe: 0, haber: 0 };

    // 🔥 El saldo original se trata como "debe"/"haber" equivalente
    // y se le suman los movimientos de ajuste (misma columna suma, columna
    // contraria resta) para obtener el Saldo Ajustado.
    const debeEq = orig.saldoDeudor + ajuste.debe;
    const haberEq = orig.saldoAcreedor + ajuste.haber;

    let sdoAjustDeudor = 0;
    let sdoAjustAcreedor = 0;

    if (debeEq > haberEq) sdoAjustDeudor = redondear(debeEq - haberEq);
    else if (haberEq > debeEq) sdoAjustAcreedor = redondear(haberEq - debeEq);

    const info = cuentas[cuenta];

    let activo = 0;
    let pasivoPN = 0;
    let rn = 0;
    let rp = 0;

    if (info) {
      if (info.tipo === "activo") {
        activo = sdoAjustDeudor;
      }

      if (info.tipo === "pasivo" || info.tipo === "patrimonio") {
        pasivoPN = sdoAjustAcreedor;
      }

      if (info.tipo === "dinamica") {
        activo = sdoAjustDeudor;
        pasivoPN = sdoAjustAcreedor;
      }

      // R.N. = Resultado Negativo (costos y gastos) | R.P. = Resultado Positivo (ingresos)
      if (info.tipo === "resultado") {
        if (info.subtipo === "ingreso") {
          rp = sdoAjustAcreedor;
          rn = sdoAjustDeudor; // contrapartida infrecuente
        } else {
          // costo o gasto
          rn = sdoAjustDeudor;
          rp = sdoAjustAcreedor; // contrapartida infrecuente
        }
      }
    }

    filas.push({
      cuenta,
      sumasDebe: orig.debe,
      sumasHaber: orig.haber,
      saldoDeudor: orig.saldoDeudor,
      saldoAcreedor: orig.saldoAcreedor,
      ajusteDebe: ajuste.debe,
      ajusteHaber: ajuste.haber,
      sdoAjustDeudor,
      sdoAjustAcreedor,
      activo,
      pasivoPN,
      rn,
      rp
    });

    subtotales.sumasDebe += orig.debe;
    subtotales.sumasHaber += orig.haber;
    subtotales.saldosDeudor += orig.saldoDeudor;
    subtotales.saldosAcreedor += orig.saldoAcreedor;
    subtotales.ajustesDebe += ajuste.debe;
    subtotales.ajustesHaber += ajuste.haber;
    subtotales.sdoAjustDeudor += sdoAjustDeudor;
    subtotales.sdoAjustAcreedor += sdoAjustAcreedor;
    subtotales.activo += activo;
    subtotales.pasivoPN += pasivoPN;
    subtotales.rn += rn;
    subtotales.rp += rp;
  });

  // 3) Resultado del Ejercicio = Ingresos (R.P.) - Costos y Gastos (R.N.)
  //    Se usa como "ficha" (plug) para cerrar/igualar ambos pares de columnas.
  const resultado = redondear(subtotales.rp - subtotales.rn);

  let resultadoFila = null;

  if (resultado > 0) {
    // Ganancia → aumenta el Patrimonio y cierra el Estado de Resultados por R.N. (gastos)
    resultadoFila = { pasivoPN: resultado, rn: resultado, rp: 0 };
  } else if (resultado < 0) {
    // Pérdida → aumenta el Patrimonio, como ficha, y cierra el Estado de Resultados por R.P. (ingresos)
    resultadoFila = { pasivoPN: Math.abs(resultado), rn: 0, rp: Math.abs(resultado) };
  }

  const totales = { ...subtotales };

  if (resultadoFila) {
    totales.pasivoPN += resultadoFila.pasivoPN;
    totales.rn += resultadoFila.rn;
    totales.rp += resultadoFila.rp;
  }

  return {
    filas,
    subtotales,
    resultado,
    resultadoFila,
    totales
  };
}
