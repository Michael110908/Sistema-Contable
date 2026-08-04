import { generarMayor, calcularSaldo } from "./logic/mayor.js";
import { generarBalance } from "./logic/balance.js";
import { generarBalanceGeneral } from "./logic/general.js";
import { setupAutocomplete } from "./autocomplete.js";
import { calcularResultado } from "./logic/resultado.js";
import { format } from "./utils.js";

const STORAGE_KEY = "sic.asientos.v1";
const asientos = [];
let cuentas = {};

const asientoEjemplo = [
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

fetch("./cuentas.json")
  .then(res => res.json())
  .then(data => {
    cuentas = data;
    asientos.push(...cargarAsientosGuardados());
    limpiarFormulario();
    renderAsientos();
    procesarTodo();
  })
  .catch(() => {
    mostrarError("No se pudo cargar el plan de cuentas. Ejecuta la app desde un servidor local o desde un despliegue web.");
  });

function agregarLinea() {
  const tr = document.createElement("tr");

  const tdCuenta = document.createElement("td");
  const inputCuenta = document.createElement("input");
  inputCuenta.type = "text";
  inputCuenta.autocomplete = "off";

  setupAutocomplete(inputCuenta, cuentas);
  tdCuenta.appendChild(inputCuenta);

  const tdDebe = document.createElement("td");
  const inputDebe = document.createElement("input");
  inputDebe.type = "number";
  inputDebe.step = "0.01";
  inputDebe.min = "0";
  tdDebe.appendChild(inputDebe);

  const tdHaber = document.createElement("td");
  const inputHaber = document.createElement("input");
  inputHaber.type = "number";
  inputHaber.step = "0.01";
  inputHaber.min = "0";
  tdHaber.appendChild(inputHaber);

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
      mostrarError(`Cuenta invalida en fila ${i + 1}`);
      hayError = true;
      return;
    }

    if (debe < 0 || haber < 0) {
      mostrarError(`Fila ${i + 1} tiene un monto negativo`);
      hayError = true;
      return;
    }

    if (debe > 0 && haber > 0) {
      mostrarError(`Fila ${i + 1} tiene debe y haber`);
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
    mostrarError("Debe y Haber no coinciden");
    return;
  }

  if (totalDebe === 0) {
    mostrarError("Asiento vacio");
    return;
  }

  mostrarError("");
  asientos.push(asiento);
  guardarAsientos();
  renderAsientos();
  limpiarFormulario();
  procesarTodo();
});

document.getElementById("procesarTodo").addEventListener("click", procesarTodo);

document.getElementById("cargarEjemplo").addEventListener("click", () => {
  asientos.splice(0, asientos.length, ...JSON.parse(JSON.stringify(asientoEjemplo)));
  guardarAsientos();
  renderAsientos();
  limpiarFormulario();
  procesarTodo();
  mostrarError("");
});

document.getElementById("borrarAsientos").addEventListener("click", () => {
  asientos.splice(0, asientos.length);
  guardarAsientos();
  renderAsientos();
  limpiarFormulario();
  limpiarResultados();
  mostrarError("");
});

function limpiarFormulario() {
  const body = document.getElementById("asientoBody");
  body.innerHTML = "";
  agregarLinea();
}

function renderAsientos() {
  const container = document.getElementById("listaAsientos");
  container.innerHTML = "";

  if (asientos.length === 0) {
    const empty = document.createElement("p");
    empty.classList.add("empty-state");
    empty.textContent = "Todavia no hay asientos guardados.";
    container.appendChild(empty);
    return;
  }

  asientos.forEach((asiento, index) => {
    const div = document.createElement("div");
    div.classList.add("asiento-card");

    const title = document.createElement("strong");
    title.textContent = `Asiento ${index + 1}`;
    div.appendChild(title);

    div.appendChild(renderGrupoAsiento("Debe", asiento.debe));
    div.appendChild(renderGrupoAsiento("Haber", asiento.haber));

    container.appendChild(div);
  });
}

function renderGrupoAsiento(titulo, items) {
  const wrapper = document.createElement("div");
  const heading = document.createElement("p");
  heading.classList.add("asiento-subtitle");
  heading.textContent = titulo;
  wrapper.appendChild(heading);

  items.forEach(item => {
    const line = document.createElement("p");
    line.textContent = `${item.cuenta}: $${format(item.monto)}`;
    wrapper.appendChild(line);
  });

  return wrapper;
}

