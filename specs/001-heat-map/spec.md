# Especificación — Mapa de calor de estudio (001-heat-map)

Estado: borrador activo
Versión: 1.0 · fecha: 2026-10-24
Cumple la constitución del proyecto (docs/constitution.md): simplicidad, lógica separada
de interfaz, datos del usuario sagrados, interfaz en español.

## Contexto y objetivo

Hoy el Diario de Estudio motiva con la racha actual, la mejor racha, los minutos de la
semana y la lista de sesiones. Lo que no enseña es la **tendencia**: si el estudio es
constante o va en picado, y qué tan intensos fueron los días pasados.

El objetivo de esta versión es un **mapa de calor de estudio**: una rejilla compacta de
los últimos meses donde cada casilla es un día; el color muestra si se estudió y, dentro
de los días estudiados, cuántos minutos, según la idea original: "más minutos estudiados,
más intenso el color del día". Es la primera versión del mapa y debe ser simple.

## Decisiones registradas (preguntadas al usuario)

- Rango: **últimas 12 semanas** (fijó la pregunta 1).
- Intensidad: **niveles relativos al máximo** diario del rango (pregunta 2).
- Interactividad: **tooltip nativo** del navegador, nada especial en móvil (pregunta 3).
- Paleta: **naranja de la app** (pregunta 4).
- Alcance: **con leyenda**; clic-in-days y etiquetas de mes quedan fuera (pregunta 5).

## Usuarios

- **El estudiante usuario único** que registra sus sesiones en la web y revisa su
  progreso en el ordenador y en el móvil. Es la misma persona que ya usa las rachas.

## Historias de usuario

- **HU-1**: Como estudiante, quiero ver de un vistazo en qué días de las últimas
  12 semanas estudié, para comprobar mi constancia de meses de vida.
- **HU-2**: Como estudiante, quiero que el color de cada día diga cuánto estudié
  (más intenso = más minutos), para identificar mis días fuertes sin leer cifras.
- **HU-3**: Como estudiante, quiero pasar el ratón por un día y ver sus minutos y
  su fecha, para valorar un día concreto sin abrir la lista de sesiones.
- **HU-4**: Como estudiante nuevo del mapa, quiero una leyenda que explique los
  colores, para interpretarlo sin ayuda.
- **HU-5**: Como estudiante, quiero que el mapa se actualice cuando registro una
  sesión, para ver mi constancia nada más terminar de guardar.

## Requisitos funcionales y criterios de aceptación (EARS)

### RF-1 Ventana del mapa

La ventana cubre las **12 últimas semanas**: la semana en curso (que incluye hoy) y las
11 anteriores. Cada columna es una semana de lunes a domingo; las filas son los días de
la semana; el orden es de la semana más antigua (izquierda) a la más reciente (derecha).

- Criterio de aceptación RF-1.1 — CUANDO la página se muestre con historial en blanco,
  EL SISTEMA DEBE representar 84 casillas correspondientes a las 12 semanas
  (lunes a domingo), todas vacías.
- Criterio de aceptación RF-1.2 — CUANDO hoy sea un domingo, EL SISTEMA DEBE presentar
  la columna de la semana en curso completa, con hoy como última casilla.
- Criterio de aceptación RF-1.3 — EL SISTEMA DEBE incluir hoy en el mapa y debe
  colocarlo en la columna de la semana en curso, independientemente de la hora del día.

### RF-2 Intensidad del color

El nivel se determina con 4 niveles de intensidad **relativos al máximo** de minutos
estudiados en un solo día dentro del rango (el "máximo diario"). Un día del rango con total T de minutos estudia un nivel entre 0 y 4 según su proporción
respecto al máximo diario:

- nivel 0 (vacío): día con 0 minutos;
- nivel 1 (suave): T está en el cuartil más bajo de lo proporcional al máximo
  (hasta un 25 % del máximo diario);
- nivel 2 (medio): de un 25 % a la mitad del máximo diario;
- nivel 3 (fuerte): de la mitad a los tres cuartos;
- nivel 4 (máximo): más de tres cuartos, incluido el día máximo.

