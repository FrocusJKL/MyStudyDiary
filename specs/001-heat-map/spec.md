# Especificación — Mapa de calor de estudio (001-heat-map)

Estado: borrador activo
Versión: 1.1 · fecha: 2026-10-24 (v1.0 revisada como QA; decisiones del autor incorporadas)
Cumple la constitución del proyecto (docs/constitution.md): simplicidad, lógica separada
de interfaz, datos del usuario sagrados, interfaz en español.

## Contexto y objetivo

Hoy el Diario de Estudio motiva con la racha actual, la mejor racha, los minutos de la
semana, los días del mes y la lista de sesiones. Lo que no enseña es la **tendencia**:
si el estudio es constante o va en picado, y qué tan intensos fueron los días pasados.

El objetivo de esta versión es un **mapa de calor de estudio**: una rejilla compacta de
los últimos meses donde cada casilla es un día; el color muestra si se estudió y, dentro
de los días estudiados, cuántos minutos, según la idea original: "más minutos estudiados,
más intenso el color del día". Es la primera versión del mapa y debe ser simple.

## Decisiones registradas

### Por preguntas al usuario (v1.0)

- Rango: **últimas 12 semanas** (pregunta 1).
- Intensidad: **niveles relativos al máximo** diario del rango (pregunta 2).
- Interactividad: **tooltip nativo** del navegador, nada especial en móvil (pregunta 3).
- Paleta: **naranja de la app** (pregunta 4).
- Alcance: **con leyenda**; clic-en-días y etiquetas de mes quedan fuera (pregunta 5).

### Cierres de la revisión QA (v1.1, decididos por el autor)

- **Leyenda**: dentro de la tarjeta del mapa, como fila inferior (cierra duda 1).
- **Tooltip**: formato horario unificado del proyecto: "45 min", "1 h 15 min", "2 h"
  (cierra duda 2).
- **Bordes de nivel**: 25 %, 50 % y 75 % del máximo diario pertenecen al **nivel más
  alto** de los dos que tocan: nivel 4 desde tres cuartos, inclusive (cierra duda 3 y
  la contradicción del 75 %).
- **Días futuros con sesiones en los datos**: casilla vacía, sin tooltip (cierra la
  contradicción RF-4/RF-7).
- **Recálculo de niveles**: inmediato, en el mismo refresco que muestra la sesión
  guardada (cierra la ambigüedad de RF-2.2).
- **Cruce de medianoche con la pestaña abierta** y **cambios de reloj/zona del
  sistema con la pestaña abierta**: fuera de alcance v1; el mapa se reconstruye en
  cada carga y tras cada guardado.
- **Datos corruptos parciales**: se omiten las sesiones no interpretables de los
  cálculos; el mapa muestra lo derivable; el almacenamiento no se toca (cierra la
  ambigüedad de RNF-5).
- **Minutos no enteros**: el cálculo de niveles no los asume; el formulario ya solo
  admite enteros (cierra el caso límite).

## Usuarios

- **El estudiante**, usuario único, que registra sus sesiones y revisa su progreso en
  ordenador y móvil. Es la misma persona que ya usa las rachas.

## Historias de usuario

- **HU-1**: Como estudiante, quiero ver de un vistazo en qué días de las últimas
  12 semanas estudié, para comprobar mi constancia de meses de vida.
- **HU-2**: Como estudiante, quiero que el color de cada día diga cuánto estudié
  (más intenso = más minutos), para identificar mis días fuertes sin leer cifras.
- **HU-3**: Como estudiante, quiero inspeccionar un día y ver sus minutos y su fecha,
  para valorarlo sin abrir la lista de sesiones.
- **HU-4**: Como estudiante nuevo del mapa, quiero una leyenda que explique los
  colores, para interpretarlo sin ayuda.
- **HU-5**: Como estudiante, quiero que el mapa se actualice cuando registro una
  sesión, para ver mi constancia nada más terminar de guardar.

## Requisitos funcionales y criterios de aceptación (EARS)

### RF-1 Ventana del mapa

