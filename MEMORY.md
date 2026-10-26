# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.

## Estado actual

- v1.4 funcionando: registrar sesiones, racha actual y mejor racha, minutos de la
  semana, días del mes, **mapa de calor de 12 semanas** (espec 001 completa: T1-T5 ✅,
  más etiquetas de día L M X J V S D a la izquierda de la rejilla, añadidas fuera de
  la spec: decorativas, `aria-hidden`, sin tocar la lógica)
  y lista de sesiones. Datos en localStorage, todo se calcula desde las fechas guardadas.
- Spec 001 (mapa de calor) en `specs/001-heat-map/spec.md`, v1.1 tras revisión QA: dudas cerradas (leyenda al pie de la tarjeta, formato horario unificado, bordes 25/50/75 % al nivel superior, futuras sin tooltip, recálculo inmediato). Pendiente: plan técnico e implementación.

## Decisiones (y por qué)

- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- Mejor racha y minutos de la semana se calculan (no se guardan): un valor guardado podría quedar desincronizado con los datos reales.
- "Esta semana" empieza en lunes (ISO 8601, convención española), calculado en local.
- Fechas futuras no cuentan en ninguna métrica. No se impiden guardarlas (no se pidió restringir el formulario).
- Límite de 1440 min (24 h) por sesión, a petición del autor: una sesión no puede
  durar más que un día. Vence en dos sitios: `max="1440"` en el input (mensaje
  nativo del navegador) y `MAX_MINUTOS_SESION` en la validación de `app.js` al
  guardar. Sesiones gigantes ya guardadas no se tocan (solo se limita lo nuevo).
- AGENTS.md se corrigió para describir el código real (clave `diarioDeEstudio.sesiones`,campos `{ id, fecha, tema, minutos, creadoEn }`): la documentación manda sobre el código, pero una doc que no coincide hace que un agente "arregle" el código a lo que dice la doc.
- Skill local en `.agents/skills/local-dates/SKILL.md`: regla de fechas del proyecto.
- Mapa de calor (espec 001): lógica pura en `logic-heatmap.js` + `logic-dates.js`
  (inglés, con puente CommonJS para `node --test`); `app.js` solo pinta. Los 5 niveles
  son clases fijas (`nivel-0`…`nivel-4`), la leyenda es estable; los bordes 25/50/75 %
  van al nivel superior (`4T` contra `M`); ventana de 12 semanas empezando en el lunes
  de hace 11 semanas, inclusive; días futuros visibles pero vacíos y sin tooltip.
- Deuda declarada: `app.js` sigue en español (la constitución nº 6 manda código en
  inglés); se refactoriza sin cambiar comportamiento en una tarea aparte.
- Días del mes: días distintos del mes en curso con ≥1 sesión, junto a "esta semana". Se calculan (no se guardan) por el mismo motivo que racha y minutos: evitar desincronización. Sin funciones de fecha nuevas: filtro por texto "AAAA-MM-DD".
- Diseño "cuaderno": papel cuadriculado, hojas blancas, tinta de bolígrafo (azul para acciones/foco) y la racha marcada con un subrayador amarillo. Sin fuentes externas ni degradados decorativos: la identidad viene de Georgia (serif, web-safe) + system-ui.

## Aprendizajes y errores a evitar

- Skills de OpenCode: el archivo DEBE llamarse exactamente `SKILL.md` (mayúsculas) si va en su propio directorio; `skill.md` en minúsculas no se detecta y `/skills` no la muestra.
- Formato horario unificado (`formatearMinutos()`): es el único formato válido para
  mostrar minutos en la interfaz. En su día la lista de sesiones mostraba "22233
  min" porque no lo aplicaba; corregido a petición del autor. Cualquier sitio nuevo
  que pinte minutos debe reutilizarla (ya lo hacen "esta semana" y el mapa).
- Frontmatter de agentes (`.opencode/agents/*.md`): las claves `resource` y `effect` deben quedar alineadas bajo `action`; si no, el YAML es inválido y OpenCode descarta el agente en silencio (no aparece en /agents). Tras corregir, hace falta recarga completa (`/reload` o reabrir opencode).
- Contraste racha actual → mejor racha: mirar hacia atrás desde hoy ≠ mayor corrida del historial. La actual puede ser 0 y la mejor 3. Probar ambos con huecos de un día.
- Métricas distintas sobre los mismos días: la racha cuenta el día una vez; los minutos suman todas las sesiones del día. No confundir sesiones con días.

## Próximos pasos

- Escribir el plan técnico de la spec 001 (mapa de calor) y luego implementarla.
