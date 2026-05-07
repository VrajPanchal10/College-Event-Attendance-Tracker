// Add this at the top of the file for testing
function testButtonClick() {
  alert('Test function works!');
  console.log('Test button clicked!');
}

// Add this function to handle the button click properly
function handleMarkAllPresent(eventId) {
  // Get absent IDs from cache
  if (!regCache[eventId]) {
    alert('No registration data found for this event!');
    return;
  }
  
  const { registrations, presentIds } = regCache[eventId];
  const absentIds = registrations
    .filter(r => !presentIds.includes(r.studentId?._id))
    .map(r => r.studentId?._id)
    .filter(Boolean);
  
  if (absentIds.length === 0) {
    showToast('All students are already marked present!', 'info');
    return;
  }
  
  // Call the actual function to mark attendance
  markAllAttendance(eventId, absentIds);
}

// ===============================
// GLOBAL VARIABLES
// ===============================
const API_URL = "http://localhost:5000/api";
const BASE_URL = "http://localhost:5000";

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "faculty") {
  alert("Unauthorized access");
  window.location.href = "login.html";
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// ===============================
// GLOBAL VARIABLES
// ===============================
let allFacultyEvents = [];
let currentFacultySearch = "";
let currentFacultyCategory = "All";
const regCache = {};  // { [eventId]: { registrations, presentIds } }
let isUpdatingEvent = false; // Flag to prevent duplicate operations

// ===============================
// CREATE EVENT
// Uses FormData so banner image can be uploaded
// ===============================
async function createEvent() {
  const t = validateTitle();
  const c = validateCategory();
  const d = validateDate();
  const v = validateVenue();
  const desc = validateDescription();

  if (!t || !c || !d || !v || !desc) {
    showToast("Please fix the errors before submitting.", "error");
    return;
  }

  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;
  const venue = document.getElementById("venue").value;
  const description = document.getElementById("description").value;
  const imageFile = document.getElementById("eventImage").files[0];

  const formData = new FormData();
  formData.append("title", title);
  formData.append("category", category);
  if (date) formData.append("date", date);
  if (venue) formData.append("venue", venue);
  if (description) formData.append("description", description);
  if (imageFile) formData.append("image", imageFile);

  try {
    const res = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: formData
    });
    const data = await res.json();
    showToast(data.message, res.ok ? "success" : "error");
    if (res.ok) {
      resetForm();
      loadEvents();
    }
  } catch (err) {
    console.error("Create Event Error:", err);
    showToast("Failed to create event", "error");
  }
}

// ===============================
// IMAGE UPLOAD PREVIEW
// ===============================
function previewImage(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById("imagePreview").src = e.target.result;
    document.getElementById("imagePreview").style.display = "block";
    document.getElementById("uploadPlaceholder").style.display = "none";
    document.getElementById("removeImageBtn").style.display = "inline-flex";
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  document.getElementById("eventImage").value = "";
  document.getElementById("imagePreview").src = "";
  document.getElementById("imagePreview").style.display = "none";
  document.getElementById("uploadPlaceholder").style.display = "flex";
  document.getElementById("removeImageBtn").style.display = "none";
}


// ===============================
// VALIDATION FUNCTIONS
// ===============================
function setValid(id) {
  const f = document.getElementById("f-" + id);
  if (!f) return;
  f.classList.remove("error"); f.classList.add("valid");
}
function setError(id) {
  const f = document.getElementById("f-" + id);
  if (!f) return;
  f.classList.remove("valid"); f.classList.add("error");
}
function setNeutral(id) {
  const f = document.getElementById("f-" + id);
  if (!f) return;
  f.classList.remove("valid", "error");
}

function validateTitle() {
  const val = document.getElementById("title").value.trim();
  const len = document.getElementById("title").value.length;
  const counter = document.getElementById("title-counter");
  if (counter) { counter.textContent = len + " / 80"; counter.className = "char-counter" + (len > 70 ? " warn" : ""); }
  if (!val) { setNeutral("title"); return false; }
  if (val.length < 3) { setError("title"); return false; }
  setValid("title"); return true;
}
function validateCategory() {
  const val = document.getElementById("category").value;
  if (!val) { setError("category"); return false; }
  setValid("category"); return true;
}
function validateDate() {
  const val = document.getElementById("date").value;
  if (!val) { setNeutral("date"); return true; }
  const selected = new Date(val);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (selected < today) { setError("date"); return false; }
  setValid("date"); return true;
}
function validateVenue() {
  const val = document.getElementById("venue").value;
  if (!val) { setNeutral("venue"); return true; }
  if (val.length > 100) { setError("venue"); return false; }
  setValid("venue"); return true;
}
function validateDescription() {
  const val = document.getElementById("description").value;
  const len = val.length;
  const counter = document.getElementById("desc-counter");
  if (counter) { counter.textContent = len + " / 500"; counter.className = "char-counter" + (len > 450 ? " warn" : "") + (len >= 500 ? " over" : ""); }
  if (len > 500) { setError("description"); return false; }
  setNeutral("description"); return true;
}

