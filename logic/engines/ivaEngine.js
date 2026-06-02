export function calcularIVA(
  monto,
  porcentaje = 21
) {
  return monto * (porcentaje / 100);
}

export function calcularIVAIncluido(
  total,
  porcentaje = 21
) {
  return total - (
    total / (1 + porcentaje / 100)
  );
}