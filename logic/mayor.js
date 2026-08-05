// 📘 GENERAR LIBRO MAYOR
export function generarMayor(asientos) {
  const mayor = {};

  asientos.forEach(asiento => {

    // 🔹 DEBE
    asiento.debe.forEach(item => {
      if (!mayor[item.cuenta]) {
        mayor[item.cuenta] = {
          debe: [],
          haber: []
        };
      }

      mayor[item.cuenta].debe.push(item.monto);
    });

    // 🔹 HABER
    asiento.haber.forEach(item => {
      if (!mayor[item.cuenta]) {
        mayor[item.cuenta] = {
          debe: [],
          haber: []
        };
      }

      mayor[item.cuenta].haber.push(item.monto);
    });

  });

  return mayor;
}


// 🧠 CALCULAR SALDO (LÓGICA UNIVERSAL)
export function calcularSaldo(cuenta, debe, haber) {
  const totalDebe = debe.reduce((a, b) => a + b, 0);
  const totalHaber = haber.reduce((a, b) => a + b, 0);

  let saldo = 0;
  let tipoSaldo = "";

  // 🔥 regla contable real
  if (totalDebe > totalHaber) {
    saldo = totalDebe - totalHaber;
    tipoSaldo = "Deudor";
  } else if (totalHaber > totalDebe) {
    saldo = totalHaber - totalDebe;
    tipoSaldo = "Acreedor";
  } else {
    saldo = 0;
    tipoSaldo = "Sin saldo";
  }

  return {
    totalDebe,
    totalHaber,
    saldo,
    tipoSaldo
  };
}
