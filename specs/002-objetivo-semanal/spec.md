# Especificación — Objetivo semanal de estudio (002-objetivo-semanal)

Estado: borrador
Versión: 1.0 · fecha: 2026-10-25
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

## Decisiones registradas (propuestas para aprobación del autor)

- **El objetivo se guarda, no se calcula** (dado por el flujo Fase 1): es una
  preferencia del usuario, al contrario que racha, minutos de la semana y días del
  mes, que se derivan de las sesiones.
- **Almacenamiento**: clave propia en localStorage, `diarioDeEstudio.objetivoSemanal`,
  con un único entero de minutos. La clave `diarioDeEstudio.sesiones` no se toca ni
  se migra (los datos guardados no cambian de forma). Nueva clave = decisión que el
  usuario aprueba (AGENTS.md).
- **Fijación en el propio sitio**: el objetivo se edita junto al bloque "esta semana"
  de la cabecera de rachas, que es donde ya vive la métrica medida.
- **Formato numérico**: el mismo formato horario unificado del proyecto
  (`formatearMinutos()`: "45 min", "1 h 15 min", "2 h") para el progreso y para el
  objetivo, coherente con lo que ya se muestra.
- **Sin barra de progreso** en v1: el progreso se comunica con el texto "X de Y"
  más el estado de cumplido. Más simple y didáctico; una barra queda para el futuro.

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

- Criterio de aceptación RF-1.1 — EL SISTEMA DEBE ofrecer un control para fijar el
  objetivo que acepta un número entero de minutos ≥ 1; cualquier otro valor
  (texto, 0, negativo, decimal) NO DEBE guardarse.
- Criterio de aceptación RF-1.2 — CUANDO el usuario fija un objetivo válido, EL
  SISTEMA DEBE guardarlo y mostrarlo como objetivo de la semana en curso en el
  mismo refresco en que se ve fijado.
- Criterio de aceptación RF-1.3 — CUANDO el usuario quiera cambiar el objetivo, EL
  SISTEMA DEBE permitir editarlo en cualquier momento, sustituyendo el valor
  anterior.
- Criterio de aceptación RF-1.4 — CUANDO el usuario vacíe el control del objetivo
  y lo confirme, EL SISTEMA DEBE eliminar el objetivo guardado y volver al estado
  "sin objetivo" (RF-5).

### RF-2 Persistencia del objetivo

- Criterio de aceptación RF-2.1 — EL SISTEMA DEBE guardar el objetivo bajo la clave
  propia `diarioDeEstudio.objetivoSemanal` (valor: entero de minutos) y NO DEBE
  escribir en la clave `diarioDeEstudio.sesiones` ni alterar su forma.
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
- **RNF-2 — Lógica separada (constitución nº 3)**: el cálculo del estado del
  objetivo (¿hay objetivo?, ¿se ha cumplido?, ¿con qué progreso?) es una función
  pura, sin DOM ni localStorage, que recibe "hoy" (y si procede el inicio de
  semana) como parámetro; `app.js` solo lee el almacenamiento y pinta. Sin nuevas
  funciones de fecha más allá de las reutilizadas.
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
- **Valor inválido en el control** (texto, 0, negativo, decimal): no se guarda
  nada (RF-1.1).
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
- Actualización en vivo al cruzar medianoche o cambiar el reloj con la pestaña
  abierta: el progreso correcto reaparece en la próxima carga o guardado (decisión
  ya tomada en la spec 001).
- Cambios en otros elementos de la página (rachas, mapa de calor, mes, lista).

## Decisiones abiertas

- **D1 — Aprobar la clave nueva** `diarioDeEstudio.objetivoSemanal` (entero de
  minutos) y confirmar que no se toca `diarioDeEstudio.sesiones`. Propuesta
  registrada arriba; AGENTS.md exige aprobación del autor.
- **D2 — Aprobar la colocación del control** junto al bloque "esta semana" de la
  cabecera de rachas. Propuesta: ahí, por cercanía con la métrica medida
  (menos recorrido para editarla y verla).
- **D3 — Aprobar el texto del estado cumplido**: "objetivo cumplido" junto al
  progreso cuando X ≥ Y. Propuesta: sí, texto plano sin adornos, coherente con el
  estilo "cuaderno".

Si al aprobar la spec el autor cambia alguna de estas decisiones, se actualiza este
documento antes de pasar al plan (constitución nº 2).

## Criterios de finalización

- Todos los RF con sus criterios de aceptación verificados, con el catálogo
  completo de casos límite de arriba.
- Lógica verificada con `node --test` (sin paquetes) y tests en verde
  (constitución nº 4): estado del objetivo, cumplido / no cumplido, formato.
- Interfaz verificada con el MCP de ChromeDevTools: fijar, cambiar y quitar el
  objetivo, guardar sesiones y ver el progreso actualizarse, persistencia tras
  recarga, vista de 375 px y consola sin errores.
- Funciona con doble clic desde el archivo, sin dependencias ni build.
- Los datos existentes del usuario no cambian de forma: sesiones intactas y las
  métricas antiguas (rachas, semana, mes, mapa) correctas.
