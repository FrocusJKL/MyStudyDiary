# Tareas — 001-heat-map

Descomposición de `plan.md` (§9). Cada tarea termina con `node --test` en verde
(constitución nº 4). Se marca ✅ al completar; prohibido empezar la siguiente con
tests en rojo.

## T1 — Fechas locales puras ✅

- Crear `logic-dates.js`: `localDateFromIso`, `isoFromLocalDate`, `shiftDaysIso`,
  `startOfWeekMondayIso` (inglesas, puras, con el "puente" Node/navegador, D2).
- Crear `tests/heatmap.test.js` con los tests de fechas (caso 11 del plan).
- Cobertura: RF-1.2, RF-1.3, RF-1.4 (fechas locales, DST, lunes de la semana),
  borde del RF-7.2.
- Estado: ✅ hecha — 6/6 tests en verde con `node --test`
  (`lunes` de la semana de hoy: `startOfWeekMondayIso("2026-10-24") = "2026-10-19"`,
  borde de ventana del RF-7.2 también latente en T2).

## T2 — Lógica del mapa ✅

- Crear `logic-heatmap.js`: `heatMapWindowIso`, `sumMinutesPerDay`,
  `maxDailyMinutes`, `heatMapLevel`, `buildHeatMap` (puras, inglés).
- Ampliar `tests/heatmap.test.js` con los casos 1–10 del plan.
- Cobertura: RF-1.1, RF-2.1–RF-2.4, RF-3.2, RF-6.2, RF-7.1–RF-7.3.
- Estado: ✅ hecha — 12 tests nuevos, 18/18 en verde con `node --test`.

## T3 — Delegación de fechas ✅

- `app.js`: `fechaLocalISO`, `textoAFecha`, `diaAnterior` delegan en `logic-dates.js`
  (mismo nombre y comportamiento). `index.html`: cargar `logic-dates.js` antes de
  `app.js`.
- Cobertura: reutilización (skill `local-dates`); sin cambio de comportamiento
  (RF-6.3, criterio "métricas previas intactas").
- Estado: ✅ hecha — 18/18 con `node --test` y regresión del arnés (rachas, semana,
  mes, lista) sin cambios de comportamiento.

## T4 — Interfaz del mapa ✅

- `index.html`: sección del mapa + leyenda al pie; `app.js`: `mostrarMapa()` llamada
  al arrancar y al guardar; `styles.css`: rejilla, `level-0`…`level-4`, leyenda.
- Verificación con ChromeDevTools (móvil 375 px, tooltips, consola limpia).
- Cobertura: RF-3.1, RF-4.1–RF-4.3, RF-5.1–RF-5.2, RF-6.1, RNF-1, RNF-2.
- Estado: ✅ hecha — verificado en Chrome (contexto aislado): 84 casillas, 3 tooltips
  con formato unificado, niveles 4/4/3 (60/45/30 min, M=60), refresco inmediato,
  0 mensajes de consola, recarga íntegra, captura 375 px sin scroll
  (`C:\Users\PC\AppData\Local\Temp\opencode\diario-mapa-movil.png`).

## T5 — Documentación ✅

- `MEMORY.md` v1.4 + decisiones; nota de deuda: idioma de `app.js` (constitución nº 6).
- Estado: ✅ hecha — REGISTRY y AGENTS.md actualizados (stack con `logic-*.js` + tests,
  verificación con `node --test` + ChromeDevTools).
