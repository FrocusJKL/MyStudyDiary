# Plan técnico — Mapa de calor de estudio (001-heat-map)

Estado: plan de implementación de `specs/001-heat-map/spec.md` v1.1
Cumple la constitución: sin dependencias ni build (nº 1), decisionable línea a línea
(nº 2), lógica pura separada (nº 3), `node --test` como puerta (nº 4), datos intactos y
fechas locales (nº 5), código en inglés / interfaz en español (nº 6).

## 1. Panorama

La lógica del mapa es un cálculo sobre los datos ya guardados (nada se persiste, RF-2.2
y RF-6.3). El flujo completo:

1. Al cargar la página y tras guardar una sesión, la interfaz llama a la función de
   render del mapa con las sesiones actuales y la fecha local de hoy (RF-6.1, RF-6.3).
2. Las **funciones puras** calculan la ventana de 12 semanas, el total de minutos por
   día, el máximo diario y el nivel 0–4 de cada casilla (RF-1, RF-2, RF-3, RF-7).
3. El render convierte ese cálculo en una rejilla DOM con tooltip nativo (RF-4) y una
   leyenda fija (RF-5); el CSS se encarga de tamaños y colores.

El único acceso a datos y DOM ocurre en la capa de interfaz; las funciones puras
reciben `today` como parámetro (RNF-4, constitución nº 3).

## 2. Archivos: crear / modificar

| Acción | Archivo | Responsabilidad | RF que cubre |
|---|---|---|---|
| Crear | `logic-dates.js` | Funciones puras de calendario local, en inglés: convertir `todayIso`→`Date` local (a mediodía, por DST), `Date`→`iso`, restar días con `setDate` (nunca milisegundos), lunes de la semana de una fecha. Exportadas para navegador clásico y Node (ver decisión D2). | RF-1.2, RF-1.3, RF-1.4; borde inferior de RF-7.2 |
| Crear | `logic-heatmap.js` | Funciones puras del mapa en inglés: suma por día, máximo diario, nivel 0–4, construcción de la rejilla de 84 casillas. Sin DOM ni almacenamiento. | RF-2.1–RF-2.4, RF-3.2, RF-7.2, RF-7.3 |
| Crear | `tests/heatmap.test.js` | Suite `node --test` (node:test, cero paquetes): ventana y bordes, totales, máximo, tramos de nivel, futuras, fuera de rango, todo-al-máximo, DST. | RF-1.1–RF-1.4, RF-2.1–RF-2.4, RF-3.2, RF-6.2, RF-7.1–RF-7.3 |
| Modificar | `index.html` | Nueva `section.card` del mapa **entre la tarjeta de resumen (rachas) y "Nueva sesión"**: título, contenedor de la rejilla (12 columnas × 7 días, vacía inicialmente), fila de leyenda al pie; carga de scripts en orden fecha → mapa → app. | RF-5.1 (estructura), RF-6.3 (reconstrucción al cargar) |
| Modificar | `app.js` | Pegamento mínimo: nueva función `mostrarMapa()` que toma `sesiones` + `fechaLocalISO()` e invoca la lógica pura y pinta casillas + tooltips + leyenda; llamada en el arranque y dentro del `submit`, en el mismo refresco que `mostrarSesiones()` (RF-6.1). Los tres helpers de fecha existentes pasan a delegar en `logic-dates.js` (cuerpo de una línea, comportamiento idéntico). | RF-4.1–RF-4.3, RF-6.1, RF-6.3 |
| Modificar | `styles.css` | Clases de la rejilla (columnas flexibles, casillas cuadradas), 5 clases de nivel (`level-0`…`level-4`) con la rampa naranja sobre el papel del diseño "cuaderno", leyenda de 5 muestras + textos "menos"/"más", tamaño de casilla con variable CSS que cabe en 375 px. | RF-3.1, RF-5.1, RF-5.2, RNF-1, RNF-2 |
| Modificar | `AGENTS.md` / `MEMORY.md` | Al terminar: estado v1.4 en MEMORY y decisiones (nuevos archivos credados, delegación de fechas, código nuevo en inglés). | — |

Los archivos nuevos exigen aprobación previa (AGENTS.md): aprobar este plan la incluye.

## 3. Decisiones técnicas (y alternativa descartada)

