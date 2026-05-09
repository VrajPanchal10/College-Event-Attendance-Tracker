const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:5000"
  : "https://college-event-attendance-tracker.onrender.com";
const API_URL = `${BASE_URL}/api`;
const token    = localStorage.getItem("token");

if (!token) {
  window.location.replace("login.html");
}

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const baseUrl = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  const imagePath = path.startsWith("/") ? path : "/" + path;
  return `${baseUrl}${imagePath}`;
};

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
    const banner = document.getElementById("eventBanner");
    const img    = document.getElementById("bannerImg");
    if (event.imageUrl) {
      img.src = getImageUrl(event.imageUrl);
      img.alt = event.title;
      banner.style.display = "block";
    } else {
      banner.style.display = "none";
    }

    // ── Text fields ──
    document.getElementById("title").innerText    = event.title;
    document.getElementById("category").innerText = event.category;
    document.getElementById("date").innerText        = formatDate(event.date);

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
  window.location.href = role === "faculty" ? "faculty-dashboard.html" : "student-dashboard.html";
}




// ===============================
// INIT
// ===============================
loadEventDetails();

function formatDate(dateStr) {
  if (!dateStr) return "TBA";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "TBA";
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}