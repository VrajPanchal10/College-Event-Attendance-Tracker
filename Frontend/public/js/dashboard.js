// const API_URL = "http://localhost:5000/api";

// let token = localStorage.getItem("token");
// const role = localStorage.getItem("role");

// if (!token || role !== "student") {
//   alert("Unauthorized access");
//   window.location.href = "login.html";
// }


// // ===============================
// // GLOBAL VARIABLES
// // ===============================
// let allEvents          = [];
// let attendedEventIds   = [];
// let registeredEventIds = [];

// let currentCategory = "All";
// let currentSearch   = "";

// let pendingUnregisterId    = null;
// let pendingUnregisterTitle = null;


// // ===============================
// // CACHE KEY
// // ===============================
// const CACHE_KEY = "dashboard_cache";


// // ===============================
// // LOAD DASHBOARD
// // ===============================
// async function loadDashboard() {

//   // ── Step 1: Load from cache instantly ──
//   const cached = localStorage.getItem(CACHE_KEY);

//   if (cached) {
//     try {
//       const data = JSON.parse(cached);
//       applyDashboardData(data.events, data.attendanceRecords, data.registrations);
//     } catch {
//       // corrupted cache — ignore
//     }
//   } else {
//     showStatsSkeleton();
//     showCardsSkeleton();
//   }

//   // ── Step 2: Fetch fresh data in background ──
//   try {

//     const [eventsRes, attendanceRes, regRes] = await Promise.all([
//       fetch(`${API_URL}/events`,             { headers: { Authorization: "Bearer " + token } }),
//       fetch(`${API_URL}/student-attendance`, { headers: { Authorization: "Bearer " + token } }),
//       fetch(`${API_URL}/my-registrations`,   { headers: { Authorization: "Bearer " + token } })
//     ]);

//     const events            = await eventsRes.json();
//     const attendanceRecords = await attendanceRes.json();
//     const registrations     = await regRes.json();

//     // ── Step 3: Save fresh data to cache ──
//     localStorage.setItem(CACHE_KEY, JSON.stringify({
//       events,
//       attendanceRecords,
//       registrations
//     }));

//     // ── Step 4: Update UI ──
//     applyDashboardData(events, attendanceRecords, registrations);

//   } catch (error) {
//     console.error("Dashboard Load Error:", error);
//     if (!cached) {
//       removeStatsSkeleton();
//       removeCardsSkeleton();
//     }
//   }

// }


// // ===============================
// // APPLY DASHBOARD DATA
// // ===============================
// function applyDashboardData(events, attendanceRecords, registrations) {

//   allEvents          = events;
//   attendedEventIds   = attendanceRecords
//     .filter(r => r.eventId)
//     .map(r => r.eventId._id || r.eventId);
//   registeredEventIds = registrations.map(r => r.eventId);

//   const attendancePercent = registrations.length === 0
//     ? 0
//     : Math.round((attendanceRecords.length / registrations.length) * 100);

//   const upcomingEvents = allEvents.filter(e => e.date && new Date(e.date) > new Date());
//   const missedEvents   = registeredEventIds.filter(id => !attendedEventIds.includes(id));

//   removeStatsSkeleton();

//   document.getElementById("totalEvents").innerText       = allEvents.length;
//   document.getElementById("registeredCount").innerText   = registrations.length;
//   document.getElementById("attendanceCount").innerText   = attendanceRecords.length;
//   document.getElementById("attendancePercent").innerText = attendancePercent + "%";
//   document.getElementById("upcomingCount").innerText     = upcomingEvents.length;
//   document.getElementById("missedCount").innerText       = missedEvents.length;

//   renderEvents();

// }

// loadDashboard();


// // ===============================
// // REMINDER BADGE HELPER
// // — Returns HTML string or ""
// // ===============================
// function getReminderBadge(dateStr) {
//   if (!dateStr) return "";
//   const eventDate = new Date(dateStr);
//   const now       = new Date();
//   const diffHours = (eventDate - now) / (1000 * 60 * 60);