- **D1 — Lógica en archivos propios (`logic-*.js`), no dentro de `app.js`**
  Constitución nº 3 (funciones puras) + nº 4 (`node --test`): los tests deben cargar la
  lógica sin DOM, y `app.js` ejecuta `document.getElementById` al arrancar, así que no
  puede cargarse en Node.
  *Descartada*: meter la lógica en `app.js` (obligaría a refactorizar todo el arranque
  o saltarse los tests, contradiciendo la constitución).
- **D2 — Scripts clásicos con "puente" para Node**: los archivos de lógica son IIFE
  clásicas que cuelgan de un objeto global del navegador y, si `module` existe, se
  exportan con `module.exports`. Sin `type="module"`.
  *Descartada*: módulos ESM — `file://` los bloquea por CORS
  e invalidaría el doble clic (constitución nº 1).
- **D3 — Rejilla DOM (divs/flex) para pintar** el mapa: columnas flex, casillas
  cuadradas con clase por nivel.
  *Descartadas*: Canvas/SVG (más código, menos accesible, tooltip nativo más difícil y
  el CSS responsive del RNF-1 gratis con divs).
- **D4 — Niveles como clases CSS fijas** (`level-0`…`level-4`) con la rampa naranja
  prevista: colores idénticos siempre (RF-5.2, leyenda estable) y verificables.
  *Descartada*: opacidad/filtros derivados del máximo (los colores "flotarían" y la
  leyenda no sería fija).
- **D5 — Código nuevo en inglés (constitución nº 6)**: identificadores y comentarios
  de `logic-*.js` y `tests/` en inglés; los textos de la interfaz (tooltip, leyenda)
  siguen en español y viven en la capa de interfaz.
  *Descartada*: seguir el estilo español de `app.js` — contradiría la constitución,
  que manda; mantener nota posterior para refactor de idioma de `app.js` fuera de
  alcance (deuda declarada, sin cambio de comportamiento esta iteración).
- **D6 — Delegación de fechas**: `logic-dates.js` pasa a ser la única fuente de
  conversión/resta de fechas; los helpers de `app.js` delegan en ella (misma firma).
  *Descartada*: duplicar los helpers dentro de `logic-heatmap.js` — dos fuentes de
  verdad de fecha = deriva futura; la skill `local-dates` pide reutilizar.
- **D7 — El máximo diario y el nivel se calculan por guardado y a la carga**, nunca
  guardados (RF-2.2, RF-6.3, decisiones Ya registradas). *Ninguna* alternativa posible
  en spec; se mantiene.
- **D8 — Ubicación del mapa**: tarjeta propia tras el resumen de rachas (zona de
  métricas) y antes del formulario; leyenda al pie de esa misma tarjeta (cierre de
  duda 1). *Descartada*: dentro de la tarjeta de rachas (la taparía al crecer el
  historial) o tras la lista (el mapa es motivación, no histórico de detalle).

## 4. Funciones puras de la lógica (con `today` como parámetro)

En `logic-dates.js` (nombres en inglés):

- `localDateFromIso(iso)` → `Date` local a las 12:00 (RF-1.4; DST-safe).
- `isoFromLocalDate(date)` → `"YYYY-MM-DD"` local (RF-1.4).
- `shiftDaysIso(iso, days)` → `iso` con `setDate(+days)` (RF-7.2; regla de
  `local-dates`: nunca milisegundos).
- `startOfWeekMondayIso(iso)` → lunes de esa semana (RF-1.2, RF-1.3).

En `logic-heatmap.js`:

- `heatMapWindowIso(todayIso, weeks = 12)` → `{ firstDay, currentMonday }`: el lunes
  de la semana de `todayIso` y el lunes 11 semanas atrás (RF-1; borde inclusivo del
  RF-7.2).
- `sumMinutesPerDay(sessions)` → `Map<iso, total>` suma todas las sesiones por día,
  sin filtrar todavía (RF-4.3 acumula).
- `maxDailyMinutes(totals, firstDayIso, todayIso)` → máximo M entre los días con
  `firstDay ≤ fecha ≤ today`, **excluyendo futuras** y fuera de ventana (RF-7.2,
  RF-7.3); 0 si no hay.
- `heatMapLevel(total, max)` → 0–4 por la convención entera de la spec: `T=0 → 0`;
  `4T < M → 1`; `M ≤ 4T < 2M → 2`; `2M ≤ 4T < 3M → 3`; `4T ≥ 3M → 4` (RF-2.1;
  bordes: 25/50/75 % al nivel superior; si `M = 0`, todo nivel 0 — RF-3.2).