function procesarTodo() {
  if (asientos.length === 0 || Object.keys(cuentas).length === 0) return;

  const mayor = generarMayor(asientos);
  renderMayor(mayor);

  const balance = generarBalance(mayor, calcularSaldo);
  renderBalance(balance);

  const resultado = calcularResultado(balance, cuentas);
  renderResultadoVisual(resultado);

  const general = generarBalanceGeneral(balance, cuentas, resultado);
  renderBalanceGeneral(general);
}

function renderMayor(mayor) {
  const container = document.getElementById("mayorContainer");
  container.innerHTML = "";

  for (const cuenta in mayor) {
    const { debe, haber } = mayor[cuenta];
    const { totalDebe, totalHaber, saldo, tipoSaldo } =
      calcularSaldo(cuenta, debe, haber);

    const div = document.createElement("div");
    div.classList.add("mayor-box");

    div.appendChild(crearElemento("div", "mayor-title", cuenta));

    const tBox = crearElemento("div", "t-box");
    const tHeader = crearElemento("div", "t-header");
    tHeader.appendChild(crearElemento("span", "", "Debe"));
    tHeader.appendChild(crearElemento("span", "", "Haber"));
    tBox.appendChild(tHeader);

    const tBody = crearElemento("div", "t-body");
    const debeCol = crearElemento("div", "col debe");
    debe.forEach(monto => debeCol.appendChild(crearElemento("div", "linea", format(monto))));

    const haberCol = crearElemento("div", "col haber");
    haber.forEach(monto => haberCol.appendChild(crearElemento("div", "linea", format(monto))));

    tBody.appendChild(debeCol);
    tBody.appendChild(haberCol);
    tBox.appendChild(tBody);
    div.appendChild(tBox);

    div.appendChild(crearElemento("div", "mayor-totals", `${format(totalDebe)} | ${format(totalHaber)}`));
    div.appendChild(crearElemento(
      "div",
      "saldo",
      saldo === 0 ? "Sin saldo" : `Saldo ${tipoSaldo}: ${format(saldo)}`
    ));

    container.appendChild(div);
  }
}

function renderBalance(balance) {
  const tbody = document.getElementById("balanceBody");
  tbody.innerHTML = "";

  balance.cuentas.forEach(item => {
    const tr = document.createElement("tr");
    [
      item.cuenta,
      format(item.debe),
      format(item.haber),
      format(item.saldoDeudor),
      format(item.saldoAcreedor)
    ].forEach(value => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });

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

  general.activo.forEach(item => activoList.appendChild(renderItemBalance(item)));
  general.pasivo.forEach(item => pasivoList.appendChild(renderItemBalance(item)));
  general.patrimonio.forEach(item => patrimonioList.appendChild(renderItemBalance(item)));

  document.getElementById("totalActivo").textContent =
    format(general.totalActivo);

  document.getElementById("totalPasivo").textContent =
    format(general.totalPasivo);

  document.getElementById("totalPatrimonio").textContent =
    format(general.totalPatrimonio);
}

function renderItemBalance(item) {
  const li = document.createElement("li");
  li.textContent = `${item.nombre}: ${format(item.monto)}`;
  return li;
}

function limpiarResultados() {
  document.getElementById("mayorContainer").innerHTML = "";
  document.getElementById("balanceBody").innerHTML = "";
  document.getElementById("resultadoFinal").textContent = "";
  document.getElementById("activoList").innerHTML = "";
  document.getElementById("pasivoList").innerHTML = "";
  document.getElementById("patrimonioList").innerHTML = "";
  ["totalDebe", "totalHaber", "totalSaldoDeudor", "totalSaldoAcreedor", "totalActivo", "totalPasivo", "totalPatrimonio"]
    .forEach(id => {
      document.getElementById(id).textContent = "";
    });
}

function cargarAsientosGuardados() {
  try {
    const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(guardados)) return [];
    return guardados.filter(esAsientoValido);
  } catch {
    return [];
  }
}

function guardarAsientos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(asientos));
}

function esAsientoValido(asiento) {
  return asiento
    && Array.isArray(asiento.debe)
    && Array.isArray(asiento.haber)
    && asiento.debe.every(esMovimientoValido)
    && asiento.haber.every(esMovimientoValido);
}

function esMovimientoValido(item) {
  return item
    && typeof item.cuenta === "string"
    && typeof item.monto === "number"
    && Number.isFinite(item.monto)
    && item.monto > 0;
}

function mostrarError(mensaje) {
  document.getElementById("error").textContent = mensaje;
}

function crearElemento(tag, className = "", text = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

const modal = document.getElementById("modal");
const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");

openBtn.addEventListener("click", () => {
  modal.style.display = "block";
  modal.setAttribute("aria-hidden", "false");
});

closeBtn.addEventListener("click", cerrarModal);

window.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModal();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarModal();
});

function cerrarModal() {
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
}