La ventana cubre las **12 últimas semanas**: la semana en curso (que incluye hoy) y
las 11 anteriores, 12 × 7 = **84 casillas**. Cada columna es una semana de lunes a
domingo; las filas son los días de la semana; el orden es de la semana más antigua
(izquierda) a la más reciente (derecha). La **primera casilla de la ventana es el
lunes que empieza la semana 12 contando la actual hacia atrás**: ese día queda
**dentro** del rango (borde inferior inclusivo).

- Criterio de aceptación RF-1.1 — CUANDO la página se muestre con historial en
  blanco, EL SISTEMA DEBE representar las 84 casillas de las 12 semanas
  (lunes a domingo), todas con el nivel de vacío.
- Criterio de aceptación RF-1.2 — CUANDO hoy sea un domingo, EL SISTEMA DEBE
  presentar la columna de la semana en curso completa, con hoy como última casilla.
- Criterio de aceptación RF-1.3 — EL SISTEMA DEBE incluir hoy en el mapa y colocarlo
  en la columna de la semana en curso, independientemente de la hora del día.
- Criterio de aceptación RF-1.4 (constitución nº 5) — EL SISTEMA DEBE calcular la
  ventana de 12 semanas, los lunes de cada columna y la casilla de hoy con la fecha
  local del usuario, nunca con UTC ni con textos de fecha reinterpretados
  ("AAAA-MM-DD" como identificador del día).

### RF-2 Intensidad del color

El mapa usa 5 niveles: **0 (vacío)** y **1 a 4 de estudio**. El nivel depende
únicamente del total T de minutos del día y del **máximo diario M** del rango (el día
con más minutos de las 12 semanas), ambos calculados solo con sesiones del rango y
sin fechas futuras (RF-7). Convención entera (comparar 4T con M evita decimales
intermedios y funciona aunque M no sea divisible entre 4):

- nivel 0: T = 0;
- nivel 1 (suave): 4T < M — menos de un cuarto del máximo diario;
- nivel 2 (medio): M ≤ 4T < 2M — de un cuarto, inclusive, a menos de la mitad;
- nivel 3 (fuerte): 2M ≤ 4T < 3M — de la mitad, inclusive, a menos de tres cuartos;
- nivel 4 (máximo): 3M ≤ 4T — de tres cuartos, inclusive, hasta el máximo.

Convención de bordes: el día que cae exactamente en un borde (25 %, 50 % o 75 % del
máximo diario) pertenece al **nivel más alto** de los dos que toca.

- Criterio de aceptación RF-2.1 — CUANDO M ≥ 1 y un día del rango tenga total T,
  EL SISTEMA DEBE asignar el nivel por los tramos anteriores, con el día máximo
  siempre en nivel 4.
- Criterio de aceptación RF-2.2 — CUANDO un día bata récord de minutos (T nuevo
  máximo), EL SISTEMA DEBE recalcular los niveles de todo el mapa en el mismo
  refresco en que se muestra la sesión guardada: ningún color ni nivel se guarda
  entre visitas; los niveles se derivan siempre de los datos.
- Criterio de aceptación RF-2.3 — CUANDO dos o más días empaten con el máximo
  diario, EL SISTEMA DEBE pintarlos todos con nivel 4.
- Criterio de aceptación RF-2.4 — CUANDO todos los días con estudio del rango
  empaten con el máximo diario (caso "todo al máximo"), EL SISTEMA DEBE pintar todas
  las casillas con estudio en nivel 4 y la leyenda debe seguir mostrando sus 5
  muestras.

### RF-3 Días sin estudio del rango

- Criterio de aceptación RF-3.1 — CUANDO un día del rango no tenga ninguna sesión,
  EL SISTEMA DEBE mostrar su casilla con el color del nivel 0 (vacío), un color
  distinto de los colores de los niveles 1 a 4 y verificable como distinto (no como
  "más o menos distinguido" a juicio del observador).
- Criterio de aceptación RF-3.2 — SI el máximo diario del rango es 0 (ningún día
  estudiado en las 12 semanas), EL SISTEMA DEBE mostrar las 84 casillas de vacío,
  sin calcular proporciones.

### RF-4 Inspección de un día (tooltip)

