// Clave con la que guardamos las sesiones en localStorage.
const CLAVE = "diarioDeEstudio.sesiones";

// Elementos de la página.
const formulario = document.getElementById("formulario");
const campoFecha = document.getElementById("fecha");
const campoTema = document.getElementById("tema");
const campoMinutos = document.getElementById("minutos");
const listaSesiones = document.getElementById("lista-sesiones");
const sinSesiones = document.getElementById("sin-sesiones");
const rachaNumero = document.getElementById("racha-numero");
const rachaTexto = document.getElementById("racha-texto");
const mejorRachaNumero = document.getElementById("mejor-racha-numero");
const minutosSemana = document.getElementById("minutos-semana");
const diasMes = document.getElementById("dias-mes");
const diasMesTexto = document.getElementById("dias-mes-texto");
const mapaRejilla = document.getElementById("mapa-rejilla");

// ---------------------------------------------------------------------------
// Fechas (siempre en la hora local del usuario, nunca en UTC)
// ---------------------------------------------------------------------------

// Devuelve una fecha como "AAAA-MM-DD" usando el año, mes y día locales.
// Delegan en logic-dates.js: una única fuente de verdad para las fechas.
function fechaLocalISO(fecha = new Date()) {
  return LogicDates.isoFromLocalDate(fecha);
}

// Convierte "AAAA-MM-DD" en un Date local (a las 12:00, para que los cambios
// de hora de verano/invierno no muevan el día). Delega en logic-dates.js.
function textoAFecha(texto) {
  return LogicDates.localDateFromIso(texto);
}

// Devuelve el día anterior a una fecha "AAAA-MM-DD". Delega en logic-dates.js.
function diaAnterior(texto) {
  return LogicDates.shiftDaysIso(texto, -1);
}

// Muestra una fecha "AAAA-MM-DD" en formato español, por ejemplo: "lun, 20 oct 2026".
function formatearFecha(texto) {
  return textoAFecha(texto).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Guardado y lectura en localStorage
// ---------------------------------------------------------------------------

function cargarSesiones() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE));
    if (!Array.isArray(datos)) return [];

    // Nos quedamos solo con sesiones que tengan los datos necesarios.
    return datos.filter(
      (sesion) =>
        sesion &&
        typeof sesion.fecha === "string" &&
        typeof sesion.tema === "string" &&
        typeof sesion.minutos === "number"
    );
  } catch (error) {
    console.warn("No se pudieron leer las sesiones guardadas.", error);
    return [];
  }
}

function guardarSesiones() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(sesiones));
  } catch (error) {
    console.warn("No se pudieron guardar las sesiones.", error);
  }
}

// ---------------------------------------------------------------------------
// Racha
// ---------------------------------------------------------------------------

// Cuenta los días consecutivos con al menos una sesión, terminando en hoy.
// Si hoy aún no hay sesión pero ayer sí, la racha sigue viva.
function calcularRacha() {
  const diasConSesion = new Set(sesiones.map((sesion) => sesion.fecha));
  const hoy = fechaLocalISO();

  let dia = hoy;

  if (!diasConSesion.has(hoy)) {
    const ayer = diaAnterior(hoy);
    if (!diasConSesion.has(ayer)) return 0;
    dia = ayer;
  }

  let racha = 0;
  while (diasConSesion.has(dia)) {
    racha++;
    dia = diaAnterior(dia);
  }

  return racha;
}

// Mayor racha del historial: la mayor cantidad de días consecutivos con sesión,
// contando solo hoy y días anteriores. Una racha ya rota también cuenta.
function calcularMejorRacha() {
  const hoy = fechaLocalISO();

  // Días únicos con sesión, sin fechas futuras. Ordenados así van de más
  // antiguo a más reciente. Varias sesiones el mismo día cuentan como un día.
  const diasOrdenados = [...new Set(sesiones.map((sesion) => sesion.fecha))]
    .filter((fecha) => fecha <= hoy)
    .sort();

  let mejor = 0;
  let corrida = 0;
  let diaAnteriorDelRecorrido = null;

  for (const dia of diasOrdenados) {
    // El día sigue la racha solo si es el inmediatamente posterior al anterior.
    corrida = diaAnteriorDelRecorrido === diaAnterior(dia) ? corrida + 1 : 1;
    if (corrida > mejor) mejor = corrida;
    diaAnteriorDelRecorrido = dia;
  }

  return mejor;
}

// ---------------------------------------------------------------------------
// Minutos de la semana
// ---------------------------------------------------------------------------

// Primer día de la semana (lunes) como "AAAA-MM-DD", en hora local.
function inicioDeSemana() {
  const fecha = new Date();
  const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay(); // domingo = 7
  fecha.setDate(fecha.getDate() - (diaSemana - 1));
  return fechaLocalISO(fecha);
}