//   if (diffHours < 0)   return "";   // past event — no badge
//   if (diffHours <= 24) return `<span class="reminder-badge badge-today">🔔 Today!</span>`;
//   if (diffHours <= 48) return `<span class="reminder-badge badge-tomorrow">⏰ Tomorrow</span>`;
//   if (diffHours <= 72) return `<span class="reminder-badge badge-soon">📅 In 2 days</span>`;
//   return "";
// }


// // ===============================
// // RENDER EVENTS
// // ===============================
// function renderEvents() {

//   removeCardsSkeleton();
//   const container = document.getElementById("eventList");
//   container.innerHTML = "";

//   let filteredEvents = allEvents;

//   if (currentCategory !== "All") {
//     filteredEvents = filteredEvents.filter(e => e.category === currentCategory);
//   }

//   if (currentSearch !== "") {
//     filteredEvents = filteredEvents.filter(e =>
//       e.title.toLowerCase().includes(currentSearch)
//     );
//   }

//   // ── Empty States ──
//   if (allEvents.length === 0) {
//     container.innerHTML = `
//       <div class="empty-state-container" style="grid-column:1/-1">
//         <div class="empty-state">
//           <svg width="110" height="110" viewBox="0 0 120 120" fill="none">
//             <circle cx="60" cy="60" r="50" fill="#ede9fe"/>
//             <rect x="35" y="40" width="50" height="45" rx="6" fill="#7c3aed" opacity="0.15"/>
//             <rect x="35" y="40" width="50" height="10" rx="6" fill="#7c3aed" opacity="0.4"/>
//             <circle cx="45" cy="45" r="3" fill="#7c3aed"/>
//             <circle cx="55" cy="45" r="3" fill="#7c3aed"/>
//             <rect x="42" y="58" width="36" height="4" rx="2" fill="#7c3aed" opacity="0.3"/>
//             <rect x="42" y="66" width="24" height="4" rx="2" fill="#7c3aed" opacity="0.2"/>
//           </svg>
//           <h3>No Events Yet</h3>
//           <p>No events have been created yet. Check back later!</p>
//         </div>
//       </div>`;
//     return;
//   }

//   if (filteredEvents.length === 0) {
//     container.innerHTML = `
//       <div class="empty-state-container" style="grid-column:1/-1">
//         <div class="empty-state">
//           <svg width="110" height="110" viewBox="0 0 120 120" fill="none">
//             <circle cx="60" cy="60" r="50" fill="#e0f2fe"/>
//             <circle cx="54" cy="52" r="18" stroke="#0ea5e9" stroke-width="4" fill="none" opacity="0.6"/>
//             <line x1="67" y1="65" x2="80" y2="78" stroke="#0ea5e9" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
//             <circle cx="82" cy="40" r="8" fill="#ef4444" opacity="0.8"/>
//             <text x="82" y="44" text-anchor="middle" fill="white" font-size="10" font-weight="bold">✕</text>
//           </svg>
//           <h3>No Results Found</h3>
//           <p>No events match your search. Try a different keyword or clear the filter.</p>
//         </div>
//       </div>`;
//     return;
//   }

//   // ── Render cards ──
//   filteredEvents.forEach((event) => {

//     const div = document.createElement("div");
//     div.className = "card card-animate";

//     const isRegistered = registeredEventIds.includes(event._id);
//     const isPresent    = attendedEventIds.includes(event._id);

//     // ── Reminder badge ──
//     const reminderBadge = getReminderBadge(event.date);

//     // ── Action buttons ──
//     let statusHTML = "";
//     if (isPresent) {
//       statusHTML = `<span class="badge badge-present">✔ Present</span>`;
//     } else if (isRegistered) {
//       statusHTML = `
//         <span class="badge badge-registered">Registered</span>
//         <button
//           class="unregister-btn"
//           onclick="openUnregisterModal('${event._id}', '${event.title.replace(/'/g, "\\'")}')">
//           Unregister
//         </button>`;
//     } else {
//       statusHTML = `<button class="primary-btn" onclick="registerEvent('${event._id}')">Register</button>`;
//     }