**Definición**: una casilla _con estudio_ es la del día del rango con fecha ≤ hoy y
total T ≥ 1. Los días futuros del rango, aunque existan sesiones con esa fecha en
los datos, **no** son casillas con estudio (ver RF-7.1).

- Criterio de aceptación RF-4.1 — CUANDO el usuario inspeccione una casilla con
  estudio con el medio que corresponda al dispositivo si este presenta el tooltip
  nativo (cursor con ratón), EL SISTEMA DEBE ofrecer el texto "«total del día en
  formato horario unificado» · «fecha en formato español»", por ejemplo
  "1 h 15 min · sáb, 24 oct 2026" o "45 min · vie, 23 oct 2026".
- Criterio de aceptación RF-4.2 — CUANDO se inspeccione una casilla sin estudio
  (día sin sesiones o día futuro), EL SISTEMA NO DEBE mostrar tooltips informativos;
  el nivel de vacío ya comunica el estado.
- Criterio de aceptación RF-4.3 — CUANDO un día acumule varias sesiones, EL SISTEMA
  DEBE mostrar en el tooltip el total del día, no una línea por sesión.

### RF-5 Leyenda

- Criterio de aceptación RF-5.1 — EL SISTEMA DEBE mostrar, en una fila al pie de la
  tarjeta del mapa, una leyenda con 5 muestras de color (nivel 0 y los 4 niveles de
  estudio) y los textos "menos" y "más" indicando la dirección de la intensidad.
- Criterio de aceptación RF-5.2 — CUANDO cualquier casilla cambie de nivel, EL
  SISTEMA DEBE mantener la leyenda sin cambios: los 5 colores son siempre los mismos.

### RF-6 Actualización del mapa

- Criterio de aceptación RF-6.1 — CUANDO se registre una sesión con fecha dentro del
  rango, EL SISTEMA DEBE refrescar el mapa en el mismo refresco que la lista: total
  del día, nivel de su casilla y, si el máximo diario cambió, los niveles de todas
  las casillas.
- Criterio de aceptación RF-6.2 — CUANDO se registre una sesión con fecha futura,
  EL SISTEMA DEBE dejar la presentación del mapa sin cambios para esa fecha (RF-7.1)
  sin error alguno.
- Criterio de aceptación RF-6.3 — CUANDO la página se recargue, EL SISTEMA DEBE
  reconstruir el mapa completo desde los datos guardados, sin perder sesiones;
  ningún color, nivel ni estado del mapa se persiste entre visitas (RF-2.2).

### RF-7 Días futuros y fuera de rango

