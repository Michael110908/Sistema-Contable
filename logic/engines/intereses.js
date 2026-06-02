export function calcularInteresTiempo({
  capital,
  tasa,
  tiempo,
  unidadTiempo = 360
}) {

  return (
    (capital * tasa * tiempo) /
    (100 * unidadTiempo)
  );
}