- `buildHeatMap(sessions, todayIso, weeks = 12)` → objeto puro
  `{ cells, max }` con 84 casillas ordenadas de la semana más antigua a la actual,
  cada una `{ dateIso, minutes, hasStudy, level }`; `hasStudy = fecha ≤ today && T ≥ 1`
  (RF-1.1, RF-3.1, RF-7.1; el tooltip habla solo de `hasStudy` — RF-4.2).
- Defensa pasiva: en `sumMinutesPerDay`, sesiones sin `fecha` string o `minutos`
  numérico se ignoran (RNF-5, datos corruptos parciales).

## 5. Algoritmo del mapa (pseudocódigo)

```text
buildHeatMap(sessions, todayIso, weeks = 12):
    # 1. Ventana de 12 semanas, lunes a domingo, local (RF-1, RF-1.4)
    currentMonday = startOfWeekMondayIso(todayIso)
    firstDay      = shiftDaysIso(currentMonday, -7 * (weeks - 1))

    # 2. Totales por día y máximo diario del rango (RF-7.2, RF-7.3)
    totals = sumMinutesPerDay(sessions)               # incluye todo; se filtra después
    max    = 0
    for (fecha, total) in totals:
        if firstDay <= fecha <= todayIso:             # fechas futuras y antiguas fuera
            if total > max: max = total

    # 3. Casillas: 84 días consecutivos, de firstDay a firstDay+83 (RF-1.1)
    cells = []
    iso = firstDay
    repeat 84 times:
        total = totals.get(iso)
        if iso > todayIso or total == null:           # futuro o día sin sesión
            t = 0
        else:
            t = total
        cells.push({
            date: iso,
            minutes: t,
            hasStudy: (t >= 1 and iso <= todayIso),   # futura con datos => sin estudio
            level: heatMapLevel(t, max),
        })
        iso = shiftDaysIso(iso, +1)

    return { cells, max }
```

`heatMapLevel(t, max)` (pseudocódigo aparte por ser el corazón de RF-2):

```text
heatMapLevel(t, max):
    if t <= 0 or max <= 0: return 0          # RF-3.2: sin proporciones si M = 0
    scaled = 4 * t                            # entero: evita decimales intermedios
    if scaled <     max: return 1
    if scaled < 2 * max: return 2
    if scaled < 3 * max: return 3
    return 4                                  # RF-2.3: máximos empatados => 4
```

## 6. Aspecto en la interfaz (DOM + CSS)

- **Estructura DOM**: `section.card` con `h2` "Mapa de calor" → contenedor de la
  rejilla (12 columnas semana, cada una 7 casillas) → fila de leyenda al pie.
- **Rejilla**: 12 columnas flex con hueco pequeño; casillas cuadradas definidas con
  una variable de tamaño pensada para que `12 × (casilla + hueco)` quepa en 375 px
  (RNF-1); centrado en pantallas holgadas (RF-1: lunes arriba, semana antigua a la
  izquierda).
- **Colores (D4)**: cinco clases `level-0`…`level-4`; `level-0` recoge el tono de
  cuadrícula del papel vacío del diseño "cuaderno"; 1–4 suben por rampa naranja
  (paleta 🔥 de la regla de la app) hasta el tono fuerte. La leyenda usa las mismas
  clases: los colores son literalmente los mismos (RF-5.2).