- Criterio de aceptación RF-7.1 — CUANDO la semana en curso tenga días posteriores a
  hoy, EL SISTEMA DEBE mostrar esas casillas al nivel de vacío (igual que "sin
  estudio"), sin marcarlas como futuras y sin usar las sesiones que pudieran existir
  con esas fechas.
- Criterio de aceptación RF-7.2 — CUANDO existan sesiones con fecha anterior al
  primer lunes de la ventana, EL SISTEMA NO DEBE pintarlas ni usarlas para el máximo
  diario, sin error; las sesiones fechadas exactamente en ese primer lunes sí forman
  parte del rango.
- Criterio de aceptación RF-7.3 — CUANDO se calcule el total T del día y el máximo
  diario M, EL SISTEMA DEBE usar únicamente sesiones con fecha dentro de la ventana
  y sin fechas futuras, en línea con las reglas del proyecto.

## Requisitos no funcionales

- **RNF-1 — Móvil primero**: a 375 px de ancho el mapa debe caber sin scroll
  horizontal: las casillas se reducen de tamaño entre columnas, no se cortan.
- **RNF-2 — Interpretación visual**: los 4 niveles de estudio y el vacío deben
  distinguirse a simple vista y la correspondencia con la leyenda debe ser inequívoca.
- **RNF-3 — Coste cero (constitución)**: sin dependencias nuevas, frameworks ni paso
  de build; abrir la página con doble clic debe bastar.
- **RNF-4 — Lógica separada (constitución nº 3)**: los cálculos del mapa (ventana de
  12 semanas, totales del día, máximo diario y niveles con sus bordes) son funciones
  puras, sin DOM ni almacenamiento, que reciben "hoy" como parámetro; ningún requisito
  de este documento obliga a que un cálculo ocurra dentro del pintado de la interfaz.
- **RNF-5 — Datos sagrados (constitución nº 5)**: no tocar la forma de los datos
  guardados: el mapa se deriva de lo ya existente. Ante datos corruptos, las sesiones
  individualmente no interpretables se omiten de los cálculos, el resto se muestra y
  no se borra ni altera nada en el almacenamiento.

## Casos límite

- **Mapa con todo vacío** (M = 0): 84 casillas de vacío, sin proporciones ni errores.
- **Todo al máximo**: las casillas con estudio todas en nivel 4, leyenda estable
  (RF-2.4).
- **Máximo compartido**: los días empatados con el máximo diario acaban en nivel 4
  (RF-2.3).
- **Récord nuevo dentro del rango**: recálculo de todos los niveles en el mismo
  refresco del guardado (RF-2.2); no se reordena ni se modifica ninguna sesión.
- **Hoy es lunes**: la columna de la semana en curso muestra sus 7 casillas con solo
  hoy dentro del rango (1 día completo a la izquierda sin contar); el resto vacías.
- **Hoy es domingo**: columna en curso completa con hoy al final (RF-1.2).
- **Sesión en el primer lunes de la ventana**: cuenta para el mapa y el máximo diario
  (RF-7.2); la del día inmediatamente anterior, no.
- **Sesiones más antiguas que el rango**: ignoradas en el mapa y en M, sin error ni
  aviso en consola.
- **Sesiones con fecha futura**: no pintadas ni usadas para T o M; el guardado no
  falla (RF-6.2, RF-7.1).
- **Día con varias sesiones**: el tooltip y el nivel usan el total del día (RF-2.3
  acumula; RF-4.3).
- **Datos corruptos parciales**: las sesiones no interpretables no bloquean ni el
  mapa ni el resto de la página (RNF-5).
- **Minutos decimales en los datos**: el cálculo de niveles no lo asume; el
  formulario garantiza enteros (decisión registrada).
- **Cruce de medianoche / cambio de reloj con la pestaña abierta**: fuera de alcance
  v1 (decisión registrada); el mapa correcto reaparece en la próxima carga o guardado.

## Fuera de alcance (versión 001)

- Clic en una casilla para ver o filtrar las sesiones de ese día.
- Tooltip a medida para móvil (con tap): el tooltip nativo hace lo que haga.
- Etiquetas de los meses sobre las columnas de semanas.
- Navegar a semanas anteriores (flechas) o elegir otro rango que no sea de 12 semanas.
- Leyenda interactiva u ocultar niveles desde la leyenda.
- Actualización en vivo tras cruzar medianoche o tras cambios de reloj del sistema
  con la pestaña abierta.
- Cambios en otros elementos de la página (rachas, semana, mes, lista).

## Criterios de finalización

- Todos los RF con sus criterios de aceptación verificados, con el catálogo completo
  de casos límite listado más arriba.
- Lógica verificada con `node --test` (sin paquetes) y tests en verde
  (constitución nº 4): ventana y bordes, totales, máximo diario, niveles y sus tramos.
- Interfaz verificada en el navegador con el MCP de ChromeDevTools: muestra del mapa,
  guardado y refresco, tooltip, leyenda, vista de 375 px sin scroll horizontal y
  consola sin errores.
- Funciona con doble clic desde el archivo, sin dependencias ni build (constitución).
- Los datos existentes del usuario no cambian de forma: sesiones previas intactas y
  las métricas antiguas (rachas, semana, mes) siguen siendo correctas.

## Dudas abiertas

Ninguna. Las tres dudas de la v1.0 quedaron cerradas con decisión del autor (leyenda
al pie de la tarjeta; formato horario unificado; bordes 25 %/50 %/75 % al nivel más
alto). Si durante el plan técnico surge una decisión no cubierta por esta spec, se
para y se pregunta antes de implementar (constitución nº 2).
