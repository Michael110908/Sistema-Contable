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

    // 🔹 determinar monto (según saldo)
    const monto =
      item.saldoAcreedor > 0
        ? item.saldoAcreedor
        : item.saldoDeudor;

    if (info.subtipo === "ingreso") {
      ingresos += monto;
      detalleIngresos.push({ cuenta: item.cuenta, monto });
    }

    if (info.subtipo === "costo") {
      costos += monto;
      detalleCostos.push({ cuenta: item.cuenta, monto });
    }

    if (info.subtipo === "gasto") {
      gastos += monto;
      detalleGastos.push({ cuenta: item.cuenta, monto });
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