function resetForm() {
  ["title", "category", "date", "venue", "description"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
    setNeutral(id);
  });
  const tc = document.getElementById("title-counter");
  const dc = document.getElementById("desc-counter");
  if (tc) tc.textContent = "0 / 80";
  if (dc) dc.textContent = "0 / 500";
  removeImage();
}


// ===============================
// LOAD EVENTS
// ===============================
function loadEvents() {
  showFacultyStatsSkeleton();
  showFacultyCardsSkeleton();

  fetch(`${API_URL}/events`, { headers: { Authorization: "Bearer " + token } })
    .then(res => res.json())
    .then(events => {
      removeFacultyStatsSkeleton();
      allFacultyEvents = events;

      if (!events.length) {
        document.getElementById("eventList").innerHTML = "<p style='color:#64748b;font-size:0.88rem;'>No events available.</p>";
        return;
      }

      document.getElementById("eventsCreated").innerText = events.length;

      let totalRegistrations = 0;
      events.forEach(event => {
        fetch(`${API_URL}/registrations/${event._id}`, { headers: { Authorization: "Bearer " + token } })
          .then(res => res.json())
          .then(data => {
            totalRegistrations += data.length;
            document.getElementById("totalRegistrations").innerText = totalRegistrations;
          });
      });

      renderFacultyEvents();
    })
    .catch(err => {
      console.error(err);
      showToast("Failed to load events", "error");
    });
}


// ===============================
// RENDER FACULTY EVENTS
// ===============================
function renderFacultyEvents() {
  const eventList = document.getElementById("eventList");
  eventList.innerHTML = "";

  let filtered = allFacultyEvents;
  if (currentFacultyCategory !== "All") filtered = filtered.filter(e => e.category === currentFacultyCategory);
  if (currentFacultySearch !== "") filtered = filtered.filter(e => e.title.toLowerCase().includes(currentFacultySearch));

  if (allFacultyEvents.length === 0) {
    eventList.innerHTML = `
      <div class="empty-state-container" style="grid-column:1/-1"><div class="empty-state">
        <svg width="110" height="110" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="50" fill="#ede9fe"/>
          <rect x="35" y="40" width="50" height="45" rx="6" fill="#7c3aed" opacity="0.15"/>
          <rect x="35" y="40" width="50" height="10" rx="6" fill="#7c3aed" opacity="0.4"/>
          <rect x="42" y="58" width="36" height="4" rx="2" fill="#7c3aed" opacity="0.3"/>
          <rect x="42" y="66" width="24" height="4" rx="2" fill="#7c3aed" opacity="0.2"/>
        </svg>
        <h3>No Events Yet</h3><p>Create your first event using the form above!</p>
      </div></div>`;
    return;
  }

  if (filtered.length === 0) {
    eventList.innerHTML = `
      <div class="empty-state-container" style="grid-column:1/-1"><div class="empty-state">
        <svg width="110" height="110" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="50" fill="#e0f2fe"/>
          <circle cx="54" cy="52" r="18" stroke="#0ea5e9" stroke-width="4" fill="none" opacity="0.6"/>
          <line x1="67" y1="65" x2="80" y2="78" stroke="#0ea5e9" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
        </svg>
        <h3>No Results Found</h3><p>No events match your search. Try a different keyword or filter.</p>
      </div></div>`;
    return;
  }

  filtered.forEach(event => {
    const div = document.createElement("div");
    div.classList.add("card", "card-animate");

    div.innerHTML = `
      <h3>${event.title}</h3>
      <p><b>Category:</b> ${event.category}</p>
      <p><b>Date:</b> ${event.date ? new Date(event.date).toLocaleDateString() : "TBA"}</p>
      <p><b>Venue:</b> ${event.venue || "Not specified"}</p>
      <p><b>Created By:</b> ${event.createdBy?.name || "Unknown"}</p>
      <button class="card-btn-view"   onclick="viewRegistrations('${event._id}')">View Registrations</button>
      <button class="card-btn-edit"   onclick="editEvent('${event._id}')">Edit Event</button>
      <button class="card-btn-delete" onclick="deleteEvent('${event._id}')">Delete Event</button>
      <div class="export-divider"></div>
      <div class="export-label">⬇ Export</div>
      <button class="btn-export btn-export-reg" onclick="exportRegistrations('${event._id}', '${event.title}')">📋 Registrations</button>
      <button class="btn-export btn-export-att" onclick="exportAttendance('${event._id}', '${event.title}')">✅ Attendance</button>
      <div id="registrations-${event._id}"></div>
    `;

    eventList.appendChild(div);
  });
}


