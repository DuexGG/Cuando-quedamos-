
"use strict";

// ========================================
// ¿CUÁNDO QUEDAMOS? — LÓGICA PRINCIPAL
// ========================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const months = [
  "Enero", "Febrero", "Marzo", "Abril",
  "Mayo", "Junio", "Julio", "Agosto",
  "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const weekdays = [
  "domingo", "lunes", "martes", "miércoles",
  "jueves", "viernes", "sábado"
];

const placeIcons = {
  "Campito": "⚽",
  "Dar un paseo": "🚶",
  "Casa": "🏠",
  "Parque": "🌳"
};

const today = new Date();
today.setHours(0, 0, 0, 0);

const state = {
  place: "",
  date: null,
  hour: "17",
  minute: "00",
  screen: "welcomeScreen"
};

let displayedMonth = today.getMonth();
let displayedYear = today.getFullYear();

// ========================================
// NAVEGACIÓN ENTRE PANTALLAS
// ========================================

const screens = [
  "welcomeScreen",
  "placeScreen",
  "dateScreen",
  "timeScreen",
  "resultScreen"
];

function showScreen(screenId) {
  if (!screens.includes(screenId)) return;

  state.screen = screenId;

  screens.forEach((id) => {
    const screen = document.getElementById(id);
    const isActive = id === screenId;

    screen.hidden = !isActive;
    screen.classList.toggle("active", isActive);
  });

  const step = screens.indexOf(screenId);
  const progressArea = $("#progressArea");

  progressArea.hidden = step === 0 || step === 4;

  if (step >= 1 && step <= 3) {
    $("#stepLabel").textContent = `PASO ${step} DE 3`;
    $("#progressPercent").textContent =
      `${Math.round((step / 3) * 100)}%`;
    $("#progressFill").style.width = `${(step / 3) * 100}%`;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

$("#brand").addEventListener("click", (event) => {
  event.preventDefault();
  resetApp();
});

$("#startBtn").addEventListener("click", () => {
  showScreen("placeScreen");
});

$$("[data-back]").forEach((button) => {
  button.addEventListener("click", () => {
    showScreen(button.dataset.back);
  });
});

// ========================================
// ELECCIÓN DEL LUGAR
// ========================================

$$(".place-card").forEach((card) => {
  card.addEventListener("click", () => {
    state.place = card.dataset.place;

    $$(".place-card").forEach((item) => {
      const selected = item === card;

      item.classList.toggle("selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });

    // Pasamos al calendario después de elegir el lugar.
    showScreen("dateScreen");
    renderCalendar();
  });

  card.setAttribute("aria-pressed", "false");
});

// ========================================
// CONFIGURACIÓN DEL CALENDARIO
// ========================================

function setupCalendarSelectors() {
  const monthSelect = $("#monthSelect");
  const yearSelect = $("#yearSelect");

  monthSelect.innerHTML = "";
  yearSelect.innerHTML = "";

  months.forEach((month, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = month;
    monthSelect.appendChild(option);
  });

  // Año actual y cinco años posteriores.
  // Así puedes organizar quedadas con antelación.
  for (
    let year = today.getFullYear();
    year <= today.getFullYear() + 5;
    year++
  ) {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    yearSelect.appendChild(option);
  }

  monthSelect.addEventListener("change", () => {
    displayedMonth = Number(monthSelect.value);
    renderCalendar();
  });

  yearSelect.addEventListener("change", () => {
    displayedYear = Number(yearSelect.value);
    renderCalendar();
  });

  $("#prevMonth").addEventListener("click", () => {
    changeMonth(-1);
  });

  $("#nextMonth").addEventListener("click", () => {
    changeMonth(1);
  });
}

function changeMonth(amount) {
  displayedMonth += amount;

  if (displayedMonth < 0) {
    displayedMonth = 11;
    displayedYear--;
  }

  if (displayedMonth > 11) {
    displayedMonth = 0;
    displayedYear++;
  }

  renderCalendar();
}

// Compara fechas por año, mes y día sin problemas de horas.
function sameDate(a, b) {
  return Boolean(
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isPastDate(date) {
  const candidate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  return candidate < today;
}

// ========================================
// DIBUJAR EL CALENDARIO
// ========================================

function renderCalendar() {
  const grid = $("#calendarGrid");
  grid.innerHTML = "";

  $("#monthSelect").value = String(displayedMonth);
  $("#yearSelect").value = String(displayedYear);

  // El calendario empieza en lunes.
  const firstDay = new Date(
    displayedYear,
    displayedMonth,
    1
  ).getDay();

  const offset = (firstDay + 6) % 7;

  const daysInMonth = new Date(
    displayedYear,
    displayedMonth + 1,
    0
  ).getDate();

  // Casillas vacías anteriores al día 1.
  for (let i = 0; i < offset; i++) {
    const emptyCell = document.createElement("span");
    emptyCell.className = "calendar-day empty";
    emptyCell.setAttribute("aria-hidden", "true");
    grid.appendChild(emptyCell);
  }

  // Días del mes.
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      displayedYear,
      displayedMonth,
      day
    );

    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.textContent = String(day);
    button.setAttribute(
      "aria-label",
      `${day} de ${months[displayedMonth]} de ${displayedYear}`
    );

    const isToday = sameDate(date, today);
    const isSelected = sameDate(date, state.date);
    const isPast = isPastDate(date);

    if (isToday) button.classList.add("today");

    if (isSelected) {
      button.classList.add("selected");
      button.setAttribute("aria-pressed", "true");
    } else {
      button.setAttribute("aria-pressed", "false");
    }

    button.disabled = isPast;

    if (isPast) {
      button.setAttribute("aria-disabled", "true");
    }

    button.addEventListener("click", () => {
      if (isPastDate(date)) return;

      // Guardamos la fecha seleccionada.
      state.date = new Date(
        displayedYear,
        displayedMonth,
        day
      );

      renderCalendar();
      updateDateSelection();
    });

    grid.appendChild(button);
  }

  // Navegación limitada al periodo disponible.
  const atFirstMonth =
    displayedYear === today.getFullYear() &&
    displayedMonth === today.getMonth();

  const atLastMonth =
    displayedYear === today.getFullYear() + 5 &&
    displayedMonth === 11;

  $("#prevMonth").disabled = atFirstMonth;
  $("#nextMonth").disabled = atLastMonth;
}

function updateDateSelection() {
  const info = $("#dateSelectionInfo");
  const continueButton = $("#dateContinueBtn");

  if (!state.date) {
    info.textContent = "Selecciona un día del calendario";
    continueButton.disabled = true;
    return;
  }

  const dayName = weekdays[state.date.getDay()];
  const day = state.date.getDate();
  const month = months[state.date.getMonth()];
  const year = state.date.getFullYear();

  info.textContent =
    `Has elegido: ${capitalize(dayName)}, ${day} de ${month} de ${year}`;

  continueButton.disabled = false;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

$("#dateContinueBtn").addEventListener("click", () => {
  if (!state.date || isPastDate(state.date)) return;

  showScreen("timeScreen");
  updateTimePreview();
});

// ========================================
// SELECCIÓN DE LA HORA
// ========================================

function setupTimeSelectors() {
  const hourSelect = $("#hourSelect");
  const minuteSelect = $("#minuteSelect");

  // Las 24 horas del día: 00 a 23.
  for (let hour = 0; hour < 24; hour++) {
    const value = String(hour).padStart(2, "0");
    const option = document.createElement("option");

    option.value = value;
    option.textContent = value;

    hourSelect.appendChild(option);
  }

  // Los 60 minutos, de cinco en cinco.
  for (let minute = 0; minute < 60; minute += 5) {
    const value = String(minute).padStart(2, "0");
    const option = document.createElement("option");

    option.value = value;
    option.textContent = value;

    minuteSelect.appendChild(option);
  }

  hourSelect.value = state.hour;
  minuteSelect.value = state.minute;

  hourSelect.addEventListener("change", () => {
    state.hour = hourSelect.value;
    updateTimePreview();
  });

  minuteSelect.addEventListener("change", () => {
    state.minute = minuteSelect.value;
    updateTimePreview();
  });
}

function updateTimePreview() {
  $("#timePreview").textContent =
    `${state.hour}:${state.minute}`;
}

// ========================================
// RESUMEN FINAL
// ========================================

function formatSelectedDate(date) {
  const dayName = weekdays[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${capitalize(dayName)}, ${day} de ${month} de ${year}`;
}

function createSummary() {
  if (!state.place || !state.date) return null;

  return {
    place: state.place,
    date: formatSelectedDate(state.date),
    time: `${state.hour}:${state.minute}`
  };
}

$("#finishBtn").addEventListener("click", () => {
  const summary = createSummary();

  if (!summary) {
    showScreen("placeScreen");
    return;
  }

  $("#resultIcon").textContent = placeIcons[summary.place];
  $("#resultPlace").textContent = summary.place;
  $("#resultDate").textContent = summary.date;
  $("#resultTime").textContent = summary.time;

  $("#copyBtnText").textContent = "Copiar resumen";

  showScreen("resultScreen");
});

// ========================================
// COPIAR EL RESUMEN
// ========================================

$("#copyBtn").addEventListener("click", async () => {
  const summary = createSummary();

  if (!summary) return;

  const text = [
    "📅 ¿CUÁNDO QUEDAMOS?",
    "",
    `📍 Lugar: ${summary.place}`,
    `🗓️ Fecha: ${summary.date}`,
    `🕒 Hora: ${summary.time}`
  ].join("\n");

  const buttonText = $("#copyBtnText");

  try {
    // La API del portapapeles funciona en localhost
    // o en una conexión segura HTTPS.
    if (!navigator.clipboard?.writeText) {
      throw new Error("Portapapeles no disponible");
    }

    await navigator.clipboard.writeText(text);
    buttonText.textContent = "¡Resumen copiado! ✓";
  } catch (error) {
    // Alternativa para navegadores sin acceso al portapapeles.
    const textArea = document.createElement("textarea");

    textArea.value = text;
    textArea.readOnly = true;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.select();

    const copied = document.execCommand("copy");
    textArea.remove();

    buttonText.textContent = copied
      ? "¡Resumen copiado! ✓"
      : "No se pudo copiar. Inténtalo de nuevo";
  }
});

// ========================================
// REINICIAR Y CREAR OTRA QUEDADA
// ========================================

function resetApp() {
  state.place = "";
  state.date = null;
  state.hour = "17";
  state.minute = "00";

  displayedMonth = today.getMonth();
  displayedYear = today.getFullYear();

  $$(".place-card").forEach((card) => {
    card.classList.remove("selected");
    card.setAttribute("aria-pressed", "false");
  });

  $("#hourSelect").value = state.hour;
  $("#minuteSelect").value = state.minute;
  $("#copyBtnText").textContent = "Copiar resumen";

  updateTimePreview();
  updateDateSelection();
  renderCalendar();
  showScreen("welcomeScreen");
}

$("#restartBtn").addEventListener("click", resetApp);

// ========================================
// INICIAR LA WEB
// ========================================

setupCalendarSelectors();
setupTimeSelectors();
renderCalendar();
updateDateSelection();
updateTimePreview();
showScreen("welcomeScreen");
