# Especificación — Objetivo semanal de estudio (002-objetivo-semanal)

Estado: borrador activo (pendiente de aprobación final del documento)
Versión: 1.1 · fecha: 2026-10-25 (v1.0 revisada como QA; decisiones oficiales del
autor incorporadas en v1.1)
Cumple la constitución del proyecto (docs/constitution.md): simplicidad, lógica separada
de interfaz, datos del usuario sagrados, interfaz en español.

## Problema y objetivo

Hoy el Diario de Estudio ya muestra "X min esta semana", pero esa cifra no motiva por
sí sola: no hay contra qué compararla. El usuario quiere fijar **cuántos minutos quiere
estudiar cada semana** y ver **cuánto lleva respecto a ese objetivo**, para tener una
meta clara que empuje a cumplirla.

El objetivo de esta versión es lo mínimo que cumple esa idea: **fijar un objetivo
semanal en minutos, ver el progreso de la semana en curso contra él y que se actualice
al guardar sesiones**. Una sola cifra de objetivo, reutilizada semana tras semana; el
progreso se mide sobre la misma semana (lunes–domingo, ISO 8601, hora local) que ya
usa "esta semana".

## Decisiones registradas

### Oficiales del autor (v1.1, cierran las dudas D1–D3 de la v1.0)

- **El objetivo se guarda, no se calcula** (dado por el flujo Fase 1): es una
  preferencia del usuario, al contrario que racha, minutos de la semana y días del
  mes, que se derivan de las sesiones.
- **D1 — Almacenamiento aprobado**: clave propia en localStorage,
  `diarioDeEstudio.objetivoSemanal`, con el entero de minutos guardado como
  **texto plano** (por ejemplo `300`, no JSON). La clave
  `diarioDeEstudio.sesiones` no se toca ni se migra (los datos guardados no
  cambian de forma).
- **D2 — Colocación aprobada**: el control de fijar y el progreso viven en la
  cabecera de rachas, junto al bloque "esta semana", que es donde ya vive la
  métrica medida.
- **D3 — Texto del cumplido aprobado**: "objetivo cumplido" junto al progreso
  cuando X ≥ Y, estilo cuaderno, sin adornos.
- **Formato numérico**: el mismo formato horario unificado del proyecto
  (`formatearMinutos()`: "45 min", "1 h 15 min", "2 h") para el progreso y para el
  objetivo, coherente con lo que ya se muestra.
- **Sin barra de progreso** en v1: el progreso se comunica con el texto "X de Y"
  más el estado de cumplido. Más simple y didáctico; una barra queda para el futuro.

### Cierres de la revisión QA (v1.1, decididos por el autor)

- **Interacción**: un **input numérico** más un botón **"Guardar objetivo"**.
  Vaciar el input y guardar quitará el objetivo (RF-1.4). Sin diálogos de
  confirmación: guardar es reversible reeditando el valor.
- **Feedback de valor inválido**: el botón "Guardar objetivo" queda
  **deshabilitado** mientras el valor no sea un entero ≥ 1 (sin tope máximo);
  se define como criterio EARS en RF-1.5.
- **Lógica separada y archivo nuevo**: la función pura del estado del objetivo
  vive en un **archivo nuevo `logic-objetivo.js`** (aprobado por el autor),
  siguiendo el patrón de `logic-heatmap.js`: código en inglés, sin DOM ni
  almacenamiento, con puente CommonJS para `node --test`. `app.js` solo lee el
  almacenamiento y pinta (cierra RNF-2).
- **Documentación al cierre**: con D1 cerrada, la sección "Datos" de `AGENTS.md`
  deberá documentar la clave nueva al terminar la implementación (tarea del
  cierre, fuera del código de este documento).

## Usuario y escenarios

- **El estudiante**, usuario único, que registra sesiones y revisa su progreso en
  ordenador y móvil. Es la misma persona que ya usa las rachas y el mapa de calor.

Escenarios:

- **HU-1**: Como estudiante, quiero fijar cuántos minutos quiero estudiar cada
  semana, para tener una meta clara.
- **HU-2**: Como estudiante, quiero ver cuánto llevo esta semana respecto a mi
  objetivo, para saber si voy bien o tengo que ponerme.
