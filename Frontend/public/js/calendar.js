const API_URL = "https://college-event-attendance-tracker.onrender.com/api";
const token   = localStorage.getItem("token");
const role    = localStorage.getItem("role");

// ===============================
// AUTH CHECK
// ===============================
if (!token || role !== "student") {
  // Fix #2: Silent redirect — no alert()
  window.location.replace("login.html");
}


// ===============================
// LOGOUT
// ===============================
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}


// ===============================
// GLOBALS
// ===============================
const today        = new Date();
let curYear        = today.getFullYear();
let curMonth       = today.getMonth();
let allEvents      = [];
let registeredIds  = new Set();
let attendedIds    = new Set();
let selectedDay    = null;


// ===============================
// CATEGORY → CSS CLASS
// ===============================
const catClass = {
  "Tech":      "chip-tech",
  "Non-Tech":  "chip-nontech",
  "Sports":    "chip-sports",
  "Yugantar":  "chip-cultural",
  "Gyanotsav": "chip-other"
};


// ===============================
// LOAD ALL DATA
// ===============================
async function loadCalendar() {
  try {
    const headers = { Authorization: "Bearer " + token };

    const [eventsRes, regRes, attRes] = await Promise.all([
      fetch(`${API_URL}/events`,             { headers }),
      fetch(`${API_URL}/my-registrations`,   { headers }),
      fetch(`${API_URL}/student-attendance`, { headers })
    ]);

    allEvents = await eventsRes.json();

    const registrations = await regRes.json();
    registeredIds = new Set(registrations.map(r => r.eventId?._id || r.eventId));

    const attendance = await attRes.json();
    attendedIds = new Set(
      attendance
        .filter(a => a.eventId)
        .map(a => a.eventId._id || a.eventId)
    );

    renderCalendar();

  } catch (error) {
    console.error("Calendar Load Error:", error);
    showToast("Failed to load calendar", "error");
  }
}


// ===============================
// RENDER CALENDAR GRID
// ===============================
function renderCalendar() {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  document.getElementById("calMonthTitle").textContent =
    months[curMonth] + " " + curYear;

  const firstDay  = new Date(curYear, curMonth, 1).getDay();
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const prevMonthDays = new Date(curYear, curMonth, 0).getDate();

  // Build map: day → events in this month
  const eventMap = {};
  allEvents.forEach(e => {
    if (!e.date) return;
    const d = new Date(e.date);
    if (d.getFullYear() === curYear && d.getMonth() === curMonth) {
      const key = d.getDate();
      if (!eventMap[key]) eventMap[key] = [];
      eventMap[key].push(e);
    }
  });

  const grid = document.getElementById("calGrid");
  grid.innerHTML = "";

  // ── Previous month trailing days ──
  for (let i = 0; i < firstDay; i++) {
    const day = prevMonthDays - firstDay + 1 + i;
    grid.appendChild(buildDayCell(day, true, []));
  }

  // ── Current month days ──
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday =
      d === today.getDate() &&
      curMonth === today.getMonth() &&
      curYear === today.getFullYear();
    grid.appendChild(buildDayCell(d, false, eventMap[d] || [], isToday));
  }

  // ── Next month leading days ──
  const totalCells = firstDay + daysInMonth;
  const remainder  = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remainder; i++) {
    grid.appendChild(buildDayCell(i, true, []));
  }
}


// ===============================
// BUILD A SINGLE DAY CELL
// ===============================
function buildDayCell(dayNum, isOtherMonth, events, isToday = false) {
  const cell = document.createElement("div");
  cell.className = "cal-day" +
    (isOtherMonth ? " other-month" : "") +
    (isToday ? " today" : "") +
    (events.length ? " has-events" : "");

  if (!isOtherMonth && events.length) {
    cell.addEventListener("click", () => selectDay(dayNum, events));
  }

  // Day number
  const numEl = document.createElement("div");
  numEl.className = "day-num";
  numEl.textContent = dayNum;
  cell.appendChild(numEl);

  if (!isOtherMonth) {
    // Event chips — max 2 visible
    const visible = events.slice(0, 2);
    visible.forEach(e => {
      const chip = document.createElement("div");
      const cls  = catClass[e.category] || "chip-other";
      const isReg = registeredIds.has(e._id);
      chip.className = `event-chip ${cls}${isReg ? " chip-registered" : ""}`;
      chip.textContent = e.title;
      chip.title = e.title;
      chip.addEventListener("click", ev => {
        ev.stopPropagation();
        selectDay(dayNum, events);
      });
      cell.appendChild(chip);
    });

    if (events.length > 2) {
      const more = document.createElement("div");
      more.className = "more-chip";
      more.textContent = `+${events.length - 2} more`;
      cell.appendChild(more);
    }
  }

  return cell;
}