//     div.innerHTML = `
//       ${reminderBadge}
//       <h3>${event.title}</h3>
//       <p><strong>Category:</strong> ${event.category}</p>
//       <p><strong>Date:</strong> ${event.date ? new Date(event.date).toLocaleDateString() : "TBA"}</p>
//       <p><strong>Venue:</strong> ${event.venue || "Not specified"}</p>
//       <div style="margin-top:10px">
//         ${statusHTML}
//         <a href="event-details.html?id=${event._id}" class="details-btn">View Details</a>
//       </div>
//     `;

//     container.appendChild(div);

//   });

// }


// // ===============================
// // FILTER EVENTS
// // ===============================
// function filterEvents(category, btn) {
//   currentCategory = category;

//   document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
//   if (btn) btn.classList.add("active");

//   renderEvents();
// }


// // ===============================
// // SEARCH
// // ===============================
// function handleSearch() {
//   currentSearch = document.getElementById("searchInput").value.toLowerCase();
//   renderEvents();
// }


// // ===============================
// // REGISTER EVENT
// // ===============================
// async function registerEvent(eventId) {
//   try {
//     const res = await fetch(`${API_URL}/register-event`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + token
//       },
//       body: JSON.stringify({ eventId })
//     });

//     const data = await res.json();
//     showToast(data.message, res.ok ? "success" : "error");

//     if (res.ok) {
//       registeredEventIds.push(eventId);

//       // Update cache
//       const cached = localStorage.getItem(CACHE_KEY);
//       if (cached) {
//         const cacheData = JSON.parse(cached);
//         cacheData.registrations.push({ eventId });
//         localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
//       }

//       renderEvents();
//     }

//   } catch (err) {
//     console.error("Registration Error:", err);
//     showToast("Registration failed", "error");
//   }
// }


// // ===============================
// // UNREGISTER MODAL — OPEN
// // ===============================
// function openUnregisterModal(eventId, eventTitle) {
//   pendingUnregisterId    = eventId;
//   pendingUnregisterTitle = eventTitle;

//   document.getElementById("unregisterMessage").textContent =
//     `Are you sure you want to cancel your registration for "${eventTitle}"? ` +
//     `This cannot be undone.`;

//   document.getElementById("unregisterOverlay").classList.add("open");
// }


// // ===============================
// // UNREGISTER MODAL — CLOSE
// // ===============================
// function closeUnregisterModal() {
//   document.getElementById("unregisterOverlay").classList.remove("open");
//   pendingUnregisterId    = null;
//   pendingUnregisterTitle = null;
// }


// // ===============================
// // UNREGISTER — CONFIRM & CALL API
// // ===============================
// async function confirmUnregister() {
//   if (!pendingUnregisterId) return;

//   const confirmBtn = document.getElementById("unregisterConfirmBtn");
//   confirmBtn.textContent = "Cancelling...";
//   confirmBtn.disabled    = true;

//   try {
//     const res = await fetch(`${API_URL}/unregister/${pendingUnregisterId}`, {
//       method: "DELETE",
//       headers: { Authorization: "Bearer " + token }
//     });

//     const data = await res.json();

//     if (res.ok) {
//       // Remove from local arrays
//       registeredEventIds = registeredEventIds.filter(id => id !== pendingUnregisterId);

//       // Update cache
//       const cached = localStorage.getItem(CACHE_KEY);
//       if (cached) {
//         const cacheData = JSON.parse(cached);
//         cacheData.registrations = cacheData.registrations.filter(
//           r => (r.eventId?._id || r.eventId) !== pendingUnregisterId
//         );
//         localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
//       }

//       closeUnregisterModal();
//       showToast(data.message, "success");
//       renderEvents();

//       // Refresh stat counters
//       const regCount = document.getElementById("registeredCount");
//       if (regCount) {
//         regCount.innerText = Math.max(0, parseInt(regCount.innerText) - 1);
//       }

