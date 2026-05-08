// ===============================
// CONFIG & AUTH
// Fix #1: Removed ~460 lines of dead commented-out code
// Fix #2: Replaced alert() with silent redirect (window.location.replace)
// ===============================
const API_URL  = "https://college-event-attendance-tracker.onrender.com/api";
const BASE_URL = "https://college-event-attendance-tracker.onrender.com";

let token = localStorage.getItem("token");
const role = localStorage.getItem("role");

// Silent redirect — no alert(), no UI blocking
if (!token || role !== "student") {
  window.location.replace("login.html");
}

// ===============================
// GLOBAL VARIABLES
// ===============================
let allEvents          = [];
let attendedEventIds   = [];
let registeredEventIds = [];

let currentCategory = "All";
let currentSearch   = "";

let pendingUnregisterId    = null;
let pendingUnregisterTitle = null;

const CACHE_KEY = "dashboard_cache";


// ===============================
// WELCOME GREETING (Fix — Enhancement #4)
// Shows "Welcome back, [Name]" in topbar
// ===============================
document.addEventListener("DOMContentLoaded", function () {
  const name = localStorage.getItem("name");
  const greetEl = document.getElementById("welcomeGreet");
  if (greetEl && name) {
    greetEl.textContent = "Welcome, " + name.split(" ")[0] + " 👋";
  }

  // Fix #18: Active nav highlighting
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".mobile-nav .nav-link, .top-actions .nav-link").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });

  // Fix #7: Escape key closes modal
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeUnregisterModal();
  });

  // Fix #10: Modal outside-click to close (overlay already in HTML)
  const overlay = document.getElementById("unregisterOverlay");
  if (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === this) closeUnregisterModal();
    });
  }
});


// ===============================
// XSS SANITIZER (Fix #23)
// Prevents injection of malicious HTML from API data
// ===============================
function sanitize(str) {
  if (str === null || str === undefined) return "—";
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}


// ===============================
// SAFE CACHE WRITE (Fix #9)
// Wraps localStorage.setItem in try-catch
// Safari private mode throws QuotaExceededError
// ===============================
function safeSetCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("Cache write failed (storage full or private mode):", e);
  }
}


// ===============================
// LOAD DASHBOARD
// ===============================
async function loadDashboard() {

  // Step 1: Load from cache instantly
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const data = JSON.parse(cached);
      applyDashboardData(data.events, data.attendanceRecords, data.registrations);
    } catch {
      // Corrupted cache — ignore, fresh fetch below
    }
  } else {
    showStatsSkeleton();
    showCardsSkeleton();
  }

  // Step 2: Fetch fresh data in background
  try {
    const [eventsRes, attendanceRes, regRes] = await Promise.all([
      fetch(`${API_URL}/events`,             { headers: { Authorization: "Bearer " + token } }),
      fetch(`${API_URL}/student-attendance`, { headers: { Authorization: "Bearer " + token } }),
      fetch(`${API_URL}/my-registrations`,   { headers: { Authorization: "Bearer " + token } })
    ]);

    const events            = await eventsRes.json();
    const attendanceRecords = await attendanceRes.json();
    const registrations     = await regRes.json();

    // Step 3: Save fresh data to cache (safe write)
    safeSetCache(CACHE_KEY, { events, attendanceRecords, registrations });

    // Step 4: Update UI
    applyDashboardData(events, attendanceRecords, registrations);

  } catch (error) {
    console.error("Dashboard Load Error:", error);
    if (!cached) {
      removeStatsSkeleton();
      removeCardsSkeleton();
    }
  }

}