// ===============================
// VIEW REGISTRATIONS PANEL
// ===============================
async function viewRegistrations(eventId) {
  const container = document.getElementById(`registrations-${eventId}`);
  container.innerHTML = `<div style="padding:12px;color:#64748b;font-size:0.83rem">Loading...</div>`;

  try {
    const [regRes, attRes] = await Promise.all([
      fetch(`${API_URL}/registrations/${eventId}`, { headers: { Authorization: "Bearer " + token } }),
      fetch(`${API_URL}/attendance/${eventId}`, { headers: { Authorization: "Bearer " + token } })
    ]);

    const registrations = await regRes.json();
    const attendanceRecords = await attRes.json();
    const presentIds = attendanceRecords.map(a => a.studentId?._id || a.studentId);

    regCache[eventId] = { registrations, presentIds };

    if (!registrations.length) {
      container.innerHTML = `
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" fill="#fef9c3"/>
            <circle cx="50" cy="50" r="12" fill="#eab308" opacity="0.3"/>
            <circle cx="70" cy="50" r="12" fill="#eab308" opacity="0.3"/>
            <path d="M32 80 Q50 65 60 68 Q70 65 88 80" stroke="#eab308" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.5"/>
          </svg>
          <h3>No Students Registered</h3>
          <p>No students have registered for this event yet.</p>
        </div>`;
      return;
    }

    renderRegistrationPanel(eventId, "");

  } catch (error) {
    console.error("View Registrations Error:", error);
    document.getElementById(`registrations-${eventId}`).innerHTML =
      `<div style="padding:12px;color:#dc2626;font-size:0.83rem">Failed to load registrations.</div>`;
  }
}


// ===============================
// RENDER REGISTRATION PANEL
// Handles both initial render and search re-renders
// ===============================
function renderRegistrationPanel(eventId, searchQuery) {
  const container = document.getElementById(`registrations-${eventId}`);
  if (!container || !regCache[eventId]) {
    console.log('❌ DEBUG: No container or cache data');
    console.log('   Container exists:', !!container);
    console.log('   Cache exists:', !!regCache[eventId]);
    return;
  }

  const { registrations, presentIds } = regCache[eventId];

  console.log('🔍 DEBUG: Data received:');
  console.log('   Registrations:', registrations.length);
  console.log('   Present IDs:', presentIds.length);
  console.log('   Registrations data:', registrations);

  const filtered = searchQuery
    ? registrations.filter(r =>
      r.studentId?.name?.toLowerCase().includes(searchQuery) ||
      r.studentId?.email?.toLowerCase().includes(searchQuery)
    )
    : registrations;

  const presentCount = registrations.filter(r => presentIds.includes(r.studentId?._id)).length;
  const absentCount = registrations.length - presentCount;
  const absentIds = registrations
    .filter(r => !presentIds.includes(r.studentId?._id))
    .map(r => r.studentId?._id)
    .filter(Boolean);

  console.log('🔍 DEBUG: Calculations:');
  console.log('   Present count:', presentCount);
  console.log('   Absent count:', absentCount);
  console.log('   Absent IDs:', absentIds);

  const bulkHTML = absentCount > 0
    ? `<button class="bulk-att-btn" onclick="handleMarkAllPresent('${eventId}')">✓ Mark All Present (${absentCount})</button>`
    : `<button class="bulk-att-btn" disabled>✔ All Already Present</button>`;

  const rowsHTML = filtered.length === 0
    ? `<div style="padding:16px;text-align:center;color:#94a3b8;font-size:0.82rem">No students match your search.</div>`
    : filtered.map(reg => {
      const student = reg.studentId;
      const isPresent = presentIds.includes(student?._id);
      const initials = (student?.name || "?").charAt(0).toUpperCase();
      return `
          <div class="student-row${isPresent ? " is-present" : ""}">
            <div class="student-avatar">${initials}</div>
            <div class="student-info">
              <div class="student-name">${student?.name || "—"}</div>
              <div class="student-email">${student?.email || "—"}</div>
            </div>
            <div class="student-action">
              ${isPresent
          ? `<span class="status-present">✔ Present</span>`
          : `<button class="mark-btn" onclick="markAttendance('${eventId}', '${student?._id}')">Mark Present</button>`
        }
            </div>
          </div>`;
    }).join("");

  container.innerHTML = `
    <div class="reg-panel-header">
      <div class="reg-summary">
        <span>Registered: <strong>${registrations.length}</strong></span>
        <span class="reg-sep">|</span>
        <span>Present: <strong class="text-green">${presentCount}</strong></span>
        <span class="reg-sep">|</span>
        <span>Absent: <strong class="text-red">${absentCount}</strong></span>
      </div>
      <div class="reg-panel-actions">
        <input class="panel-search" placeholder="Search by name or email..." value="${searchQuery}"
               oninput="onPanelSearch('${eventId}', this.value)">
        ${bulkHTML}
      </div>
    </div>
    <div class="reg-student-list">${rowsHTML}</div>
  `;
}


