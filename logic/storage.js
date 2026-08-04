// 💾 PERSISTENCIA EN localStorage
// Guarda y recupera los asientos del Libro Diario y los Asientos de Ajuste
// para que no se pierdan al recargar la página.

const KEY_ASIENTOS = "contable_asientos";
const KEY_AJUSTES = "contable_ajustes";

function leer(key) {
  try {
    const data = localStorage.getItem(key);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn(`No se pudo leer "${key}" de localStorage`, e);
    return [];
  }
}

function escribir(key, valor) {
  try {
    localStorage.setItem(key, JSON.stringify(valor));
  } catch (e) {
    console.warn(`No se pudo guardar "${key}" en localStorage`, e);
  }
}

export function cargarAsientos() {
  return leer(KEY_ASIENTOS);
}

export function guardarAsientos(asientos) {
  escribir(KEY_ASIENTOS, asientos);
}

export function cargarAjustes() {
  return leer(KEY_AJUSTES);
}

export function guardarAjustes(ajustes) {
  escribir(KEY_AJUSTES, ajustes);
}
