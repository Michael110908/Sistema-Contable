// 📊 GENERAR BALANCE DE SUMAS Y SALDOS

export function generarBalance(mayor, calcularSaldo) {
  const resultado = [];

  let totalDebe = 0;
  let totalHaber = 0;
  let totalSaldoDeudor = 0;
  let totalSaldoAcreedor = 0;

  for (const cuenta in mayor) {
    const { debe, haber } = mayor[cuenta];

    // 🔹 usamos la función universal del mayor
    const {
      totalDebe: d,
      totalHaber: h,
      saldo,
      tipoSaldo
    } = calcularSaldo(cuenta, debe, haber);

    // 🔹 separar saldo en columnas
    const saldoDeudor = tipoSaldo === "Deudor" ? saldo : 0;
    const saldoAcreedor = tipoSaldo === "Acreedor" ? saldo : 0;

    // 🔹 acumular totales
    totalDebe += d;
    totalHaber += h;
    totalSaldoDeudor += saldoDeudor;
    totalSaldoAcreedor += saldoAcreedor;

    // 🔹 guardar fila
    resultado.push({
      cuenta,
      debe: d,
      haber: h,
      saldoDeudor,
      saldoAcreedor
    });
  }

  return {
    cuentas: resultado,
    totales: {
      totalDebe,
      totalHaber,
      totalSaldoDeudor,
      totalSaldoAcreedor
    }
  };
}