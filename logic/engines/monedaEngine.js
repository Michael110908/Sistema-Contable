export function convertirUSD(
  dolares,
  cotizacion
) {
  return dolares * cotizacion;
}

export function calcularDiferenciaCambio(
  valorAnterior,
  valorNuevo
) {
  return valorNuevo - valorAnterior;
}