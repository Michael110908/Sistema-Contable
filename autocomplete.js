export function setupAutocomplete(input, cuentas) {
  let container;

  input.addEventListener("input", () => {
    const value = input.value.toLowerCase();

    if (container) container.remove();
    if (!value) return;

    container = document.createElement("div");
    container.classList.add("autocomplete-list");

    // Ya no necesitamos calcular left, top o width con JS
    // porque el CSS se encargará de posicionarlo respecto al TD

    Object.keys(cuentas)
      .filter(c => c.toLowerCase().includes(value))
      .forEach(cuenta => {
        const item = document.createElement("div");
        item.textContent = cuenta;
        item.classList.add("autocomplete-item");

        item.onclick = () => {
          input.value = cuenta;
          container.remove();
        };

        container.appendChild(item);
      });

    // LA MAGIA ESTÁ ACÁ: Inyectamos el container en el padre del input (el TD)
    // en lugar de document.body
    input.parentNode.appendChild(container);
  });

  document.addEventListener("click", (e) => {
    // Solo cerramos si hacemos clic fuera del input
    if (container && e.target !== input) {
      container.remove();
    }
  });
}