- **HU-3**: Como estudiante, quiero que el progreso se actualice nada más guardar
  una sesión, para ver el efecto de mi esfuerzo al instante.
- **HU-4**: Como estudiante, quiero saber cuándo he cumplido el objetivo, para
  sentirme recompensado.
- **HU-5**: Como estudiante, quiero poder cambiar o quitar el objetivo cuando
  quiera, porque mis metas pueden cambiar.
- **HU-6**: Como estudiante que aún no ha fijado objetivo, quiero que la página se
  vea como siempre (sin huecos raros ni errores), para no sentir que falta nada
  hasta que lo fije.

## Requisitos funcionales y criterios de aceptación (EARS)

### RF-1 Fijar el objetivo semanal

El control es un **input numérico** más un botón **"Guardar objetivo"** (decisión de
la revisión QA, v1.1). No hay diálogos de confirmación: guardar sustituye el valor
anterior y quitar es reversible volviendo a fijar uno.

- Criterio de aceptación RF-1.1 — EL SISTEMA DEBE permitir fijar el objetivo con el
  input numérico y el botón "Guardar objetivo"; solo se guardan enteros ≥ 1, sin
  tope máximo; cualquier otro valor (texto, 0, negativo, decimal) NO DEBE guardarse.
- Criterio de aceptación RF-1.2 — CUANDO el usuario fija un objetivo válido, EL
  SISTEMA DEBE guardarlo y mostrarlo como objetivo de la semana en curso en el
  mismo refresco en que se ve fijado.
- Criterio de aceptación RF-1.3 — CUANDO el usuario quiera cambiar el objetivo, EL
  SISTEMA DEBE permitir escribir un nuevo valor en el mismo input y guardarlo,
  sustituyendo el anterior sin pasos adicionales.
- Criterio de aceptación RF-1.4 — CUANDO el usuario vacíe el input y guarde, EL
  SISTEMA DEBE eliminar el objetivo guardado y volver al estado "sin objetivo"
  (RF-5), sin diálogo de confirmación.
- Criterio de aceptación RF-1.5 — CUANDO el valor del input no sea un entero ≥ 1
  (vacío, texto, 0, negativo o decimal), EL SISTEMA DEBE mantener el botón
  "Guardar objetivo" deshabilitado como único feedback; CUANDO el valor sea un
  entero ≥ 1, EL SISTEMA DEBE habilitarlo.

### RF-2 Persistencia del objetivo

- Criterio de aceptación RF-2.1 — EL SISTEMA DEBE guardar el objetivo bajo la clave
  propia `diarioDeEstudio.objetivoSemanal`, con el entero de minutos como texto
  plano (por ejemplo `300`, no JSON) y NO DEBE escribir en la clave
  `diarioDeEstudio.sesiones` ni alterar su forma.
- Criterio de aceptación RF-2.2 — CUANDO la página se recargue, EL SISTEMA DEBE
  recuperar el objetivo guardado y mostrarlo, sin que el usuario vuelva a fijarlo.
- Criterio de aceptación RF-2.3 — CUANDO no exista la clave del objetivo, EL
  SISTEMA DEBE arrancar en estado "sin objetivo" sin errores y sin crear la clave.

### RF-3 Progreso de la semana en curso

- Criterio de aceptación RF-3.1 — CUANDO haya un objetivo fijado, EL SISTEMA DEBE
  mostrar el total de minutos de la semana en curso junto al objetivo, en la forma
  "X de Y esta semana", con X e Y en formato horario unificado (RF-4.3).
- Criterio de aceptación RF-3.2 — EL SISTEMA DEBE medir el progreso con el mismo
  cálculo de "esta semana" ya existente: sesiones del lunes (ISO, hora local) a hoy
  inclusive, varias sesiones del mismo día suman todas, y las fechas futuras no
  cuentan.
- Criterio de aceptación RF-3.3 — CUANDO los minutos de la semana alcancen o
  superen el objetivo, EL SISTEMA DEBE mostrar el estado de cumplido de forma
  visible (el texto "objetivo cumplido" acompaña al progreso) de modo que no haya
  que comparar cifras para enterarlo.