- **Tooltip (RF-4)**: cada casilla con estudio recibe `title =
  formatearMinutos(total_del_día) + " · " + formatearFecha(fecha)` (funciones
  existentes de `app.js`, textos en español — ejemplo: "1 h 15 min · sáb, 24 oct
  2026"). Las casillas sin estudio ni tooltip (RF-4.2).
- **Leyenda (RF-5.1)**: 5 casillas muestra (las clases de nivel) entre los textos
  "menos" y "más"; sin interacción (fuera de alcance).
- **Accesibilidad**: la rejilla dentro de una región etiquetada ("Mapa de calor de
  estudio de las últimas semanas") y `aria-hidden`/texto alternativo coherente: el
  color nunca es el único canal (leyenda + tooltip).

## 7. Estrategia de tests (`node --test`, constitución nº 4)

Configuración: carpeta `tests/`; se ejecuta con `node --test` desde la raíz; los tests
importan `logic-dates.js` y `logic-heatmap.js` vía el puente de D2. Nada de DOM:
`buildHeatMap` recibe `todayIso` como parámetro y todos los casos pasan fechas fijas
(recogen el ejemplo del RF con hoy real: sábado 2026-10-24 → ventana desde el lunes
2026-08-03, 12 semanas incluida la semana en curso).

Casos (cada uno referencia su criterio de aceptación):

1. **Ventana** — `heatMapWindowIso("2026-10-24")` da `firstDay = "2026-08-10"` (lunes);
   84 días únicos y consecutivos; hoy incluido en la semana en curso (RF-1.1, RF-1.3).
2. **Hoy domingo/lunes** — con `today = "2026-10-25"` (domingo) la última columna va
   completa; con `today = "2026-10-19"` (lunes) solo su casilla es "hoy" y el resto de
   la columna actual queda vacía (RF-1.2; caso límite "hoy es lunes").
3. **Niveles y bordes** — con M = 100: T = 24 → 1; 25 → 2; 49 → 2; 50 → 3; 74 → 3;
   75 → 4; 100 → 4 (RF-2.1, bordes al nivel superior). Con M = 50: T = 13 → 2;
   T = 12 → 1 (M no divisible por 4).
4. **Empates** — dos días con el máximo → ambos nivel 4 (RF-2.3); todo-al-máximo →
   todas las casillas con estudio a 4 (RF-2.4) — por ejemplo, tres días con 60 min.
5. **Récord**: re-invocar `buildHeatMap` con una sesión mayor y comprobar que los
   niveles bajos se recomputan (RF-2.2, función pura re-ejecutable).
6. **Vacío** — cero sesiones → 84 casillas de nivel 0 y max 0 (RF-1.1, RF-3.2).
7. **Futuras** — sesión de mañana → no influye en M ni en su casilla, sin error
   (RF-6.2, RF-7.1, RF-7.3).
8. **Fuera de rango** — sesión anterior al primer lunes → no cuenta; sesión en el
   primer lunes → cuenta (RF-7.2).
9. **Varias sesiones el mismo día** — los totales suman todas (RF-4.3).
10. **Datos corruptos** — sesiones sin minutos numéricos o fecha no string no rompen
    y no suman (RNF-5).
11. **DST/local** — con la regla `shiftDaysIso` (setDate) no hay deriva: la ventana
    cruza el último domingo de octubre sin saltarse ni repetir días;
    `isoFromLocalDate(localDateFromIso(x)) === x` (RF-1.4; checklist skill
    `local-dates`).

## 8. Verificación de interfaz (después de tests en verde)

Con el MCP de ChromeDevTools (verificación obligatoria en AGENTS.md), contra
`file:///.../index.html`:

- Mostrar el mapa con datos y en blanco (RF-1.1, RF-3.2).
- Registrar sesiones de hoy/ayer/anteayer y comprobar refresco inmediato de
  casillas, niveles y leyenda (RF-6.1).
- Tooltip con texto y fecha en español en casilla con estudio; sin tooltip en casilla
  vacía y en día futuro (RF-4.1–RF-4.3, RF-7.1).
- Registro de sesión futura: el mapa no cambia y no hay error (RF-6.2).
- Vista de 375 px sin scroll horizontal; consola limpia (RNF-1, RNF-2).
- Métricas previas (rachas, semana, mes, lista) intactas — el delegado de fechas no
  cambia nada (RF-6.3, criterios de finalización).

## 9. Orden de implementación (tarea → puerta verde)

1. `logic-dates.js` + tests de fechas (caso 11) → verde.
2. `logic-heatmap.js` + tests (casos 1–10) → verde.
3. Delegar los tres helpers de `app.js` en `logic-dates.js` y cargarlo en
   `index.html`; verificación de métricas previas sin cambios.
4. `index.html` (sección del mapa) + `styles.css` (rejilla, niveles, leyenda) +
   `mostrarMapa()` en `app.js`; verificación de interfaz del paso 8.
5. Actualizar `MEMORY.md` (v1.4 + decisiones) y la nota de refactor de idioma de
   `app.js` como deuda declarada.

Prohibido seguir con tests en rojo o consola sucia (constitución nº 4 y verificación
de AGENTS.md).
