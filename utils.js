export function redondear(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function format(num) {
    return redondear(num).toFixed(2);
}
