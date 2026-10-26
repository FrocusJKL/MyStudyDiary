# AGENTS.md — Diario de Estudio

Web estática para registrar sesiones de estudio y motivarse viendo la racha de días
seguidos. Proyecto didáctico: el código debe poder entenderlo alguien que empieza a
programar.

## Stack y estructura

- HTML, CSS y JavaScript puros: sin frameworks, librerías, npm, bundler ni build.
- `index.html` (estructura), `styles.css` (estilos), `app.js` (pegamento de interfaz y
  datos), `logic-dates.js` y `logic-heatmap.js` (lógica pura, código en inglés, sin DOM:
  constitución nº 3 y nº 6), `tests/heatmap.test.js` (suite `node --test`).
- Cálculos nuevos: funciones puras en `logic-*.js`; `app.js` solo pinta y guarda.
- Debe funcionar abriendo `index.html` con doble clic (`file://`): nada de módulos ES
  (`type="module"`), `fetch` a archivos locales ni nada que requiera servidor.

## Convenciones

- Textos de la interfaz en español.
- Código simple, nombres descriptivos y comentarios solo donde aporten.
- Diseño limpio y responsive; cualquier pantalla nueva debe verse bien en el móvil.

## Datos

- localStorage, clave `diarioDeEstudio.sesiones`: array de `{ id, fecha: "AAAA-MM-DD", tema,
minutos, creadoEn }`. (La mejor racha nunca se guarda: se calcula desde las fechas, así no puede
  quedar desincronizada con los datos reales.)
- Si cambias la forma de los datos, mantén compatibilidad con lo ya guardado o el usuario
  perderá sus sesiones.

## Fechas y racha (fácil equivocarse)

- Trabaja siempre con la fecha local del usuario. Nunca uses `toISOString()` ni `new
Date("AAAA-MM-DD")`: se interpretan en UTC y desplazan el día.
- Racha = días consecutivos con al menos 1 sesión que terminan hoy. Si hoy no hay sesión
  pero ayer sí, la racha sigue viva y se cuenta desde ayer.
- Mejor racha = la mayor corrida histórica de días consecutivos con sesión, contando solo
  hoy y días anteriores. Es independiente de la racha actual: una corrida ya rota sigue
  contando (la actual puede ser 0 y la mejor 3).
- La "semana" empieza en lunes (ISO 8601), calculado en fecha local. El total de minutos
  de la semana se calcula desde las sesiones, no se guarda: las fechas futuras no suman.
- Días del mes = días distintos del mes en curso con al menos 1 sesión. Se calcula desde
  las sesiones, no se guarda: el mes se saca de la fecha local de hoy y las fechas futuras
  no cuentan.
- Varias sesiones el mismo día cuentan como un solo día. Las fechas futuras no suman.

## Forma de trabajar

- Haz solo lo que se pide: no añadas funcionalidades por tu cuenta.
- Cambios pequeños y enfocados; no reescribas lo que ya funciona.
- Al terminar, resume qué has cambiado y cualquier decisión que deba revisar.

## Memoria

- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones
  tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su
  porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de
  dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).

## Límites

- ✅ Siempre: respetar las reglas de fechas y racha, mantener los textos en español.
- ✅ Siempre: actualizar `MEMORY.md` al terminar cada tarea.
- ⚠️ Pregunta antes: crear archivos nuevos, cambiar el formato de los datos guardados.
- 🚫 Nunca: añadir dependencias, frameworks o un paso de build.

## Verificación

- La lógica se prueba con `node --test` desde la raíz (tests en verde, constitución nº 4:
  prohibido avanzar en rojo). Después de cada cambio, verifica la interfaz con el MCP de
  ChromeDevTools: abre `index.html`, prueba la funcionalidad, revisa la consola y
  comprueba la vista móvil.
- Para empezar de cero: DevTools → Application → Local Storage → borrar la clave
  `diarioDeEstudio.sesiones`.