- Criterio de aceptación RF-3.4 — CUANDO una semana nueva empiece (el lunes
  sustituye al domingo anterior), EL SISTEMA DEBE volver a calcular el progreso
  desde 0 contra el mismo objetivo guardado: el objetivo no se reinicia, no se
  acumula ni se archiva.

### RF-4 Medición de los minutos de la semana

- Criterio de aceptación RF-4.1 — EL SISTEMA DEBE derivar todos los cálculos del
  progreso de las sesiones guardadas; ningún minuto del progreso se guarda.
- Criterio de aceptación RF-4.2 (constitución nº 5) — CUANDO se calcule el
  progreso, EL SISTEMA DEBE trabajar con la fecha local del usuario y con las
  fechas guardadas como texto "AAAA-MM-DD", nunca con UTC ni reinterpretando los
  textos de fecha.
- Criterio de aceptación RF-4.3 — EL SISTEMA DEBE expresar los minutos de progreso
  y de objetivo en formato horario unificado: "45 min" para menos de una hora,
  "1 h 15 min" con resto, "2 h" si es exacto.

### RF-5 Estado sin objetivo

- Criterio de aceptación RF-5.1 — CUANDO no haya objetivo fijado, EL SISTEMA DEBE
  mostrar "esta semana" tal como se ve hoy (solo los minutos, sin objetivo, sin
  progreso ni estado de cumplido), sin errores en consola.
- Criterio de aceptación RF-5.2 — CUANDO se fije el objetivo por primera vez, EL
  SISTEMA DEBE pasar del estado "sin objetivo" al estado con objetivo sin recargar
  la página.

### RF-6 Actualización en vivo

- Criterio de aceptación RF-6.1 — CUANDO se registre una sesión (incluidas las
  fechadas en días pasados de la semana en curso), EL SISTEMA DEBE refrescar el
  progreso en el mismo refresco que la lista y las demás métricas.
- Criterio de aceptación RF-6.2 — CUANDO la semana en curso tenga días futuros
  (hoy no es domingo), EL SISTEMA DEBE ignorar las sesiones con fecha futura para
  el progreso, sin error y sin impedir guardarlas (regla ya vigente en el
  proyecto).

## Requisitos no funcionales

- **RNF-1 — Reglas de fechas (skill local-dates)**: nunca `toISOString()`, nunca
  `new Date("AAAA-MM-DD")`, nunca cálculos con 86400000; suma y resta de días con
  `setDate`; hoy en hora local con `getFullYear()/getMonth()/getDate()` rellenando
  con ceros; reutilizar `inicioDeSemana()`, `fechaLocalISO()` y `formatearMinutos()`
  antes de crear funciones nuevas. Casos a vigilar: sesión a las 00:30 y cambio de
  hora (últimos domingos de marzo y octubre).
- **RNF-2 — Lógica separada (constitución nº 3, cerrada en la revisión QA)**: el
  cálculo del estado del objetivo (¿hay objetivo?, ¿se ha cumplido?, ¿con qué
  progreso?) vive en un archivo nuevo `logic-objetivo.js` (en inglés), siguiendo
  el patrón de `logic-heatmap.js`: función pura, sin DOM ni almacenamiento, que
  recibe "hoy" (y si procede el inicio de semana) como parámetro, con puente
  CommonJS para `node --test`. `app.js` solo lee el almacenamiento y pinta. Sin
  nuevas funciones de fecha más allá de las reutilizadas.
- **RNF-3 — Coste cero (constitución)**: sin dependencias, frameworks ni build;
  debe seguir funcionando con doble clic sobre `index.html` (`file://`).
- **RNF-4 — Móvil**: a 375 px de ancho el control del objetivo y el progreso deben
  verse bien sin scroll horizontal, coherentes con el diseño "cuaderno" actual.
- **RNF-5 — Datos sagrados (constitución nº 5)**: la clave `diarioDeEstudio.sesiones`
  queda intacta; el objetivo va en una clave nueva e independiente. Si el valor de
  la clave del objetivo está corrupto (no interpretable como entero ≥ 1), EL
  SISTEMA DEBE tratarlo como "sin objetivo" y NO DEBE borrar ni alterar nada en el
  almacenamiento al arrancar.
- **RNF-6 — Idioma (constitución nº 6)**: los textos de la interfaz (etiquetas,
  "de", "objetivo cumplido", avisos) en español; el código nuevo, en inglés.