// Suma los minutos estudiados de la semana en curso (del lunes a hoy),
// sin contar sesiones de fechas futuras. Varias sesiones el mismo día suman todas.
function calcularMinutosSemana() {
  const inicio = inicioDeSemana();
  const hoy = fechaLocalISO();
  let total = 0;
  for (const sesion of sesiones) {
    if (sesion.fecha >= inicio && sesion.fecha <= hoy) total += sesion.minutos;
  }
  return total;
}

// "45 min" si es menos de una hora, si no "3 h 45 min" (o "3 h" si es exacto).
function formatearMinutos(minutos) {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const restantes = minutos % 60;
  return restantes === 0 ? `${horas} h` : `${horas} h ${restantes} min`;
}

// ---------------------------------------------------------------------------
// Días del mes
// ---------------------------------------------------------------------------

// Cuenta los días distintos del mes en curso con al menos una sesión.
// El mes se saca del texto de hoy ("AAAA-MM-DD"), sin aritmética de fechas, y
// se compara como texto igual que en calcularMinutosSemana.
function calcularDiasMes() {
  const hoy = fechaLocalISO();
  const inicioMes = `${hoy.slice(0, 7)}-01`;

  const dias = new Set();
  for (const sesion of sesiones) {
    if (sesion.fecha >= inicioMes && sesion.fecha <= hoy) dias.add(sesion.fecha);
  }
  return dias.size;
}

// ---------------------------------------------------------------------------
// Mapa de calor
// ---------------------------------------------------------------------------

// Pinta la rejilla de 12 semanas a partir de la lógica pura de logic-heatmap.js.
// Cada casilla es un día: nivel 0 (vacío) o niveles 1-4 según minutos del día.
function mostrarMapa() {
  const { cells } = LogicHeatMap.buildHeatMap(sesiones, fechaLocalISO());
  mapaRejilla.innerHTML = "";

  for (const casilla of cells) {
    const elemento = document.createElement("span");
    elemento.className = `casilla-mapa nivel-${casilla.level}`;

    // Tooltip nativo solo en casillas con estudio: total del día y fecha en
    // español, usando el formato horario unificado (RF-4.1, RF-4.2, RF-4.3).
    if (casilla.hasStudy) {
      elemento.title = `${formatearMinutos(casilla.minutes)} · ${formatearFecha(casilla.date)}`;
    }

    mapaRejilla.append(elemento);
  }
}

// ---------------------------------------------------------------------------
// Mostrar datos en la página
// ---------------------------------------------------------------------------

// De la más reciente a la más antigua. Si dos sesiones son del mismo día,
// aparece primero la que se registró más tarde.
function ordenarSesiones() {
  return [...sesiones].sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
    return String(b.creadoEn || "").localeCompare(String(a.creadoEn || ""));
  });
}

function mostrarRacha() {
  const racha = calcularRacha();
  rachaNumero.textContent = racha;
  mejorRachaNumero.textContent = calcularMejorRacha();
  minutosSemana.textContent = formatearMinutos(calcularMinutosSemana());
  rachaTexto.textContent = racha === 1 ? "día seguido" : "días seguidos";

  const dias = calcularDiasMes();
  diasMes.textContent = dias;
  diasMesTexto.textContent = dias === 1 ? "día" : "días";
}

function mostrarSesiones() {
  listaSesiones.innerHTML = "";

  const ordenadas = ordenarSesiones();
  sinSesiones.classList.toggle("oculto", ordenadas.length > 0);

  for (const sesion of ordenadas) {
    const elemento = document.createElement("li");
    elemento.className = "sesion";

    const info = document.createElement("div");

    const tema = document.createElement("p");
    tema.className = "sesion-tema";
    tema.textContent = sesion.tema;

    const fecha = document.createElement("p");
    fecha.className = "sesion-fecha";
    fecha.textContent = formatearFecha(sesion.fecha);

    const minutos = document.createElement("span");
    minutos.className = "sesion-minutos";
    minutos.textContent = `${sesion.minutos} min`;

    info.append(tema, fecha);
    elemento.append(info, minutos);
    listaSesiones.append(elemento);
  }
}

// ---------------------------------------------------------------------------
// Estado y eventos
// ---------------------------------------------------------------------------

let sesiones = cargarSesiones();

// La fecha del formulario empieza en hoy, pero se puede cambiar.
campoFecha.value = fechaLocalISO();

mostrarRacha();
mostrarMapa();
mostrarSesiones();

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const fecha = campoFecha.value;
  const tema = campoTema.value.trim();
  const minutos = Number(campoMinutos.value);

  // El navegador ya valida los campos obligatorios, pero lo comprobamos también.
  if (!fecha || !tema || !Number.isFinite(minutos) || minutos <= 0) {
    formulario.reportValidity();
    return;
  }

  sesiones.push({
    id: Date.now(),
    fecha,
    tema,
    minutos,
    creadoEn: new Date().toISOString(),
  });

  guardarSesiones();
  mostrarRacha();
  mostrarMapa();
  mostrarSesiones();

  formulario.reset();
  campoFecha.value = fechaLocalISO();
  campoTema.focus();
});
