# Sistema Contable Web

Aplicacion web educativa desarrollada con HTML, CSS y JavaScript vanilla para cargar asientos contables y generar informacion basica de cierre.

## Funcionalidades

- Carga manual de asientos contables.
- Autocompletado de cuentas desde `cuentas.json`.
- Validacion de Debe y Haber.
- Libro Mayor en formato T.
- Balance de Sumas y Saldos.
- Resultado del Ejercicio.
- Balance General.
- Persistencia local de asientos con `localStorage`.
- Datos de ejemplo para probar el flujo completo.

## Estructura

```text
.
├── index.html
├── style.css
├── main.js
├── autocomplete.js
├── utils.js
├── cuentas.json
├── logic
│   ├── mayor.js
│   ├── balance.js
│   ├── resultado.js
│   └── general.js
├── tests
│   └── contabilidad.test.js
├── package.json
├── netlify.toml
└── vercel.json
```

## Uso local

La aplicacion usa modulos JavaScript y carga `cuentas.json` con `fetch`, por lo que conviene ejecutarla desde un servidor local.

```bash
npm start
```

Luego abrir:

```text
http://localhost:8080
```

## Pruebas

```bash
npm test
```

Las pruebas verifican el flujo principal de calculo: Libro Mayor, Balance de Sumas y Saldos, Resultado del Ejercicio y Balance General.

## Despliegue

El proyecto es estatico y puede publicarse en GitHub Pages, Netlify o Vercel.

- Netlify usa `netlify.toml`.
- Vercel usa `vercel.json`.
- GitHub Pages puede publicar directamente desde la raiz del repositorio.

## Estado

Version funcional para uso educativo. No reemplaza un sistema contable profesional ni contempla todavia periodos, multiempresa, auditoria, exportacion formal o permisos de usuarios.