//     } else {
//       showToast(data.message, "error");
//     }

//   } catch (err) {
//     console.error("Unregister Error:", err);
//     showToast("Failed to cancel registration", "error");
//   } finally {
//     confirmBtn.textContent = "Yes, cancel";
//     confirmBtn.disabled    = false;
//   }
// }


// // Close modal when clicking outside
// document.getElementById("unregisterOverlay").addEventListener("click", function (e) {
//   if (e.target === this) closeUnregisterModal();
// });


// // ===============================
// // LOGOUT
// // ===============================
// function logout() {
//   localStorage.clear();
//   window.location.href = "login.html";
// }


// // ===============================
// // TOAST
// // ===============================
// function showToast(message, type = "success") {
//   const toast = document.getElementById("toast");
//   toast.innerText = message;
//   toast.style.background =
//     type === "error" ? "#dc2626" : "#16a34a";
//   toast.classList.add("show");
//   clearTimeout(toast._timer);
//   toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
// }


// // ===============================
// // SKELETON HELPERS
// // ===============================
// function showStatsSkeleton() {
//   const container = document.querySelector(".stats-container");
//   if (!container) return;
//   container.innerHTML = Array(6).fill(`
//     <div class="stat-card-skeleton">
//       <div class="skeleton sk-number"></div>
//       <div class="skeleton sk-label"></div>
//     </div>
//   `).join("");
// }

// function removeStatsSkeleton() {
//   const container = document.querySelector(".stats-container");
//   if (!container) return;
//   container.innerHTML = `
//     <div class="stat-card"><h3 id="upcomingCount">0</h3><p>Upcoming Events</p></div>
//     <div class="stat-card"><h3 id="totalEvents">0</h3><p>Total Events</p></div>
//     <div class="stat-card"><h3 id="registeredCount">0</h3><p>Registered</p></div>
//     <div class="stat-card"><h3 id="attendanceCount">0</h3><p>Attended</p></div>
//     <div class="stat-card"><h3 id="attendancePercent">0%</h3><p>Attendance %</p></div>
//     <div class="stat-card"><h3 id="missedCount">0</h3><p>Missed Events</p></div>
//   `;
// }

// function showCardsSkeleton() {
//   const container = document.getElementById("eventList");
//   if (!container) return;
//   container.innerHTML = Array(4).fill(`
//     <div class="card-skeleton">
//       <div class="skeleton sk-title"></div>
//       <div class="skeleton sk-line medium"></div>
//       <div class="skeleton sk-line short"></div>
//       <div class="skeleton sk-line medium"></div>
//       <div class="sk-actions">
//         <div class="skeleton sk-btn small"></div>
//         <div class="skeleton sk-btn small"></div>
//       </div>
//     </div>
//   `).join("");
// }

// function removeCardsSkeleton() {
//   // renderEvents() populates the container right after
// }

const API_URL = "http://localhost:5000/api";

let token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "student") {
  alert("Unauthorized access");
  window.location.href = "login.html";
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


// ===============================
// CACHE KEY
// ===============================
const CACHE_KEY = "dashboard_cache";


// ===============================
// LOAD DASHBOARD
// ===============================
async function loadDashboard() {

  // ── Step 1: Load from cache instantly ──
  const cached = localStorage.getItem(CACHE_KEY);

  if (cached) {
    try {
      const data = JSON.parse(cached);
      applyDashboardData(data.events, data.attendanceRecords, data.registrations);
    } catch {
      // corrupted cache — ignore
    }
  } else {
    showStatsSkeleton();
    showCardsSkeleton();
  }

  // ── Step 2: Fetch fresh data in background ──
  try {

    const [eventsRes, attendanceRes, regRes] = await Promise.all([
      fetch(`${API_URL}/events`,             { headers: { Authorization: "Bearer " + token } }),
      fetch(`${API_URL}/student-attendance`, { headers: { Authorization: "Bearer " + token } }),
      fetch(`${API_URL}/my-registrations`,   { headers: { Authorization: "Bearer " + token } })
    ]);

    const events            = await eventsRes.json();
    const attendanceRecords = await attendanceRes.json();
    const registrations     = await regRes.json();

    // ── Step 3: Save fresh data to cache ──
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      events,
      attendanceRecords,
      registrations
    }));

    // ── Step 4: Update UI ──
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
// ===============================
function applyDashboardData(events, attendanceRecords, registrations) {

  allEvents          = events;
  attendedEventIds   = attendanceRecords
    .filter(r => r.eventId)
    .map(r => r.eventId._id || r.eventId);
  registeredEventIds = registrations.map(r => r.eventId);

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

  renderEvents();

}