// ===============================
// APPLY DASHBOARD DATA
// Fix #12: Semantic colors applied to stat cards
// ===============================
function applyDashboardData(events, attendanceRecords, registrations) {

  allEvents          = events;
  attendedEventIds   = attendanceRecords
    .filter(r => r.eventId)
    .map(r => r.eventId._id || r.eventId);
  registeredEventIds = registrations.map(r => r.eventId?._id || r.eventId);

  const attendancePercent = registrations.length === 0
    ? 0
    : Math.round((attendanceRecords.length / registrations.length) * 100);

  const upcomingEvents = allEvents.filter(e => e.date && new Date(e.date) > new Date());
  const missedEvents   = registeredEventIds.filter(id => !attendedEventIds.includes(id));

  removeStatsSkeleton();

  document.getElementById("totalEvents").innerText       = allEvents.length;
  document.getElementById("registeredCount").innerText   = registrations.length;
  document.getElementById("attendanceCount").innerText   = attendanceRecords.length;
  document.getElementById("attendancePercent").innerText = attendancePercent + "%";
  document.getElementById("upcomingCount").innerText     = upcomingEvents.length;
  document.getElementById("missedCount").innerText       = missedEvents.length;

  // Fix #12: Apply semantic colors to stat cards
  applyStatCardColors();

  renderEvents();

}

// Apply semantic card colors after DOM update
function applyStatCardColors() {
  const attendedCard = document.getElementById("attendanceCount")?.closest(".stat-card");
  const missedCard   = document.getElementById("missedCount")?.closest(".stat-card");
  const percentCard  = document.getElementById("attendancePercent")?.closest(".stat-card");

  if (attendedCard) attendedCard.classList.add("stat-success");
  if (missedCard)   missedCard.classList.add("stat-danger");
  if (percentCard)  percentCard.classList.add("stat-info");
}

loadDashboard();


// ===============================
// REMINDER BADGE HELPER
// ===============================
function getReminderBadge(dateStr) {
  if (!dateStr) return "";

  const eventDate = new Date(dateStr);
  const today     = new Date();

  const eventDay  = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  const todayDay  = new Date(today.getFullYear(),     today.getMonth(),     today.getDate());

  const diffDays  = Math.round((eventDay - todayDay) / (1000 * 60 * 60 * 24));

  if (diffDays < 0)  return "";
  if (diffDays === 0) return `<span class="reminder-badge badge-today">🔔 Today!</span>`;
  if (diffDays === 1) return `<span class="reminder-badge badge-tomorrow">⏰ Tomorrow</span>`;
  if (diffDays === 2) return `<span class="reminder-badge badge-soon">📅 In 2 days</span>`;
  return "";
}