// ===============================
// PANEL SEARCH
// ===============================
function onPanelSearch(eventId, query) {
  if (!regCache[eventId]) return;
  renderRegistrationPanel(eventId, query.toLowerCase().trim());
}


// ===============================
// MARK ALL PRESENT (BULK)
// ===============================
async function markAllAttendance(eventId, absentIds) {
  console.log('🎯 MARK ALL ATTENDANCE DEBUG:');
  console.log('   Event ID:', eventId);
  console.log('   Absent IDs:', absentIds);
  console.log('   API URL:', `${API_URL}/mark-attendance`);
  console.log('   Token exists:', !!token);
  console.log('   Token length:', token ? token.length : 0);

  if (!absentIds.length) {
    showToast('All students are already marked present!', 'info');
    return;
  }

  showToast(`Marking ${absentIds.length} students present...`, "info");

  try {
    const results = await Promise.all(
      absentIds.map(async (studentId, index) => {
        console.log(`📝 Marking attendance for student ${index + 1}: ${studentId}`);

        const response = await fetch(`${API_URL}/mark-attendance`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify({ eventId, studentId })
        });

        console.log(`📊 Response ${index + 1}:`, response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.log(`❌ Error response ${index + 1}:`, errorText);
          throw new Error(`Failed to mark attendance for student ${studentId}: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log(`✅ Success response ${index + 1}:`, data);
        return data;
      })
    );

    const successCount = results.filter(r => r.message && r.message.includes('successfully')).length;
    console.log(`🎉 Final result: ${successCount}/${results.length} successful`);

    if (successCount > 0) {
      showToast(`✔ Successfully marked ${successCount} students present!`);
      await viewRegistrations(eventId);
    } else {
      showToast("No attendance was marked", "error");
    }
  } catch (error) {
    console.error("❌ Bulk Attendance Error:", error);
    showToast("Failed to mark all present: " + error.message, "error");
  }
}


// ===============================
// MARK SINGLE ATTENDANCE
// ===============================
function markAttendance(eventId, studentId) {
  fetch(`${API_URL}/mark-attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify({ eventId, studentId })
  })
    .then(res => res.json())
    .then(data => { showToast(data.message); viewRegistrations(eventId); })
    .catch(() => showToast("Failed to mark attendance", "error"));
}


// ===============================
// EXPORT REGISTRATIONS CSV
// ===============================
async function exportRegistrations(eventId, eventTitle) {
  showToast("Preparing registrations CSV...", "info");
  try {
    const res = await fetch(`${API_URL}/registrations/${eventId}`, { headers: { Authorization: "Bearer " + token } });
    const regs = await res.json();
    if (!regs.length) { showToast("No registrations found", "error"); return; }
    let csv = "Name,Email,Registered Date\n";
    regs.forEach(r => {
      csv += `"${r.studentId?.name || "-"}","${r.studentId?.email || "-"}","${r.registeredAt ? new Date(r.registeredAt).toLocaleDateString() : "-"}"\n`;
    });
    downloadCSV(csv, `${eventTitle}_Registrations`);
    showToast(`✔ Exported — ${regs.length} students`);
  } catch (err) { showToast("Failed to export", "error"); }
}


// ===============================
// EXPORT ATTENDANCE CSV
// ===============================
async function exportAttendance(eventId, eventTitle) {
  showToast("Preparing attendance CSV...", "info");
  try {
    const [regRes, attRes] = await Promise.all([
      fetch(`${API_URL}/registrations/${eventId}`, { headers: { Authorization: "Bearer " + token } }),
      fetch(`${API_URL}/attendance/${eventId}`, { headers: { Authorization: "Bearer " + token } })
    ]);
    const regs = await regRes.json();
    const atts = await attRes.json();
    if (!regs.length) { showToast("No registrations found", "error"); return; }
    const attMap = {};
    atts.forEach(a => { attMap[a.studentId?._id || a.studentId] = a.markedAt || a.createdAt; });
    let csv = "Name,Email,Attended,Marked At\n";
    regs.forEach(r => {
      const s = r.studentId;
      const ok = attMap[s?._id];
      csv += `"${s?.name || "-"}","${s?.email || "-"}","${ok ? "Present" : "Absent"}","${ok ? new Date(attMap[s._id]).toLocaleString() : "-"}"\n`;
    });
    downloadCSV(csv, `${eventTitle}_Attendance`);
    showToast(`✔ Exported — ${regs.length} students`);
  } catch (err) { showToast("Failed to export", "error"); }
}


// ===============================
// DOWNLOAD CSV HELPER
// ===============================
function downloadCSV(csvContent, filename) {
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename.replace(/ /g, "_") + ".csv";
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}


// ===============================
// SEARCH & FILTER
// ===============================
function handleFacultySearch() {
  currentFacultySearch = document.getElementById("facultySearch").value.toLowerCase();
  renderFacultyEvents();
}

function filterFacultyEvents(category, btn) {
  currentFacultyCategory = category;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderFacultyEvents();
}


// ===============================
// EDIT EVENT
// ===============================
function editEvent(eventId) {
  fetch(`${API_URL}/events/${eventId}`, { headers: { Authorization: "Bearer " + token } })
    .then(res => res.json())
    .then(event => {
      document.getElementById("title").value = event.title || "";
      document.getElementById("category").value = event.category || "";
      document.getElementById("venue").value = event.venue || "";
      document.getElementById("description").value = event.description || "";
      if (event.date) document.getElementById("date").value = new Date(event.date).toISOString().split("T")[0];

      if (event.imageUrl) {
        document.getElementById("imagePreview").src = `${BASE_URL}${event.imageUrl}`;
        document.getElementById("imagePreview").style.display = "block";
        document.getElementById("uploadPlaceholder").style.display = "none";
        document.getElementById("removeImageBtn").style.display = "inline-flex";
      }

      document.querySelector(".create-section").scrollIntoView({ behavior: "smooth" });
      const btn = document.getElementById("createBtn");
      btn.innerText = "Update Event";
      btn.onclick = () => updateEvent(eventId);
    })
    .catch(() => showToast("Failed to load event for editing", "error"));
}


// ===============================
// UPDATE EVENT
// ===============================
async function updateEvent(eventId) {
  const t = validateTitle(), c = validateCategory(), d = validateDate(), v = validateVenue(), desc = validateDescription();
  if (!t || !c || !d || !v || !desc) {
    showToast("Please fix the errors before submitting.", "error");
    return;
  }

  const formData = new FormData();
  formData.append("title", document.getElementById("title").value.trim());
  formData.append("category", document.getElementById("category").value);
  const date = document.getElementById("date").value;
  const venue = document.getElementById("venue").value;
  const description = document.getElementById("description").value;
  const imageFile = document.getElementById("eventImage").files[0];
  if (date) formData.append("date", date);
  if (venue) formData.append("venue", venue);
  if (description) formData.append("description", description);
  if (imageFile) formData.append("image", imageFile);

  try {
    const res = await fetch(`${API_URL}/events/${eventId}`, {
      method: "PUT", headers: { Authorization: "Bearer " + token }, body: formData
    });
    const data = await res.json();
    showToast(data.message, res.ok ? "success" : "error");
    if (res.ok) {
      // Clear the registration cache to force refresh
      Object.keys(regCache).forEach(key => delete regCache[key]);

      resetForm();

      // Reset button to original state
      const btn = document.getElementById("createBtn");
      btn.innerText = "Create Event";
      btn.onclick = createEvent;

      // Reload events to get updated list
      await loadEvents();
    }
  } catch (err) {
    console.error("Update Event Error:", err);
    showToast("Failed to update event", "error");
  }
}


// ===============================
// DELETE EVENT
// ===============================
function deleteEvent(eventId) {
  const event = allFacultyEvents.find(e => e._id === eventId);
  showConfirmModal({
    type: "danger", icon: "🗑️", title: "Delete Event",
    subtitle: "This action cannot be undone",
    message: `Are you sure you want to delete <strong>${event?.title || "this event"}</strong>? All registrations and attendance records will also be removed.`,
    confirmText: "Yes, Delete",
    onConfirm: () => {
      fetch(`${API_URL}/events/${eventId}`, { method: "DELETE", headers: { Authorization: "Bearer " + token } })
        .then(res => res.json()).then(data => { showToast(data.message); loadEvents(); })
        .catch(() => showToast("Failed to delete event", "error"));
    }
  });
}


// ===============================
// CLEAR ALL RECORDS
// ===============================
function resetDemo() {
  showConfirmModal({
    type: "warning", icon: "⚠", title: "Clear All Records",
    subtitle: "This will wipe all data",
    message: "This will permanently delete <strong>ALL registrations and attendance records</strong>. Events will remain intact.",
    confirmText: "Yes, Clear All",
    onConfirm: () => {
      fetch(`${API_URL}/reset-demo`, { method: "DELETE", headers: { Authorization: "Bearer " + token } })
        .then(res => res.json()).then(data => { showToast(data.message); loadEvents(); })
        .catch(() => showToast("Failed to clear records", "error"));
    }
  });
}


// ===============================
// CUSTOM CONFIRM MODAL
// ===============================
let _modalOnConfirm = null;

document.addEventListener("DOMContentLoaded", function () {
  loadEvents();
  document.getElementById("resetBtn").addEventListener("click", resetDemo);
  document.getElementById("modalCancelBtn").addEventListener("click", closeModal);
  document.getElementById("modalConfirmBtn").addEventListener("click", function () {
    const fn = _modalOnConfirm; closeModal(); if (fn) fn();
  });
  document.getElementById("confirmOverlay").addEventListener("click", function (e) {
    if (e.target === this) closeModal();
  });

  // Set initial onclick for create button
  document.getElementById("createBtn").onclick = createEvent;
});

function showConfirmModal(options) {
  document.getElementById("modalIconWrap").textContent = options.icon;
  document.getElementById("modalIconWrap").className = "modal-icon-wrap " + options.type;
  document.getElementById("modalTitle").textContent = options.title;
  document.getElementById("modalSubtitle").textContent = options.subtitle;
  document.getElementById("modalMessage").innerHTML = options.message;
  const btn = document.getElementById("modalConfirmBtn");
  btn.textContent = options.confirmText;
  btn.className = "modal-btn modal-confirm-" + options.type;
  _modalOnConfirm = options.onConfirm;
  document.getElementById("confirmOverlay").classList.add("open");
}

function closeModal() {
  document.getElementById("confirmOverlay").classList.remove("open");
  _modalOnConfirm = null;
}


// ===============================
// TOAST
// ===============================
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.style.background = type === "error" ? "#dc2626" : type === "info" ? "#2563eb" : "#16a34a";
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}


// ===============================
// SKELETON HELPERS
// ===============================
function showFacultyStatsSkeleton() {
  const c = document.querySelector(".stats-container"); if (!c) return;
  c.innerHTML = Array(2).fill(`<div class="stat-card-skeleton"><div class="skeleton sk-number"></div><div class="skeleton sk-label"></div></div>`).join("");
}
function removeFacultyStatsSkeleton() {
  const c = document.querySelector(".stats-container"); if (!c) return;
  c.innerHTML = `<div class="stat-card"><h3 id="eventsCreated">0</h3><p>Events Created</p></div><div class="stat-card"><h3 id="totalRegistrations">0</h3><p>Total Registrations</p></div>`;
}
function showFacultyCardsSkeleton() {
  const c = document.getElementById("eventList"); if (!c) return;
  c.innerHTML = Array(4).fill(`<div class="card-skeleton"><div class="skeleton sk-title"></div><div class="skeleton sk-line medium"></div><div class="skeleton sk-line short"></div><div class="sk-actions"><div class="skeleton sk-btn small"></div><div class="skeleton sk-btn small"></div></div></div>`).join("");
}