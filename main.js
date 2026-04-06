import { generarMayor, calcularSaldo } from "./logic/mayor.js";
import { generarBalance } from "./logic/balance.js";
import { generarBalanceGeneral } from "./logic/general.js";
import { setupAutocomplete } from "./autocomplete.js";
import { calcularResultado } from "./logic/resultado.js";
import { format } from "./utils.js";

const asientos = [];
let cuentas = {};

fetch("./cuentas.json")
  .then(res => res.json())
  .then(data => {
    cuentas = data;
    limpiarFormulario();
  });

function agregarLinea() {
  const tr = document.createElement("tr");

  const tdCuenta = document.createElement("td");
  const inputCuenta = document.createElement("input");
  inputCuenta.type = "text";

  setupAutocomplete(inputCuenta, cuentas);
  tdCuenta.appendChild(inputCuenta);

  const tdDebe = document.createElement("td");
  tdDebe.innerHTML = `<input type="number" step="0.01">`;

  const tdHaber = document.createElement("td");
  tdHaber.innerHTML = `<input type="number" step="0.01">`;

  tr.appendChild(tdCuenta);
  tr.appendChild(tdDebe);
  tr.appendChild(tdHaber);

  document.getElementById("asientoBody").appendChild(tr);
}

document.getElementById("agregarLinea").addEventListener("click", agregarLinea);

document.getElementById("guardarAsiento").addEventListener("click", () => {
  const filas = [...document.querySelectorAll("#asientoBody tr")];

  const asiento = { debe: [], haber: [] };

  let totalDebe = 0;
  let totalHaber = 0;
  let hayError = false;

  filas.forEach((fila, i) => {
    const inputs = fila.querySelectorAll("input");

    const cuenta = inputs[0].value.trim();
    const debe = parseFloat(inputs[1].value) || 0;
    const haber = parseFloat(inputs[2].value) || 0;

    if (!cuenta && debe === 0 && haber === 0) return;

    if (!cuenta || !cuentas[cuenta]) {
      document.getElementById("error").textContent =
        `Cuenta inválida en fila ${i + 1}`;
      hayError = true;
      return;
    }

    if (debe > 0 && haber > 0) {
      document.getElementById("error").textContent =
        `Fila ${i + 1} tiene debe y haber`;
      hayError = true;
      return;
    }

    if (debe > 0) {
      asiento.debe.push({ cuenta, monto: debe });
      totalDebe += debe;
    }

    if (haber > 0) {
      asiento.haber.push({ cuenta, monto: haber });
      totalHaber += haber;
    }
  });

  if (hayError) return;

  const EPSILON = 0.01;
  if (Math.abs(totalDebe - totalHaber) > EPSILON) {
    document.getElementById("error").textContent =
      "Debe y Haber no coinciden";
    return;
  }

  if (totalDebe === 0) {
    document.getElementById("error").textContent =
      "Asiento vacío";
    return;
  }

  document.getElementById("error").textContent = "";

  asientos.push(asiento);

  renderAsientos();
  limpiarFormulario();
});

function limpiarFormulario() {
  const body = document.getElementById("asientoBody");
  body.innerHTML = "";
  agregarLinea();
}

function renderAsientos() {
  const container = document.getElementById("listaAsientos");
  container.innerHTML = "";

  asientos.forEach((asiento, index) => {
    const div = document.createElement("div");

    let html = `<strong>Asiento ${index + 1}</strong><br>`;

    html += "Debe:<br>";
    asiento.debe.forEach(d => {
      html += `${d.cuenta}: $${format(d.monto)}<br>`;
    });

    html += "Haber:<br>";
    asiento.haber.forEach(h => {
      html += `${h.cuenta}: $${format(h.monto)}<br>`;
    });

    div.innerHTML = html;
    container.appendChild(div);
  });
}

document.getElementById("procesarTodo").addEventListener("click", () => {
  if (asientos.length === 0) return;

  const mayor = generarMayor(asientos);
  renderMayor(mayor);

  const balance = generarBalance(mayor, calcularSaldo);
  renderBalance(balance);

  const resultado = calcularResultado(balance, cuentas);
  renderResultadoVisual(resultado);

  const general = generarBalanceGeneral(balance, cuentas, resultado);
  renderBalanceGeneral(general);
});

function renderMayor(mayor) {
  const container = document.getElementById("mayorContainer");
  container.innerHTML = "";

  for (const cuenta in mayor) {
    const { debe, haber } = mayor[cuenta];

    const { totalDebe, totalHaber, saldo, tipoSaldo } =
      calcularSaldo(cuenta, debe, haber);

    const div = document.createElement("div");
    div.classList.add("mayor-box");

    div.innerHTML = `
      <div class="mayor-title">${cuenta}</div>

      <div class="t-box">
        <div class="t-header">
          <span>Debe</span>
          <span>Haber</span>
        </div>

        <div class="t-body">
          <div class="col debe">
            ${debe.map(d => `<div class="linea">${format(d)}</div>`).join("")}
          </div>

          <div class="col haber">
            ${haber.map(h => `<div class="linea">${format(h)}</div>`).join("")}
          </div>
        </div>
      </div>

      <div class="totales">
        ${format(totalDebe)} | ${format(totalHaber)}
      </div>

      <div class="saldo">
        ${
          saldo === 0
            ? "Sin saldo"
            : `Saldo ${tipoSaldo}: ${format(saldo)}`
        }
      </div>
    `;

    container.appendChild(div);
  }
}

function renderBalance(balance) {
  const tbody = document.getElementById("balanceBody");
  tbody.innerHTML = "";

  balance.cuentas.forEach(item => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.cuenta}</td>
      <td>${format(item.debe)}</td>
      <td>${format(item.haber)}</td>
      <td>${format(item.saldoDeudor)}</td>
      <td>${format(item.saldoAcreedor)}</td>
    `;

    tbody.appendChild(tr);
  });

  document.getElementById("totalDebe").textContent =
    format(balance.totales.totalDebe);

  document.getElementById("totalHaber").textContent =
    format(balance.totales.totalHaber);

  document.getElementById("totalSaldoDeudor").textContent =
    format(balance.totales.totalSaldoDeudor);

  document.getElementById("totalSaldoAcreedor").textContent =
    format(balance.totales.totalSaldoAcreedor);
}

function renderResultadoVisual(resultado) {
  document.getElementById("resultadoFinal").textContent =
    format(resultado.resultado);
}

function renderBalanceGeneral(general) {
  const activoList = document.getElementById("activoList");
  const pasivoList = document.getElementById("pasivoList");
  const patrimonioList = document.getElementById("patrimonioList");

  activoList.innerHTML = "";
  pasivoList.innerHTML = "";
  patrimonioList.innerHTML = "";

  general.activo.forEach(item => {
    activoList.innerHTML += `<li>${item.nombre}: ${format(item.monto)}</li>`;
  });

  general.pasivo.forEach(item => {
    pasivoList.innerHTML += `<li>${item.nombre}: ${format(item.monto)}</li>`;
  });

  general.patrimonio.forEach(item => {
    patrimonioList.innerHTML += `<li>${item.nombre}: ${format(item.monto)}</li>`;
  });

  document.getElementById("totalActivo").textContent =
    format(general.totalActivo);

  document.getElementById("totalPasivo").textContent =
    format(general.totalPasivo);

  document.getElementById("totalPatrimonio").textContent =
    format(general.totalPatrimonio);
}

const modal = document.getElementById("modal");
const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");

openBtn.addEventListener("click", () => {
  modal.style.display = "block";
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});