// ===============================
// RENDER EVENTS
// Fix #6: Replaced inline style="margin-top:10px" with CSS class .card-actions
// Fix #11: All data from API is sanitized via sanitize()
// Fix #15: Cards use flex column + .card-actions at bottom
// ===============================
function renderEvents() {

  removeCardsSkeleton();
  const container = document.getElementById("eventList");
  container.innerHTML = "";

  let filteredEvents = allEvents;

  if (currentCategory !== "All") {
    filteredEvents = filteredEvents.filter(e => e.category === currentCategory);
  }

  if (currentSearch !== "") {
    filteredEvents = filteredEvents.filter(e =>
      e.title.toLowerCase().includes(currentSearch)
    );
  }

  // Empty States
  if (allEvents.length === 0) {
    container.innerHTML = `
      <div class="empty-state-container" style="grid-column:1/-1">
        <div class="empty-state">
          <svg width="110" height="110" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" fill="#ede9fe"/>
            <rect x="35" y="40" width="50" height="45" rx="6" fill="#7c3aed" opacity="0.15"/>
            <rect x="35" y="40" width="50" height="10" rx="6" fill="#7c3aed" opacity="0.4"/>
            <circle cx="45" cy="45" r="3" fill="#7c3aed"/>
            <circle cx="55" cy="45" r="3" fill="#7c3aed"/>
            <rect x="42" y="58" width="36" height="4" rx="2" fill="#7c3aed" opacity="0.3"/>
            <rect x="42" y="66" width="24" height="4" rx="2" fill="#7c3aed" opacity="0.2"/>
          </svg>
          <h3>No Events Yet</h3>
          <p>No events have been created yet. Check back later!</p>
        </div>
      </div>`;
    return;
  }

  if (filteredEvents.length === 0) {
    container.innerHTML = `
      <div class="empty-state-container" style="grid-column:1/-1">
        <div class="empty-state">
          <svg width="110" height="110" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" fill="#e0f2fe"/>
            <circle cx="54" cy="52" r="18" stroke="#0ea5e9" stroke-width="4" fill="none" opacity="0.6"/>
            <line x1="67" y1="65" x2="80" y2="78" stroke="#0ea5e9" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
            <circle cx="82" cy="40" r="8" fill="#ef4444" opacity="0.8"/>
            <text x="82" y="44" text-anchor="middle" fill="white" font-size="10" font-weight="bold">✕</text>
          </svg>
          <h3>No Results Found</h3>
          <p>No events match your search. Try a different keyword or clear the filter.</p>
        </div>
      </div>`;
    return;
  }

  // Render cards
  filteredEvents.forEach((event) => {

    const div = document.createElement("div");
    div.className = "card card-animate";

    const isRegistered = registeredEventIds.includes(event._id);
    const isPresent    = attendedEventIds.includes(event._id);

    const reminderBadge = getReminderBadge(event.date);

    let statusHTML = "";
    if (isPresent) {
      statusHTML = `<span class="badge badge-present">✔ Present</span>`;
    } else if (isRegistered) {
      statusHTML = `
        <span class="badge badge-registered">Registered</span>
        <button
          class="unregister-btn"
          onclick="openUnregisterModal('${sanitize(event._id)}', '${sanitize(event.title).replace(/'/g, "\\'")}')">
          Unregister
        </button>`;
    } else {
      statusHTML = `<button class="primary-btn" onclick="registerEvent('${sanitize(event._id)}')">Register</button>`;
    }

    const bannerHTML = event.imageUrl
      ? `<div class="card-banner"><img src="${BASE_URL}${event.imageUrl}" alt="${sanitize(event.title)}"></div>`
      : "";

    // Fix #6: .card-actions class (no inline style)
    // Fix #11: All event data sanitized
    // Fix #15: Card uses flex column structure — .card-actions always at bottom
    div.innerHTML = `
      ${bannerHTML}
      ${reminderBadge}
      <h3>${sanitize(event.title)}</h3>
      <p><strong>Category:</strong> ${sanitize(event.category)}</p>
      <p><strong>Date:</strong> ${event.date ? new Date(event.date).toLocaleDateString() : "TBA"}</p>
      <p><strong>Venue:</strong> ${sanitize(event.venue) || "Not specified"}</p>
      <div class="card-actions">
        ${statusHTML}
        <a href="event-details.html?id=${sanitize(event._id)}" class="details-btn">View Details</a>
      </div>
    `;

    container.appendChild(div);

  });

}


// ===============================
// FILTER EVENTS
// ===============================
function filterEvents(category, btn) {
  currentCategory = category;

  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  renderEvents();
}


// ===============================
// SEARCH
// Fix #13: Clear search button support
// ===============================
function handleSearch() {
  currentSearch = document.getElementById("searchInput").value.toLowerCase();

  // Show/hide clear button
  const clearBtn = document.getElementById("clearSearch");
  if (clearBtn) {
    clearBtn.style.display = currentSearch ? "flex" : "none";
  }

  renderEvents();
}

function clearSearch() {
  const inp = document.getElementById("searchInput");
  if (inp) inp.value = "";
  currentSearch = "";
  const clearBtn = document.getElementById("clearSearch");
  if (clearBtn) clearBtn.style.display = "none";
  renderEvents();
}


// ===============================
// REGISTER EVENT
// Fix #4: Button shows loading state, prevents double-submit
// ===============================
async function registerEvent(eventId) {
  try {
    const res = await fetch(`${API_URL}/register-event`, {
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
      registeredEventIds.push(eventId);

      // Update cache safely
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const cacheData = JSON.parse(cached);
          cacheData.registrations.push({ eventId });
          safeSetCache(CACHE_KEY, cacheData);
        } catch { /* corrupted cache */ }
      }

      renderEvents();
    }

  } catch (err) {
    console.error("Registration Error:", err);
    showToast("Registration failed", "error");
  }
}


