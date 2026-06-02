export function crearAsiento() {
  return {
    debe: [],
    haber: []
  };
}

export function agregarDebe(
  asiento,
  cuenta,
  monto
) {

  asiento.debe.push({
    cuenta,
    monto
  });
}

export function agregarHaber(
  asiento,
  cuenta,
  monto
) {

  asiento.haber.push({
    cuenta,
    monto
  });
}

export function totalDebe(asiento) {

  return asiento.debe.reduce(
    (acc, item) =>
      acc + item.monto,
    0
  );
}

export function totalHaber(asiento) {

  return asiento.haber.reduce(
    (acc, item) =>
      acc + item.monto,
    0
  );
}

export function asientoBalanceado(
  asiento
) {

  const EPSILON = 0.01;

  return Math.abs(
    totalDebe(asiento)
    - totalHaber(asiento)
  ) < EPSILON;
}