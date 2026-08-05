# 📊 Sistema Contable Web

Aplicación web desarrollada en **JavaScript Vanilla** para la gestión y generación automática de información contable a partir de asientos manuales.

## 🚀 Funcionalidades

* Carga del **Libro Diario** con autocompletado de cuentas.
* Generación automática de **Libro Mayor**, **Balance de Sumas y Saldos**, **Resultado del Ejercicio** y **Balance General**.
* **Edición y eliminación** de asientos ya cargados.
* **Persistencia en el navegador** (`localStorage`): los asientos y ajustes no se pierden al recargar la página.

### 🔧 Asientos de Ajuste (rama `feature/ajustes`)

* Carga de **Asientos de Ajuste** independientes del Libro Diario, con edición y eliminación, también persistidos.
* **Libro Mayor de Ajustes**: cuentas en "T" mostrando únicamente los movimientos de los ajustes.
* **Hoja de Trabajo / Prebalance**: planilla de 12 columnas (Sumas, Saldos, Ajustes, Saldos Ajustados, Estado Patrimonial, Estado de Resultados) que combina el Balance de Sumas y Saldos original con los asientos de ajuste.
  * `R.N.` = Resultado Negativo (costos y gastos).
  * `R.P.` = Resultado Positivo (ingresos).
* **Balance General con Ajustes**: calculado a partir de los Saldos Ajustados de la Hoja de Trabajo.

## 📁 Estructura del Proyecto

```
📦 proyecto
 ┣ 📂 logic
 ┃ ┣ 📄 mayor.js
 ┃ ┣ 📄 balance.js
 ┃ ┣ 📄 general.js
 ┃ ┣ 📄 generalAjustado.js
 ┃ ┣ 📄 resultado.js
 ┃ ┣ 📄 hojaTrabajo.js
 ┃ ┗ 📄 storage.js
 ┣ 📄 main.js
 ┣ 📄 autocomplete.js
 ┣ 📄 utils.js
 ┣ 📄 cuentas.json
 ┣ 📄 index.html
 ┗ 📄 style.css
```