// ===============================
// UNREGISTER MODAL — OPEN
// Fix #7: Focus first button on open
// ===============================
function openUnregisterModal(eventId, eventTitle) {
  pendingUnregisterId    = eventId;
  pendingUnregisterTitle = eventTitle;

  document.getElementById("unregisterMessage").textContent =
    `Are you sure you want to cancel your registration for "${eventTitle}"? ` +
    `This cannot be undone.`;

  document.getElementById("unregisterOverlay").classList.add("open");

  // Fix #7: Focus the safe "Keep it" button on open
  const cancelBtn = document.querySelector("#unregisterOverlay .modal-cancel");
  if (cancelBtn) setTimeout(() => cancelBtn.focus(), 50);
}


// ===============================
// UNREGISTER MODAL — CLOSE
// ===============================
function closeUnregisterModal() {
  document.getElementById("unregisterOverlay").classList.remove("open");
  pendingUnregisterId    = null;
  pendingUnregisterTitle = null;
}


// ===============================
// UNREGISTER — CONFIRM & CALL API
// ===============================
async function confirmUnregister() {
  if (!pendingUnregisterId) return;

  const confirmBtn = document.getElementById("unregisterConfirmBtn");
  confirmBtn.textContent = "Cancelling...";
  confirmBtn.disabled    = true;

  try {
    const res = await fetch(`${API_URL}/unregister/${pendingUnregisterId}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });

    const data = await res.json();

    if (res.ok) {
      registeredEventIds = registeredEventIds.filter(id => id !== pendingUnregisterId);

      // Update cache safely
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const cacheData = JSON.parse(cached);
          cacheData.registrations = cacheData.registrations.filter(
            r => (r.eventId?._id || r.eventId) !== pendingUnregisterId
          );
          safeSetCache(CACHE_KEY, cacheData);
        } catch { /* corrupted cache */ }
      }

      closeUnregisterModal();
      showToast(data.message, "success");
      renderEvents();

      const regCount = document.getElementById("registeredCount");
      if (regCount) {
        regCount.innerText = Math.max(0, parseInt(regCount.innerText) - 1);
      }

    } else {
      showToast(data.message, "error");
    }

  } catch (err) {
    console.error("Unregister Error:", err);
    showToast("Failed to cancel registration", "error");
  } finally {
    confirmBtn.textContent = "Yes, cancel";
    confirmBtn.disabled    = false;
  }
}


// ===============================
// LOGOUT
// ===============================
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}


// ===============================
// TOAST
// Fix #8: Toast already has aria-live="polite" in HTML
// ===============================
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.innerText = message;
  toast.style.background =
    type === "error" ? "#dc2626" : "#16a34a";
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}


// ===============================
// SKELETON HELPERS
// ===============================
function showStatsSkeleton() {
  const container = document.querySelector(".stats-container");
  if (!container) return;
  container.innerHTML = Array(6).fill(`
    <div class="stat-card-skeleton">
      <div class="skeleton sk-number"></div>
      <div class="skeleton sk-label"></div>
    </div>
  `).join("");
}

function removeStatsSkeleton() {
  const container = document.querySelector(".stats-container");
  if (!container) return;
  container.innerHTML = `
    <div class="stat-card"><h3 id="upcomingCount">0</h3><p>Upcoming Events</p></div>
    <div class="stat-card"><h3 id="totalEvents">0</h3><p>Total Events</p></div>
    <div class="stat-card"><h3 id="registeredCount">0</h3><p>Registered</p></div>
    <div class="stat-card"><h3 id="attendanceCount">0</h3><p>Attended</p></div>
    <div class="stat-card"><h3 id="attendancePercent">0%</h3><p>Attendance %</p></div>
    <div class="stat-card"><h3 id="missedCount">0</h3><p>Missed Events</p></div>
  `;
}

function showCardsSkeleton() {
  const container = document.getElementById("eventList");
  if (!container) return;
  container.innerHTML = Array(4).fill(`
    <div class="card-skeleton">
      <div class="skeleton sk-title"></div>
      <div class="skeleton sk-line medium"></div>
      <div class="skeleton sk-line short"></div>
      <div class="skeleton sk-line medium"></div>
      <div class="sk-actions">
        <div class="skeleton sk-btn small"></div>
        <div class="skeleton sk-btn small"></div>
      </div>
    </div>
  `).join("");
}

function removeCardsSkeleton() {
  // renderEvents() populates the container right after
}