loadDashboard();


// ===============================
// REMINDER BADGE HELPER
// — Returns HTML string or ""
// ===============================
function getReminderBadge(dateStr) {
  if (!dateStr) return "";

  // Compare calendar DAYS not raw hours
  // This avoids timezone bugs where UTC midnight of "tomorrow"
  // appears as only 18.5 hours away in IST (UTC+5:30)
  const eventDate = new Date(dateStr);
  const today     = new Date();

  // Strip time — compare date only
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

  // ── Empty States ──
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

  // ── Render cards ──
  filteredEvents.forEach((event) => {

    const div = document.createElement("div");
    div.className = "card card-animate";

    const isRegistered = registeredEventIds.includes(event._id);
    const isPresent    = attendedEventIds.includes(event._id);

    // ── Reminder badge ──
    const reminderBadge = getReminderBadge(event.date);

    // ── Action buttons ──
    let statusHTML = "";
    if (isPresent) {
      statusHTML = `<span class="badge badge-present">✔ Present</span>`;
    } else if (isRegistered) {
      statusHTML = `
        <span class="badge badge-registered">Registered</span>
        <button
          class="unregister-btn"
          onclick="openUnregisterModal('${event._id}', '${event.title.replace(/'/g, "\\'")}')">
          Unregister
        </button>`;
    } else {
      statusHTML = `<button class="primary-btn" onclick="registerEvent('${event._id}')">Register</button>`;
    }

    div.innerHTML = `
      ${reminderBadge}
      <h3>${event.title}</h3>
      <p><strong>Category:</strong> ${event.category}</p>
      <p><strong>Date:</strong> ${event.date ? new Date(event.date).toLocaleDateString() : "TBA"}</p>
      <p><strong>Venue:</strong> ${event.venue || "Not specified"}</p>
      <div style="margin-top:10px">
        ${statusHTML}
        <a href="event-details.html?id=${event._id}" class="details-btn">View Details</a>
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
// ===============================
function handleSearch() {
  currentSearch = document.getElementById("searchInput").value.toLowerCase();
  renderEvents();
}


// ===============================
// REGISTER EVENT
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

      // Update cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const cacheData = JSON.parse(cached);
        cacheData.registrations.push({ eventId });
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
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
// ===============================
function openUnregisterModal(eventId, eventTitle) {
  pendingUnregisterId    = eventId;
  pendingUnregisterTitle = eventTitle;

  document.getElementById("unregisterMessage").textContent =
    `Are you sure you want to cancel your registration for "${eventTitle}"? ` +
    `This cannot be undone.`;

  document.getElementById("unregisterOverlay").classList.add("open");
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
      // Remove from local arrays
      registeredEventIds = registeredEventIds.filter(id => id !== pendingUnregisterId);

      // Update cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const cacheData = JSON.parse(cached);
        cacheData.registrations = cacheData.registrations.filter(
          r => (r.eventId?._id || r.eventId) !== pendingUnregisterId
        );
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      }

      closeUnregisterModal();
      showToast(data.message, "success");
      renderEvents();

      // Refresh stat counters
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


// Close modal when clicking outside
document.getElementById("unregisterOverlay").addEventListener("click", function (e) {
  if (e.target === this) closeUnregisterModal();
});


// ===============================
// LOGOUT
// ===============================
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}


// ===============================
// TOAST
// ===============================
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
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