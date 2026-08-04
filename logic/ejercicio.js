/**
 * Modelo de datos para un ejercicio contable con ajustes.
 *
 * Este módulo no modifica el flujo actual de la aplicación.
 * Su función es separar los asientos originales de los asientos
 * de ajuste y proporcionar una única fuente de datos para las
 * etapas posteriores del ejercicio.
 */

/**
 * Crea un ejercicio vacío.
 */
export function crearEjercicio() {
  return {
    asientos: [],
    ajustes: []
  };
}

/**
 * Agrega un asiento principal al ejercicio.
 */
export function agregarAsiento(ejercicio, asiento) {
  if (!ejercicio || !Array.isArray(ejercicio.asientos)) {
    throw new Error("Ejercicio inválido");
  }

  ejercicio.asientos.push(asiento);
  return ejercicio;
}

/**
 * Agrega un asiento de ajuste al ejercicio.
 *
 * Los ajustes tienen la misma estructura que los asientos
 * normales. La diferencia está en la etapa del ejercicio.
 */
export function agregarAjuste(ejercicio, ajuste) {
  if (!ejercicio || !Array.isArray(ejercicio.ajustes)) {
    throw new Error("Ejercicio inválido");
  }

  ejercicio.ajustes.push(ajuste);
  return ejercicio;
}

/**
 * Devuelve todos los asientos que deben utilizarse
 * después de incorporar los ajustes.
 *
 * No modifica los arrays originales.
 */
export function obtenerAsientosAjustados(ejercicio) {
  if (!ejercicio) {
    throw new Error("Ejercicio inválido");
  }

  return [
    ...(ejercicio.asientos || []),
    ...(ejercicio.ajustes || [])
  ];
}