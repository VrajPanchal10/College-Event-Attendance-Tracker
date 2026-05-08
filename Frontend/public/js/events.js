const API_URL  = "https://college-event-attendance-tracker.onrender.com/api";
const BASE_URL = "https://college-event-attendance-tracker.onrender.com";
const token    = localStorage.getItem("token");

if (!token) {
  // Fix #2: Silent redirect — no alert()
  window.location.replace("login.html");
}

const params  = new URLSearchParams(window.location.search);
const eventId = params.get("id");


// ===============================
// LOAD EVENT DETAILS
// ===============================
async function loadEventDetails() {
  try {

    const res = await fetch(`${API_URL}/events/${eventId}`, {
      headers: { Authorization: "Bearer " + token }
    });

    if (!res.ok) {
      showToast("Failed to load event details", "error");
      return;
    }

    const event = await res.json();

    // ── Banner image ──
    // Show the banner only when the event actually has an image
    if (event.imageUrl) {
      const banner  = document.getElementById("eventBanner");
      const img     = document.getElementById("bannerImg");
      img.src       = `${BASE_URL}${event.imageUrl}`;
      img.alt       = event.title;
      banner.style.display = "block";

      // If image fails to load (deleted from server etc.) — hide banner cleanly
      img.onerror = () => { banner.style.display = "none"; };
    }

    // ── Text fields ──
    document.getElementById("title").innerText    = event.title;
    document.getElementById("category").innerText = event.category;
    document.getElementById("date").innerText     = event.date
      ? new Date(event.date).toLocaleDateString("en-IN", {
          weekday: "long",
          day:     "numeric",
          month:   "long",
          year:    "numeric"
        })
      : "To Be Announced";

    document.getElementById("venue").innerText       = event.venue       || "Not specified";
    document.getElementById("description").innerText = event.description || "No description available.";

  } catch (err) {
    console.error("Event Load Error:", err);
    showToast("Something went wrong loading event details", "error");
  }
}


// ===============================
// REGISTER FOR EVENT
// ===============================
async function registerEvent() {
  try {

    const res  = await fetch(`${API_URL}/register-event`, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  "Bearer " + token
      },
      body: JSON.stringify({ eventId })
    });

    const data = await res.json();
    showToast(data.message, res.ok ? "success" : "error");

  } catch (err) {
    console.error("Register Event Error:", err);
    showToast("Something went wrong. Please try again.", "error");
  }
}


// ===============================
// BACK BUTTON
// ===============================
function goBack() {
  const role = localStorage.getItem("role");
  if (role === "faculty") {
    window.location.href = "faculty-dashboard.html";
  } else {
    window.location.href = "student-dashboard.html";
  }
}


// ===============================
// TOAST
// ===============================
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.innerText          = message;
  toast.style.background   = type === "error" ? "#dc2626" : "#16a34a";
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}


// ===============================
// INIT
// ===============================
loadEventDetails();