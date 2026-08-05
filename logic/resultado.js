// 📊 CALCULAR RESULTADO DEL EJERCICIO USANDO cuentas.json

export function calcularResultado(balance, cuentas) {
  let ingresos = 0;
  let costos = 0;
  let gastos = 0;

  const detalleIngresos = [];
  const detalleCostos = [];
  const detalleGastos = [];

  balance.cuentas.forEach(item => {
    const info = cuentas[item.cuenta];
    if (!info || info.tipo !== "resultado") return;

    // 🔥 Evaluamos por la realidad económica (el saldo real)
    if (item.saldoAcreedor > 0) {
      // Todo saldo acreedor en cuenta de resultado es una Ganancia (R.P.)
      ingresos += item.saldoAcreedor;
      detalleIngresos.push({ cuenta: item.cuenta, monto: item.saldoAcreedor });
    } else if (item.saldoDeudor > 0) {
      // Todo saldo deudor en cuenta de resultado es una Pérdida (R.N.)
      if (info.subtipo === "costo") {
        costos += item.saldoDeudor;
        detalleCostos.push({ cuenta: item.cuenta, monto: item.saldoDeudor });
      } else {
        gastos += item.saldoDeudor;
        detalleGastos.push({ cuenta: item.cuenta, monto: item.saldoDeudor });
      }
    }
  });

  const resultado = ingresos - costos - gastos;

  return {
    ingresos,
    costos,
    gastos,
    resultado,
    detalle: {
      ingresos: detalleIngresos,
      costos: detalleCostos,
      gastos: detalleGastos
    }
  };
}