- Criterio de aceptación RF-2.1 — CUANDO el máximo diario del rango sea M ≥ 1 y un día
  tenga total T, EL SISTEMA DEBE asignar el nivel por tramos de M: (0,1-25 %,25-50 %,
  50-75 %,75-100 %], con el día máximo siempre en nivel 4.
- Criterio de aceptación RF-2.2 — CUANDO un día bata récord de minutos (T nuevo
  máximo), EL SISTEMA DEBE recalcular los niveles del mapa tras el cambio: ningún
  elemento del color se guarda entre visitas; el nivel se deriva siempre de los datos.
- Criterio de aceptación RF-2.3 — CUANDO dos o más días empaten con el máximo diario,
  EL SISTEMA DEBE pintarlos todos con nivel 4.

### RF-3 Días sin estudio del rango

- Criterio de aceptación RF-3.1 — CUANDO un día del rango no tenga ninguna sesión,
  EL SISTEMA DEBE mostrar su casilla con el color de vacío, claramente distinguido del
  color más bajo de los días con estudio.
- Criterio de aceptación RF-3.2 — SI el máximo diario del rango es 0 (ningún día
  estudiado en las 12 semanas), EL SISTEMA DEBE mostrar todas las casillas vacías,
  sin intentar calcular proporciones.

### RF-4 Tooltip del día

- Criterio de aceptación RF-4.1 — CUANDO el cursor pase sobre la casilla de un día con
  sesión, EL SISTEMA DEBE mostrarla, con el mecanismo de tooltip nativo del navegador,
  un texto con el total de minutos del día y su fecha en formato español
  (por ejemplo, "60 min · sáb, 24 oct 2026").
- Criterio de aceptación RF-4.2 — CUANDO el cursor pase sobre la casilla de un día sin
  estudio, EL SISTEMA NO DEBE requerir que se muestre texto adicional (el nivel vacío
  ya lo comunica).

### RF-5 Leyenda

- Criterio de aceptación RF-5.1 — EL SISTEMA DEBE mostrar junto al mapa una leyenda con
  5 muestras de color (vacío y los 4 niveles de estudio) y los textos "menos" y "más"
  indicando la dirección de la intensidad.
- Criterio de aceptación RF-5.2 — CUANDO el mapa cambie de nivel cualquier casilla,
  EL SISTEMA DEBE mantener la leyenda estable (los 5 colores, siempre los mismos).

### RF-6 Actualización del mapa

- Criterio de aceptación RF-6.1 — CUANDO se registre una sesión con fecha dentro del
  rango, EL SISTEMA DEBE refrescar el mapa inmediatamente: total del día, su nivel y,
  si corresponde, los niveles de todos los días (por el cambio del máximo diario).
- Criterio de aceptación RF-6.2 — CUANDO se registre una sesión con fecha futura,
  EL SISTEMA DEBE dejar el mapa tal estaba para esa fecha (ver RF-7), sin fallar.
- Criterio de aceptación RF-6.3 — CUANDO la página se recargue, EL SISTEMA DEBE volver
  a construir el mapa con los datos guardados tal cual quedaron, sin perder sesiones
  ni estados.

### RF-7 Días futuros y fuera de rango

- Criterio de aceptación RF-7.1 — CUANDO la semana en curso tenga días posteriores a
  hoy, EL SISTEMA DEBE mostrarlos como casillas vacías (igual que "sin estudio"),
  sin marcarlos como futuros ni calcularlos con los datos guardados.
- Criterio de aceptación RF-7.2 — CUANDO existan sesiones con fecha anterior a las
  12 semanas del rango, EL SISTEMA NO DEBE pintarlas en el mapa y NO DEBE usarlas
  para calcular el máximo diario, sin ningún error; seguirán afectando a las rachas
  ya existentes, que no forman parte de este mapa.
- Criterio de aceptación RF-7.3 — CUANDO el total del día considere la proporción del
  nivel, EL SISTEMA DEBE usar únicamente sesiones con fecha del rango, sin fechas
  futuras, en línea con las reglas del proyecto.

## Requisitos no funcionales

