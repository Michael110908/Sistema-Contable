export function setupAutocomplete(input, cuentas) {
  let container;

  input.addEventListener("input", () => {
    const value = input.value.toLowerCase();

    if (container) container.remove();

    if (!value) return;

    container = document.createElement("div");
    container.classList.add("autocomplete-list");

    const rect = input.getBoundingClientRect();

    container.style.left = rect.left + "px";
    container.style.top = rect.bottom + "px";
    container.style.width = rect.width + "px";

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

    document.body.appendChild(container);
  });

  document.addEventListener("click", () => {
    if (container) container.remove();
  });
}