// ===============================
// SELECT A DAY — SHOW DETAIL PANEL
// ===============================
function selectDay(dayNum, events) {
  selectedDay = dayNum;

  // Highlight selected cell
  document.querySelectorAll(".cal-day").forEach(c => c.classList.remove("selected"));
  const allCells = document.querySelectorAll(".cal-day:not(.other-month)");
  if (allCells[dayNum - 1]) allCells[dayNum - 1].classList.add("selected");

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const panel = document.getElementById("detailPanel");
  const body  = document.getElementById("detailBody");
  document.getElementById("detailTitle").textContent =
    `Events — ${dayNum} ${months[curMonth]} ${curYear}`;

  if (!events.length) {
    body.innerHTML = `<div class="detail-empty">No events on this day.</div>`;
  } else {
    body.innerHTML = events.map(e => buildDetailRow(e)).join("");
  }

  panel.style.display = "block";

  // Scroll into view on mobile
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}


// ===============================
// BUILD DETAIL ROW
// ===============================
function buildDetailRow(e) {
  const cls        = catClass[e.category] || "chip-other";
  const isAttended = attendedIds.has(e._id);
  const isReg      = registeredIds.has(e._id);
  const dateStr    = e.date
    ? new Date(e.date).toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" })
    : "TBA";

  let actionHTML = "";
  if (isAttended) {
    actionHTML = `<span class="reg-status-badge present">✔ Attended</span>`;
  } else if (isReg) {
    actionHTML = `<span class="reg-status-badge registered">Registered</span>`;
  } else {
    actionHTML = `<button class="register-chip-btn" onclick="registerFromCalendar('${e._id}', this)">Register</button>`;
  }

  return `
    <div class="detail-event-row">
      <div class="detail-cat-badge event-chip ${cls}">${e.category}</div>
      <div class="detail-info">
        <div class="detail-title">${e.title}</div>
        <div class="detail-meta">📅 ${dateStr}</div>
        <div class="detail-meta">📍 ${e.venue || "Venue TBA"}</div>
      </div>
      <div class="detail-actions">${actionHTML}</div>
    </div>
  `;
}


// ===============================
// REGISTER FROM CALENDAR
// ===============================
async function registerFromCalendar(eventId, btn) {
  btn.disabled  = true;
  btn.textContent = "...";

  try {
    const res  = await fetch(`${API_URL}/register-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ eventId })
    });

    const data = await res.json();
    showToast(data.message, res.ok ? "success" : "error");

    if (res.ok) {
      registeredIds.add(eventId);
      renderCalendar();
      // Refresh detail panel for the same day
      const eventsOnDay = allEvents.filter(e => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d.getDate() === selectedDay &&
               d.getMonth() === curMonth &&
               d.getFullYear() === curYear;
      });
      if (selectedDay !== null) selectDay(selectedDay, eventsOnDay);
    } else {
      btn.disabled = false;
      btn.textContent = "Register";
    }

  } catch (error) {
    console.error("Register Error:", error);
    btn.disabled = false;
    btn.textContent = "Register";
    showToast("Registration failed", "error");
  }
}


// ===============================
// CLOSE DETAIL PANEL
// ===============================
function closeDetail() {
  document.getElementById("detailPanel").style.display = "none";
  document.querySelectorAll(".cal-day").forEach(c => c.classList.remove("selected"));
  selectedDay = null;
}


// ===============================
// MONTH NAVIGATION
// ===============================
function changeMonth(dir) {
  curMonth += dir;
  if (curMonth > 11) { curMonth = 0; curYear++; }
  if (curMonth < 0)  { curMonth = 11; curYear--; }
  closeDetail();
  renderCalendar();
}

function goToToday() {
  curYear  = today.getFullYear();
  curMonth = today.getMonth();
  closeDetail();
  renderCalendar();
}


// ===============================
// TOAST
// ===============================
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.style.borderLeftColor = type === "error" ? "#dc2626" : "#16a34a";
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}


// ===============================
// INIT
// ===============================
loadCalendar();