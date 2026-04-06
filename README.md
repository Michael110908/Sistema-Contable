# 📊 Sistema Contable Web

Aplicación web desarrollada en **JavaScript Vanilla** para la gestión y generación automática de información contable a partir de asientos manuales.

---

## 🚀 Descripción

Este proyecto permite cargar asientos contables y generar automáticamente:

* 📘 Libro Mayor (formato en T)
* 📊 Balance de Sumas y Saldos
* 📈 Estado de Resultados
* 🏦 Balance General

Está diseñado como una herramienta educativa y práctica para estudiantes de contabilidad y sistemas.

---

## 🎯 Objetivos del Proyecto

* Facilitar la comprensión de los procesos contables
* Automatizar cálculos repetitivos
* Reducir errores humanos en balances
* Servir como base para un sistema contable más avanzado

---

## 🧱 Tecnologías Utilizadas

* HTML5
* CSS3 (responsive, sin frameworks)
* JavaScript (ES Modules)
* JSON (gestión de cuentas)

---

## ⚙️ Funcionalidades

### ➕ Carga de Asientos

* Ingreso manual de cuentas
* Autocompletado dinámico desde `cuentas.json`
* Soporte para múltiples líneas por asiento

### ✅ Validaciones

* Igualdad entre Debe y Haber
* Verificación de cuentas existentes
* Prevención de doble imputación en una misma línea
* Manejo de decimales con precisión

### 📘 Libro Mayor

* Representación en formato de "T"
* Separación clara entre Debe y Haber
* Cálculo automático de saldos
* Identificación de saldo deudor/acreededor

### 📊 Balance de Sumas y Saldos

* Consolidación de movimientos por cuenta
* Totales generales
* Saldo deudor y acreedor por cuenta

### 📈 Estado de Resultados

* Clasificación automática:

  * Ingresos
  * Costos
  * Gastos
* Cálculo del resultado del ejercicio

### 🏦 Balance General

* Clasificación de cuentas:

  * Activo
  * Pasivo
  * Patrimonio Neto
* Soporte para cuentas dinámicas (ej: IVA)
* Integración del resultado del ejercicio

### 🧠 Sistema Inteligente de Cuentas

* Configuración externa mediante `cuentas.json`
* Soporte para:

  * tipo (activo, pasivo, patrimonio, resultado, dinámica)
  * subtipo (ingreso, costo, gasto)
  * naturaleza (deudora, acreedora, mixta)

---

## 📁 Estructura del Proyecto

```
📦 proyecto
 ┣ 📂 logic
 ┃ ┣ 📄 mayor.js
 ┃ ┣ 📄 balance.js
 ┃ ┣ 📄 general.js
 ┃ ┗ 📄 resultado.js
 ┣ 📄 main.js
 ┣ 📄 autocomplete.js
 ┣ 📄 utils.js
 ┣ 📄 cuentas.json
 ┣ 📄 index.html
 ┗ 📄 styles.css
```

---

## 📌 Uso de la Aplicación

### 1. Cargar un asiento

* Ingresar la cuenta (usar autocompletado)
* Completar Debe o Haber

### 2. Agregar líneas

* Utilizar el botón **"+ Línea"**

### 3. Guardar asiento

* El Debe debe ser igual al Haber

### 4. Generar resultados

* Presionar **"Generar Libros y Balances"**

---

## ⚠️ Consideraciones Importantes

### 💰 Formato de números

* Usar punto (.) para decimales → `1500.50`
* No usar coma (,)

### 🧾 Filas vacías

* Se ignoran automáticamente

### ❌ Errores comunes

* Cuenta inexistente
* Debe ≠ Haber
* Valores en ambas columnas (Debe y Haber)

---

## 🔄 Persistencia de Datos

Actualmente:

* Los datos se almacenan en memoria

Recomendado:

* Implementar `localStorage` para persistencia

---

## 🌐 Despliegue

Aplicación 100% frontend, puede ser desplegada en:

* Netlify
* Vercel
* GitHub Pages

---

## 🧪 Estado del Proyecto

✔ Versión funcional (v1)
✔ Estable para uso educativo
⚠️ No apto para uso profesional real (aún)

---

## 🔮 Mejoras Futuras

* Persistencia con base de datos
* Exportación a PDF
* Soporte multiempresa
* Control de períodos contables
* Generación automática de asientos
* Modo oscuro
* Validaciones contables avanzadas

---

## 🧠 Conceptos Contables Implementados

* Partida doble
* Naturaleza de cuentas
* Saldos deudores y acreedores
* Resultado del ejercicio
* Ecuación patrimonial

---

## 👨‍💻 Autor

Proyecto desarrollado como práctica integradora de:

* Programación web
* Lógica contable
* Diseño de sistemas

---

## 📜 Licencia

Uso libre con fines educativos.
