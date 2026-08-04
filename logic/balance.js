export function generarBalance(mayor, calcularSaldo) {
  const resultado = [];

  let totalDebe = 0;
  let totalHaber = 0;
  let totalSaldoDeudor = 0;
  let totalSaldoAcreedor = 0;

  for (const cuenta in mayor) {
    const { debe, haber } = mayor[cuenta];
    const {
      totalDebe: d,
      totalHaber: h,
      saldo,
      tipoSaldo
    } = calcularSaldo(cuenta, debe, haber);

    const saldoDeudor = tipoSaldo === "Deudor" ? saldo : 0;
    const saldoAcreedor = tipoSaldo === "Acreedor" ? saldo : 0;

    totalDebe += d;
    totalHaber += h;
    totalSaldoDeudor += saldoDeudor;
    totalSaldoAcreedor += saldoAcreedor;

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
