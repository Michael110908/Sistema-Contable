import { generarMayor, calcularSaldo } from "./logic/mayor.js";
import { generarBalance } from "./logic/balance.js";
import { generarBalanceGeneral } from "./logic/general.js";
import { generarBalanceGeneralAjustado } from "./logic/generalAjustado.js";
import { generarHojaTrabajo } from "./logic/hojaTrabajo.js";
import { setupAutocomplete } from "./autocomplete.js";
import { calcularResultado } from "./logic/resultado.js";
import { format } from "./utils.js";
import {
  cargarAsientos,
  guardarAsientos,
  cargarAjustes,
  guardarAjustes
} from "./logic/storage.js";

// 🔹 ESTADO ------------------------------------------------------------

let asientos = cargarAsientos();   // Libro Diario (persistido)
let ajustes = cargarAjustes();     // Asientos de Ajuste (persistido)
let cuentas = {};

let editingAsientoIndex = null;
let editingAjusteIndex = null;

let balanceActual = null; // Balance de Sumas y Saldos sin ajustes (necesario para procesar ajustes)

fetch("./cuentas.json")
  .then(res => res.json())
  .then(data => {
    cuentas = data;
    limpiarFormulario();
    limpiarFormularioAjuste();
    renderAsientos();
    renderAjustes();
  })

  .catch(error => {
    console.error("Hubo un error cargando las cuentas:", error);
  });

// 🔹 HELPERS DE FORMULARIO (compartidos entre Asientos y Ajustes) -----

function crearLineaInput(tbodyId) {
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

  document.getElementById(tbodyId).appendChild(tr);
  return tr;
}

function agregarLinea() {
  crearLineaInput("asientoBody");
}

function agregarLineaAjuste() {
  crearLineaInput("ajusteBody");
}

document.getElementById("agregarLinea").addEventListener("click", agregarLinea);
document.getElementById("agregarLineaAjuste").addEventListener("click", agregarLineaAjuste);

function leerYValidarFilas(tbodyId, errorId) {
  const filas = [...document.querySelectorAll(`#${tbodyId} tr`)];

  const entrada = { debe: [], haber: [] };

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
      document.getElementById(errorId).textContent =
        `Cuenta inválida en fila ${i + 1}`;
      hayError = true;
      return;
    }

    if (debe > 0 && haber > 0) {
      document.getElementById(errorId).textContent =
        `Fila ${i + 1} tiene debe y haber`;
      hayError = true;
      return;
    }

    if (debe > 0) {
      entrada.debe.push({ cuenta, monto: debe });
      totalDebe += debe;
    }

    if (haber > 0) {
      entrada.haber.push({ cuenta, monto: haber });
      totalHaber += haber;
    }
  });

  if (hayError) return null;

  const EPSILON = 0.01;
  if (Math.abs(totalDebe - totalHaber) > EPSILON) {
    document.getElementById(errorId).textContent =
      "Debe y Haber no coinciden";
    return null;
  }

  if (totalDebe === 0) {
    document.getElementById(errorId).textContent =
      "Asiento vacío";
    return null;
  }

  document.getElementById(errorId).textContent = "";
  return entrada;
}

function limpiarFormulario() {
  const body = document.getElementById("asientoBody");
  body.innerHTML = "";
  agregarLinea();
}

function limpiarFormularioAjuste() {
  const body = document.getElementById("ajusteBody");
  body.innerHTML = "";
  agregarLineaAjuste();
}

function cargarEntradaEnFormulario(tbodyId, agregarLineaFn, entrada) {
  const body = document.getElementById(tbodyId);
  body.innerHTML = "";

  entrada.debe.forEach(d => {
    const tr = crearLineaInput(tbodyId);
    const inputs = tr.querySelectorAll("input");
    inputs[0].value = d.cuenta;
    inputs[1].value = d.monto;
  });

  entrada.haber.forEach(h => {
    const tr = crearLineaInput(tbodyId);
    const inputs = tr.querySelectorAll("input");
    inputs[0].value = h.cuenta;
    inputs[2].value = h.monto;
  });

  agregarLineaFn(); // fila extra vacía al final
}

// 🔹 GUARDAR / EDITAR / ELIMINAR — ASIENTOS DEL LIBRO DIARIO -----------