- **RNF-1 — Móvil primero**: a 375 px de ancho el mapa debe caber sin scroll
  horizontal; las casillas se reducen de tamaño entre las columnas, no se cortan.
- **RNF-2 — Interpretación visual**: los 4 niveles de estudio y el vacío deben
  distinguirse a simple vista, sin conocerlos previamente, y la relación con la leyenda
  debe ser inequívoca.
- **RNF-3 — Coste cero por decisión de constitución**: nada nuevo de dependencias,
  frameworks o impresión/paso de build; abrir la página con doble clic debe bastar.
- **RNF-4 — Lógica comprobable**: los cálculos del mapa (tramos del nivel, ventana de
  12 semanas, totales del día) serán comprobables sin interfaz, con "hoy" como
  parámetro, según la constitución.
- **RNF-5 — Datos sagrados**: no cambiar la forma de los datos guardados; el mapa se
  deriva de lo que ya existe. Si los datos guardados vinieran corruptos, el mapa debe
  mostrar correctamente lo que sea interpretable (vacío) sin bloquear la página y sin
  borrar o alterar nada en el almacenamiento.

## Casos límite

- **Mapa con todo vacío**: nunca hay proporciones ni errores, 84 casillas de vacío.
- **Máximo compartido**: dos días con el mismo máximo → ambos en nivel 4.
- **Récord nuevo dentro del rango**: recálculo de niveles (RF-2.2); el mapa nunca
  reordena sesiones ni datos ya guardados.
- **Hoy es lunes**: la semana en curso solo contiene hoy, la columna no puede romper
  el mapa (columna de 1 día con 6 casillas vacías más el … hoy es la 1 casilla: la
  semana en curso siempre muestra sus 7 casillas, con hoy incluido).
- **Sesiones más antiguas que el rango**: ignoradas en el mapa y el cálculo del máximo
  (RF-7.2), sin error ni en consola.
- **Sesiones con fecha futura**: ignoradas del cálculo del nivel y el máximo diario
  (RF-6.2), en línea con las reglas del proyecto.
- **Empate del tooltip con días de varias sesiones**: si el día acumula varias sesiones,
  el tooltip muestra el total del día, no cada sesión por separado.

## Fuera de alcance (versión 001)

- Clic en una casilla para ver o filtrar las sesiones de ese día.
- Tooltip a medida para móvil (con tap); el tooltip nativo hace lo que haga en móvil.
- Etiquetas de los meses sobre las columnas de semanas.
- Navegar a semanas anteriores (flechas) o elegir un rango distinto de 12 semanas.
- Leyenda interactiva u ocultar niveles con clic en la leyenda.
- Cambios en el mapa de otros elementos de la página (rachas, semana, lista).

## Criterios de finalización

- Todos los RF con sus criterios de aceptación verificados, incluyendo todo el
  catálogo de casos límite listados.
- Vista del mapa verificada en móvil (375 px de ancho) sin scroll horizontal y con la
  consola del navegador sin errores.
- Funciona con doble clic desde el archivo, sin dependencias ni build (constitución).
- Los cálculos del mapa están comprobados con el marco de tests del proyecto
  (node --test, sin paquetes), con tests en verde (constitución).
- Los datos existentes del usuario no cambian de forma: sesiones previas intactas y
  todas las métricas antiguas (rachas, semana, mes) siguen siendo correctas.

## Dudas abiertas

- [NECESITA ACLARACIÓN] Ubicación de la leyenda: dentro de la misma tarjeta del mapa
  (fila inferior) o aparte/en otra tarjeta. Recomiendo dentro, al pie.
- [NECESITA ACLARACIÓN] Texto exacto del tooltip para el singular ("1 min · …") frente
  al formato horario usado en la fila semanal ("1 h 15 min"): ¿unificar con el formato
  horario ya usado o minutos secos siempre? Recomiendo el horario unificado.
- [NECESITA ACLARACIÓN] Redondeo del nivel 1 (25 %): la bandera <= 25 % del máximo
  incluye el día con exactamente un cuarto del máximo diario. Es una convención de
  tramo; quedaría confirmada al escribir los tests.
