import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generarMayor, calcularSaldo } from "../logic/mayor.js";
import { generarBalance } from "../logic/balance.js";
import { calcularResultado } from "../logic/resultado.js";
import { generarBalanceGeneral } from "../logic/general.js";

const cuentas = JSON.parse(readFileSync(new URL("../cuentas.json", import.meta.url), "utf8"));

const asientos = [
  {
    debe: [{ cuenta: "Caja", monto: 10000 }],
    haber: [{ cuenta: "Capital", monto: 10000 }]
  },
  {
    debe: [{ cuenta: "Deudores por Ventas", monto: 1210 }],
    haber: [
      { cuenta: "Ventas", monto: 1000 },
      { cuenta: "Iva - Debito Fiscal", monto: 210 }
    ]
  },
  {
    debe: [{ cuenta: "Gastos Generales", monto: 400 }],
    haber: [{ cuenta: "Proveedores", monto: 400 }]
  }
];

const mayor = generarMayor(asientos);
assert.deepEqual(mayor.Caja, { debe: [10000], haber: [] });
assert.deepEqual(mayor.Ventas, { debe: [], haber: [1000] });

const balance = generarBalance(mayor, calcularSaldo);
assert.equal(balance.totales.totalDebe, 11610);
assert.equal(balance.totales.totalHaber, 11610);
assert.equal(balance.totales.totalSaldoDeudor, 11610);
assert.equal(balance.totales.totalSaldoAcreedor, 11610);

const resultado = calcularResultado(balance, cuentas);
assert.equal(resultado.ingresos, 1000);
assert.equal(resultado.costos, 0);
assert.equal(resultado.gastos, 400);
assert.equal(resultado.resultado, 600);

const general = generarBalanceGeneral(balance, cuentas, resultado);
assert.equal(general.totalActivo, 11210);
assert.equal(general.totalPasivo, 610);
assert.equal(general.totalPatrimonio, 10600);

console.log("Pruebas contables OK");