document.getElementById("guardarAsiento").addEventListener("click", () => {
  const entrada = leerYValidarFilas("asientoBody", "error");
  if (!entrada) return;

  if (editingAsientoIndex !== null) {
    asientos[editingAsientoIndex] = entrada;
    salirModoEdicionAsiento();
  } else {
    asientos.push(entrada);
  }

  guardarAsientos(asientos);
  renderAsientos();
  limpiarFormulario();
});

document.getElementById("cancelarEdicionAsiento").addEventListener("click", () => {
  salirModoEdicionAsiento();
  document.getElementById("error").textContent = "";
  limpiarFormulario();
});

function salirModoEdicionAsiento() {
  editingAsientoIndex = null;
  document.getElementById("editandoAsientoLabel").classList.add("oculto");
  document.getElementById("cancelarEdicionAsiento").classList.add("oculto");
}

function editarAsiento(index) {
  const asiento = asientos[index];
  if (!asiento) return;

  cargarEntradaEnFormulario("asientoBody", agregarLinea, asiento);

  editingAsientoIndex = index;

  const label = document.getElementById("editandoAsientoLabel");
  label.textContent = `✏️ Editando Asiento ${index + 1}`;
  label.classList.remove("oculto");

  document.getElementById("cancelarEdicionAsiento").classList.remove("oculto");
  document.getElementById("error").textContent = "";

  document.getElementById("asientoBody").closest("section")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

function eliminarAsiento(index) {
  if (!confirm(`¿Eliminar el Asiento ${index + 1}? Esta acción no se puede deshacer.`)) return;

  asientos.splice(index, 1);
  guardarAsientos(asientos);

  if (editingAsientoIndex === index) {
    salirModoEdicionAsiento();
    limpiarFormulario();
  } else if (editingAsientoIndex !== null && index < editingAsientoIndex) {
    editingAsientoIndex -= 1;
  }

  renderAsientos();
}

function renderAsientos() {
  const container = document.getElementById("listaAsientos");
  container.innerHTML = "";

  if (asientos.length === 0) {
    container.innerHTML = `<p class="hint">Todavía no cargaste ningún asiento.</p>`;
    return;
  }

  asientos.forEach((asiento, index) => {
    const div = document.createElement("div");
    div.classList.add("entrada-item");

    let html = `
      <div class="entrada-header">
        <strong>Asiento ${index + 1}</strong>
        <div class="entrada-actions">
          <button type="button" class="mini editar" data-index="${index}" title="Editar">✏️</button>
          <button type="button" class="mini eliminar" data-index="${index}" title="Eliminar">🗑️</button>
        </div>
      </div>
    `;

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

  container.querySelectorAll(".editar").forEach(btn => {
    btn.addEventListener("click", () => editarAsiento(parseInt(btn.dataset.index, 10)));
  });

  container.querySelectorAll(".eliminar").forEach(btn => {
    btn.addEventListener("click", () => eliminarAsiento(parseInt(btn.dataset.index, 10)));
  });
}

// 🔹 GUARDAR / EDITAR / ELIMINAR — ASIENTOS DE AJUSTE ------------------

document.getElementById("guardarAjuste").addEventListener("click", () => {
  const entrada = leerYValidarFilas("ajusteBody", "errorAjuste");
  if (!entrada) return;

  if (editingAjusteIndex !== null) {
    ajustes[editingAjusteIndex] = entrada;
    salirModoEdicionAjuste();
  } else {
    ajustes.push(entrada);
  }

  guardarAjustes(ajustes);
  renderAjustes();
  limpiarFormularioAjuste();
});

document.getElementById("cancelarEdicionAjuste").addEventListener("click", () => {
  salirModoEdicionAjuste();
  document.getElementById("errorAjuste").textContent = "";
  limpiarFormularioAjuste();
});

function salirModoEdicionAjuste() {
  editingAjusteIndex = null;
  document.getElementById("editandoAjusteLabel").classList.add("oculto");
  document.getElementById("cancelarEdicionAjuste").classList.add("oculto");
}

function editarAjuste(index) {
  const ajuste = ajustes[index];
  if (!ajuste) return;

  cargarEntradaEnFormulario("ajusteBody", agregarLineaAjuste, ajuste);

  editingAjusteIndex = index;

  const label = document.getElementById("editandoAjusteLabel");
  label.textContent = `✏️ Editando Ajuste ${index + 1}`;
  label.classList.remove("oculto");

  document.getElementById("cancelarEdicionAjuste").classList.remove("oculto");
  document.getElementById("errorAjuste").textContent = "";

  document.getElementById("ajusteBody").closest("section")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

function eliminarAjuste(index) {
  if (!confirm(`¿Eliminar el Ajuste ${index + 1}? Esta acción no se puede deshacer.`)) return;

  ajustes.splice(index, 1);
  guardarAjustes(ajustes);

  if (editingAjusteIndex === index) {
    salirModoEdicionAjuste();
    limpiarFormularioAjuste();
  } else if (editingAjusteIndex !== null && index < editingAjusteIndex) {
    editingAjusteIndex -= 1;
  }

  renderAjustes();
}

function renderAjustes() {
  const container = document.getElementById("listaAjustes");
  container.innerHTML = "";

  if (ajustes.length === 0) {
    container.innerHTML = `<p class="hint">Todavía no cargaste ningún asiento de ajuste.</p>`;
    return;
  }

  ajustes.forEach((ajuste, index) => {
    const div = document.createElement("div");
    div.classList.add("entrada-item");

    let html = `
      <div class="entrada-header">
        <strong>Ajuste ${index + 1}</strong>
        <div class="entrada-actions">
          <button type="button" class="mini editar" data-index="${index}" title="Editar">✏️</button>
          <button type="button" class="mini eliminar" data-index="${index}" title="Eliminar">🗑️</button>
        </div>
      </div>
    `;

    html += "Debe:<br>";
    ajuste.debe.forEach(d => {
      html += `${d.cuenta}: $${format(d.monto)}<br>`;
    });

    html += "Haber:<br>";
    ajuste.haber.forEach(h => {
      html += `${h.cuenta}: $${format(h.monto)}<br>`;
    });

    div.innerHTML = html;
    container.appendChild(div);
  });

  container.querySelectorAll(".editar").forEach(btn => {
    btn.addEventListener("click", () => editarAjuste(parseInt(btn.dataset.index, 10)));
  });

  container.querySelectorAll(".eliminar").forEach(btn => {
    btn.addEventListener("click", () => eliminarAjuste(parseInt(btn.dataset.index, 10)));
  });
}

// 🔹 PROCESAR LIBRO DIARIO (SIN AJUSTES) --------------------------------

document.getElementById("procesarTodo").addEventListener("click", () => {
  if (asientos.length === 0) {
    alert("Cargá al menos un asiento antes de procesar.");
    return;
  }

  const mayor = generarMayor(asientos);
  renderMayorEn("mayorContainer", mayor);

  const balance = generarBalance(mayor, calcularSaldo);
  renderBalance(balance);
  balanceActual = balance;

  const resultado = calcularResultado(balance, cuentas);
  renderResultadoVisual(resultado);

  const general = generarBalanceGeneral(balance, cuentas, resultado);
  renderBalanceGeneralEn("", general);
});

// 🔹 PROCESAR AJUSTES Y BALANCE FINAL -----------------------------------

document.getElementById("procesarAjustes").addEventListener("click", () => {
  if (!balanceActual) {
    alert('Primero presioná "Generar Libros y Balances" para calcular el Balance de Sumas y Saldos.');
    return;
  }

  const mayorAjustes = generarMayor(ajustes);
  renderMayorEn("mayorAjustesContainer", mayorAjustes);

  const hoja = generarHojaTrabajo(balanceActual, ajustes, cuentas);
  renderHojaTrabajo(hoja);

  const generalAjustado = generarBalanceGeneralAjustado(hoja, cuentas);
  renderBalanceGeneralEn("Aj", generalAjustado);

  document.getElementById("resultadoFinalAj").textContent =
    `Resultado del Ejercicio (con ajustes): ${format(hoja.resultado)}`;
});

// 🔹 RENDER: LIBRO MAYOR (reutilizado para Diario y Ajustes) ------------

function renderMayorEn(containerId, mayor) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  const cuentasKeys = Object.keys(mayor);

  if (cuentasKeys.length === 0) {
    container.innerHTML = `<p class="hint">No hay movimientos para mostrar todavía.</p>`;
    return;
  }

  cuentasKeys.forEach(cuenta => {
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
  });
}

// 🔹 RENDER: BALANCE DE SUMAS Y SALDOS (sin ajustes) --------------------

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

// 🔹 RENDER: BALANCE GENERAL (reutilizado, sin y con ajustes) -----------

function renderBalanceGeneralEn(suffix, general) {
  const activoList = document.getElementById("activoList" + suffix);
  const pasivoList = document.getElementById("pasivoList" + suffix);
  const patrimonioList = document.getElementById("patrimonioList" + suffix);

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

  document.getElementById("totalActivo" + suffix).textContent =
    format(general.totalActivo);

  document.getElementById("totalPasivo" + suffix).textContent =
    format(general.totalPasivo);

  document.getElementById("totalPatrimonio" + suffix).textContent =
    format(general.totalPatrimonio);
}

// 🔹 RENDER: HOJA DE TRABAJO / PREBALANCE --------------------------------

function renderHojaTrabajo(hoja) {
  const tbody = document.getElementById("hojaTrabajoBody");
  const tfoot = document.getElementById("hojaTrabajoFoot");

  tbody.innerHTML = "";
  tfoot.innerHTML = "";

  // Ahora permite números negativos (para las regularizadoras) y solo oculta si es 0
  const celda = v => (typeof v === "number" && v !== 0) ? format(v) : "—";

  if (hoja.filas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="13">No hay cuentas para mostrar todavía.</td></tr>`;
    return;
  }

  hoja.filas.forEach(f => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="cuenta-nombre">${f.cuenta}</td>
      <td>${celda(f.sumasDebe)}</td>
      <td>${celda(f.sumasHaber)}</td>
      <td>${celda(f.saldoDeudor)}</td>
      <td>${celda(f.saldoAcreedor)}</td>
      <td>${celda(f.ajusteDebe)}</td>
      <td>${celda(f.ajusteHaber)}</td>
      <td>${celda(f.sdoAjustDeudor)}</td>
      <td>${celda(f.sdoAjustAcreedor)}</td>
      <td>${celda(f.activo)}</td>
      <td>${celda(f.pasivoPN)}</td>
      <td>${celda(f.rn)}</td>
      <td>${celda(f.rp)}</td>
    `;

    tbody.appendChild(tr);
  });

  const s = hoja.subtotales;

  const filaSubtotales = document.createElement("tr");
  filaSubtotales.classList.add("fila-subtotal");
  filaSubtotales.innerHTML = `
    <th>Subtotales</th>
    <th>${format(s.sumasDebe)}</th>
    <th>${format(s.sumasHaber)}</th>
    <th>${format(s.saldosDeudor)}</th>
    <th>${format(s.saldosAcreedor)}</th>
    <th>${format(s.ajustesDebe)}</th>
    <th>${format(s.ajustesHaber)}</th>
    <th>${format(s.sdoAjustDeudor)}</th>
    <th>${format(s.sdoAjustAcreedor)}</th>
    <th>${format(s.activo)}</th>
    <th>${format(s.pasivoPN)}</th>
    <th>${format(s.rn)}</th>
    <th>${format(s.rp)}</th>
  `;
  tfoot.appendChild(filaSubtotales);

  if (hoja.resultadoFila) {
    const rf = hoja.resultadoFila;

    const filaResultado = document.createElement("tr");
    filaResultado.classList.add("fila-resultado");
    filaResultado.innerHTML = `
      <th>Res. del Ejercicio</th>
      <th>—</th><th>—</th><th>—</th><th>—</th><th>—</th><th>—</th><th>—</th><th>—</th>
      <th>—</th>
      <th>${rf.pasivoPN ? format(rf.pasivoPN) : "—"}</th>
      <th>${rf.rn ? format(rf.rn) : "—"}</th>
      <th>${rf.rp ? format(rf.rp) : "—"}</th>
    `;
    tfoot.appendChild(filaResultado);
  }

  const t = hoja.totales;

  const filaTotales = document.createElement("tr");
  filaTotales.classList.add("fila-total");
  filaTotales.innerHTML = `
    <th>Totales</th>
    <th>${format(t.sumasDebe)}</th>
    <th>${format(t.sumasHaber)}</th>
    <th>${format(t.saldosDeudor)}</th>
    <th>${format(t.saldosAcreedor)}</th>
    <th>${format(t.ajustesDebe)}</th>
    <th>${format(t.ajustesHaber)}</th>
    <th>${format(t.sdoAjustDeudor)}</th>
    <th>${format(t.sdoAjustAcreedor)}</th>
    <th>${format(t.activo)}</th>
    <th>${format(t.pasivoPN)}</th>
    <th>${format(t.rn)}</th>
    <th>${format(t.rp)}</th>
  `;
  tfoot.appendChild(filaTotales);
}

// 🔹 MODAL DE AYUDA ------------------------------------------------------

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
