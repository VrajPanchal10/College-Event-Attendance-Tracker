const API_URL = "http://localhost:5000/api";
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
// LOAD ATTENDANCE
// — Fetches registrations, attendance & events
// — Cross-references to show Present / Absent
// ===============================
async function loadAttendance() {

  showTableSkeleton();

  try {

    // Fetch all three in parallel
    const [regRes, attRes, evtRes] = await Promise.all([
      fetch(`${API_URL}/my-registrations`,    { headers: { Authorization: "Bearer " + token } }),
      fetch(`${API_URL}/student-attendance`,  { headers: { Authorization: "Bearer " + token } }),
      fetch(`${API_URL}/events`,              { headers: { Authorization: "Bearer " + token } })
    ]);

    const registrations     = await regRes.json();
    const attendanceRecords = await attRes.json();
    const allEvents         = await evtRes.json();

    removeTableSkeleton();

    const tbody      = document.getElementById("attendanceBody");
    const emptyState = document.getElementById("emptyState");

    if (!registrations.length) {
      const container = document.querySelector(".attendance-table-container");
      container.innerHTML = `
        <div class="empty-state">
          <svg width="110" height="110" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" fill="#d1fae5"/>
            <rect x="38" y="35" width="44" height="52" rx="6" fill="#10b981" opacity="0.15"/>
            <rect x="38" y="35" width="44" height="52" rx="6" stroke="#10b981" stroke-width="2" opacity="0.4"/>
            <line x1="48" y1="52" x2="72" y2="52" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
            <line x1="48" y1="60" x2="72" y2="60" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
            <line x1="48" y1="68" x2="62" y2="68" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
            <circle cx="78" cy="78" r="14" fill="#10b981" opacity="0.2"/>
            <text x="78" y="83" text-anchor="middle" fill="#065f46" font-size="16">?</text>
          </svg>
          <h3>No Attendance Records</h3>
          <p>You haven't been marked present for any event yet. Register for events and attend them!</p>
          <a href="student-dashboard.html" class="empty-action">Browse Events</a>
        </div>`;
      document.getElementById("totalAttended").innerText = 0;
      return;
    }

    // Build a Set of attended eventIds for fast lookup
    const attendedMap = {};
    attendanceRecords.forEach(rec => {
      if (rec.eventId) {
        const id = rec.eventId._id || rec.eventId;
        attendedMap[id] = rec.markedAt;
      }
    });

    // Build event details map from allEvents
    const eventMap = {};
    allEvents.forEach(evt => {
      eventMap[evt._id] = evt;
    });

    emptyState.style.display = "none";
    tbody.innerHTML = "";

    let presentCount = 0;
    let rowIndex = 1;

    registrations.forEach(reg => {

      const eventId = reg.eventId?._id || reg.eventId;
      const event   = eventMap[eventId];

      // Skip if event was deleted
      if (!event) return;

      const isPresent  = !!attendedMap[eventId];
      if (isPresent) presentCount++;

      const dateAttended = isPresent
        ? new Date(attendedMap[eventId]).toLocaleDateString()
        : "—";

      // Category chip class
      const cat = (event.category || "").toLowerCase();
      let chipClass = "chip-other";
      if (cat === "tech")           chipClass = "chip-tech";
      else if (cat === "non-tech")  chipClass = "chip-nontech";
      else if (cat === "sports")    chipClass = "chip-sports";
      else if (cat === "yugantar")  chipClass = "chip-cultural";
      else if (cat === "gyanotsav") chipClass = "chip-other";

      const statusBadge = isPresent
        ? `<span class="badge-present">✔ Present</span>`
        : `<span class="badge-absent">✘ Absent</span>`;

      const tr = document.createElement("tr");
      // Set data-status for CSS colored left-border indicator
      tr.dataset.status = isPresent ? "present" : "absent";
      tr.innerHTML = `
        <td>${rowIndex++}</td>
        <td>${event.title || "—"}</td>
        <td><span class="table-chip ${chipClass}">${event.category || "—"}</span></td>
        <td>${dateAttended}</td>
        <td>${statusBadge}</td>
      `;

      tbody.appendChild(tr);

    });

    // Update stat to show attended count
    document.getElementById("totalAttended").innerText = presentCount;

    // If no rows were rendered show empty state
    if (rowIndex === 1) {
      const container = document.querySelector(".attendance-table-container");
      container.innerHTML = `
        <div class="empty-state">
          <svg width="110" height="110" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" fill="#d1fae5"/>
            <rect x="38" y="35" width="44" height="52" rx="6" fill="#10b981" opacity="0.15"/>
            <rect x="38" y="35" width="44" height="52" rx="6" stroke="#10b981" stroke-width="2" opacity="0.4"/>
            <line x1="48" y1="52" x2="72" y2="52" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
            <line x1="48" y1="60" x2="72" y2="60" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
            <line x1="48" y1="68" x2="62" y2="68" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
            <circle cx="78" cy="78" r="14" fill="#10b981" opacity="0.2"/>
            <text x="78" y="83" text-anchor="middle" fill="#065f46" font-size="16">?</text>
          </svg>
          <h3>No Attendance Records</h3>
          <p>You haven't been marked present for any event yet. Register for events and attend them!</p>
          <a href="student-dashboard.html" class="empty-action">Browse Events</a>
        </div>`;
    }

  } catch (error) {

    removeTableSkeleton();
    console.error("Attendance Load Error:", error);

  }

}

loadAttendance();


// ===============================
// SKELETON HELPERS
// ===============================
function showTableSkeleton() {
  const container = document.querySelector(".attendance-table-container");
  if (!container) return;
  container.innerHTML = `
    <div class="table-scroll-wrap">
    <div class="sk-thead">
      <div class="skeleton sk-th" style="width:30px"></div>
      <div class="skeleton sk-th" style="width:180px"></div>
      <div class="skeleton sk-th" style="width:80px"></div>
      <div class="skeleton sk-th" style="width:100px"></div>
      <div class="skeleton sk-th" style="width:70px"></div>
    </div>
    ${Array(5).fill(`
      <div class="sk-row">
        <div class="skeleton sk-td" style="width:20px"></div>
        <div class="skeleton sk-td" style="width:160px"></div>
        <div class="skeleton sk-td" style="width:70px"></div>
        <div class="skeleton sk-td" style="width:90px"></div>
        <div class="skeleton sk-td" style="width:60px"></div>
      </div>
    `).join("")}
    </div>
  `;
}

function removeTableSkeleton() {
  const container = document.querySelector(".attendance-table-container");
  if (!container) return;
  container.innerHTML = `
    <div class="table-scroll-wrap">
      <table class="attendance-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Event Title</th>
            <th>Category</th>
            <th>Date Attended</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="attendanceBody"></tbody>
      </table>
    </div>
    <div id="emptyState" class="empty-state" style="display:none;">
      <p>No attendance records found.</p>
    </div>
  `;
}