## Casos límite

- **Sin objetivo fijado**: la vista se queda como hoy; sin errores ni claves
  creadas (RF-5.1, RF-2.3).
- **Valor inválido en el control** (vacío, texto, 0, negativo, decimal): el botón
  queda deshabilitado y no se guarda nada (RF-1.1, RF-1.5).
- **Valor corrupto en la clave**: se trata como "sin objetivo", sin borrar nada
  (RNF-5).
- **Progreso que iguala el objetivo**: cuenta como cumplido (RF-3.3).
- **Progreso que supera el objetivo** (p. e. 420 min contra 300): cumplido, se
  muestran los minutos reales, sin recortar (RF-3.3).
- **Objetivo de 1 minuto**: cualquier sesión de 1 min de la semana lo cumple
  (RF-1.1, RF-3.3).
- **Sesión guardada con fecha pasada pero de esta semana**: suma al progreso
  (RF-6.1).
- **Sesión con fecha futura**: no suma (RF-6.2); guardada sin error, como hoy.
- **Cambio de semana**: el progreso vuelve a 0 con el mismo objetivo (RF-3.4); el
  objetivo fijado un domingo sigue valiendo el lunes siguiente.
- **Cruce de medianoche / cambio de reloj con la pestaña abierta**: fuera de
  alcance v1; el progreso correcto reaparece en la próxima carga o guardado.
- **Varias sesiones el mismo día**: suman todas al progreso, como en "esta semana"
  (RF-3.2).
- **Recarga de página con objetivo fijado**: se recupera y se recalcula el
  progreso desde los datos (RF-2.2, RF-4.1).
- **Quitar el objetivo**: vuelve al estado sin objetivo y la clave deja de
  condicionar la vista (RF-1.4).

## Fuera de alcance (versión 002)

- Barra de progreso gráfica, porcentajes o animaciones.
- Objetivos diarios, mensuales o por tema/sesión.
- Histórico de objetivos por semana, o archivar cuántas semanas se cumplió.
- Acumular el objetivo incumplido de una semana a la siguiente.
- Recordatorios, notificaciones o avisos al final de la semana.
- Cambios en otros elementos de la página (rachas, mapa de calor, mes, lista).
- Actualización en vivo al cruzar medianoche o tras cambios de reloj/zona
  horaria del sistema con la pestaña abierta (simetría con la spec 001): el
  progreso correcto reaparece en la próxima carga o guardado.

## Decisiones abiertas

Ninguna. D1 (clave y formato de guardado), D2 (colocación en la cabecera de
rachas) y D3 (texto del cumplido) quedaron cerradas como decisiones oficiales del
autor en la v1.1, junto con la interacción (input + botón), el feedback de valor
inválido (botón deshabilitado) y el archivo nuevo `logic-objetivo.js` aprobado.
Si durante el plan técnico surge una decisión no cubierta por esta spec, se
para y se pregunta antes de implementar (constitución nº 2).

Pendiente externo a este documento: la aprobación final del documento por parte
del autor (paso de "borrador activo" a "aprobado").

## Criterios de finalización

- Todos los RF con sus criterios de aceptación verificados, con el catálogo
  completo de casos límite de arriba.
- Lógica verificada con `node --test` (sin paquetes) y tests en verde
  (constitución nº 4): estado del objetivo, cumplido / no cumplido, formato,
  con las pruebas de `logic-objetivo.js`.
- Interfaz verificada con el MCP de ChromeDevTools: fijar, cambiar y quitar el
  objetivo, guardar sesiones y ver el progreso actualizarse, persistencia tras
  recarga, vista de 375 px y consola sin errores.
- Funciona con doble clic desde el archivo, sin dependencias ni build.
- Los datos existentes del usuario no cambian de forma: sesiones intactas y las
  métricas antiguas (rachas, semana, mes, mapa) correctas.
- Al terminar (tarea del cierre): la sección "Datos" de `AGENTS.md` documenta la
  clave nueva `diarioDeEstudio.objetivoSemanal` (entero de minutos como texto
  plano), junto con la clave de sesiones que ya describe.
- `MEMORY.md` actualizado al terminar la implementación (regla de AGENTS.md).
