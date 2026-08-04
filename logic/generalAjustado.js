import { generarBalanceGeneral } from "./general.js";

// 🏦 BALANCE GENERAL CON AJUSTES
//
// Toma los Saldos Ajustados calculados en la Hoja de Trabajo y reutiliza
// generarBalanceGeneral() (misma lógica que el Balance General sin ajustes)
// para clasificar Activo / Pasivo / Patrimonio, ya con el impacto de los
// asientos de ajuste incluido.

export function generarBalanceGeneralAjustado(hoja, cuentas) {
  const balanceAjustado = {
    cuentas: hoja.filas.map(f => ({
      cuenta: f.cuenta,
      debe: f.sumasDebe,
      haber: f.sumasHaber,
      saldoDeudor: f.sdoAjustDeudor,
      saldoAcreedor: f.sdoAjustAcreedor
    })),
    totales: {}
  };

  const resultadoObj = { resultado: hoja.resultado };

  return generarBalanceGeneral(balanceAjustado, cuentas, resultadoObj);
}
