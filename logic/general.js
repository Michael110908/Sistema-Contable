export function generarBalanceGeneral(balance, cuentas, resultadoObj) {
  const activo = [];
  const pasivo = [];
  const patrimonio = [];

  let totalActivo = 0;
  let totalPasivo = 0;
  let totalPatrimonio = 0;

  balance.cuentas.forEach(item => {
    const info = cuentas[item.cuenta];
    if (!info) return;

    const tipo = info.tipo;

    // 🔵 ACTIVO
    if (tipo === "activo") {
      if (info.subtipo === "regularizadora") {
        // Si es regularizadora, tomamos su saldo acreedor y lo convertimos a negativo
        const monto = -item.saldoAcreedor;

        if (item.saldoAcreedor > 0) {
          activo.push({ nombre: item.cuenta, monto });
          totalActivo += monto; // Al sumar un número negativo, matemáticamente se resta
        }
      } else {
        // Comportamiento normal para el resto de los activos
        const monto = item.saldoDeudor;

        if (monto > 0) {
          activo.push({ nombre: item.cuenta, monto });
          totalActivo += monto;
        }
      }
    }

    // 🔴 PASIVO
    if (tipo === "pasivo") {
      const monto = item.saldoAcreedor;

      if (monto > 0) {
        pasivo.push({ nombre: item.cuenta, monto });
        totalPasivo += monto;
      }
    }

    // 🟡 PATRIMONIO
    if (tipo === "patrimonio") {
      const monto = item.saldoAcreedor;

      if (monto > 0) {
        patrimonio.push({ nombre: item.cuenta, monto });
        totalPatrimonio += monto;
      }
    }

    // 🔥 CUENTAS DINÁMICAS (IVA, etc.)
    if (tipo === "dinamica") {
      if (item.saldoDeudor > 0) {
        activo.push({
          nombre: item.cuenta,
          monto: item.saldoDeudor
        });
        totalActivo += item.saldoDeudor;
      }

      if (item.saldoAcreedor > 0) {
        pasivo.push({
          nombre: item.cuenta,
          monto: item.saldoAcreedor
        });
        totalPasivo += item.saldoAcreedor;
      }
    }
  });

  // 🔥 RESULTADO DEL EJERCICIO
  if (resultadoObj) {
    const resultado = resultadoObj.resultado;

    if (resultado !== 0) {
      patrimonio.push({
        nombre: "Resultado del Ejercicio",
        monto: resultado
      });

      totalPatrimonio += resultado;
    }
  }

  return {
    activo,
    pasivo,
    patrimonio,
    totalActivo,
    totalPasivo,
    totalPatrimonio
  };
}
