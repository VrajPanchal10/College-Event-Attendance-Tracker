const API_URL = "https://college-event-attendance-tracker.onrender.com/api";
const token   = localStorage.getItem("token");
const role    = localStorage.getItem("role");

// ===============================
// AUTH CHECK
// ===============================
if (!token || role !== "faculty") {
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
// TOAST
// ===============================
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.style.background = type === "error" ? "#dc2626" : "#16a34a";
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}


// ===============================
// LOAD ANALYTICS
// — Fetches events, registrations,
//   and attendance in parallel
// ===============================
async function loadAnalytics() {

  const loader = document.getElementById("loader");
  loader.style.display = "block";

  try {

    // 1. Get all events
    const eventsRes = await fetch(`${API_URL}/events`, {
      headers: { Authorization: "Bearer " + token }
    });
    const events = await eventsRes.json();

    if (!events.length) {
      loader.style.display = "none";
      showToast("No events found.", "error");
      return;
    }

    // 2. Get registrations & attendance per event in parallel
    const [regResults, attResults] = await Promise.all([
      Promise.all(
        events.map(e =>
          fetch(`${API_URL}/registrations/${e._id}`, {
            headers: { Authorization: "Bearer " + token }
          }).then(r => r.json()).catch(() => [])
        )
      ),
      Promise.all(
        events.map(e =>
          fetch(`${API_URL}/attendance/${e._id}`, {
            headers: { Authorization: "Bearer " + token }
          }).then(r => r.json()).catch(() => [])
        )
      )
    ]);

    loader.style.display = "none";

    // 3. Build data arrays
    const labels   = events.map(e => e.title);
    const regCounts = regResults.map(r => r.length);
    const attCounts = attResults.map(a => a.length);

    const totalRegs = regCounts.reduce((a, b) => a + b, 0);
    const totalAtt  = attCounts.reduce((a, b) => a + b, 0);
    const absent    = totalRegs - totalAtt;
    const pct       = totalRegs === 0 ? 0 : Math.round((totalAtt / totalRegs) * 100);

    // 4. Update stat cards
    document.getElementById("totalEvents").innerText        = events.length;
    document.getElementById("totalRegistrations").innerText = totalRegs;
    document.getElementById("totalAttended").innerText      = totalAtt;
    document.getElementById("attendancePercent").innerText  = pct + "%";

    // 5. Render charts
    renderBarChart(labels, regCounts, attCounts);
    renderDoughnutChart(totalAtt, absent, pct);
    renderHorizontalBar(labels, regCounts);

  } catch (error) {
    loader.style.display = "none";
    console.error("Analytics Load Error:", error);
    showToast("Failed to load analytics", "error");
  }

}


// ===============================
// BAR CHART
// Registrations vs Attendance per event
// ===============================
function renderBarChart(labels, regCounts, attCounts) {

  new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Registered",
          data: regCounts,
          backgroundColor: "rgba(37,99,235,0.85)",
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: "Attended",
          data: attCounts,
          backgroundColor: "rgba(22,163,74,0.85)",
          borderRadius: 6,
          borderSkipped: false,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            font: { family: "Poppins", size: 12 },
            usePointStyle: true,
            pointStyleWidth: 8
          }
        },
        tooltip: {
          backgroundColor: "#1e293b",
          titleFont: { family: "Poppins", size: 12 },
          bodyFont:  { family: "Poppins", size: 12 },
          padding: 12,
          cornerRadius: 8,
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: "Poppins", size: 11 }, color: "#64748b" }
        },
        y: {
          grid: { color: "#f1f5f9" },
          ticks: { font: { family: "Poppins", size: 11 }, color: "#64748b", stepSize: 1, precision: 0 },
          beginAtZero: true
        }
      }
    }
  });

}


// ===============================
// DOUGHNUT CHART
// Present vs Absent overall
// ===============================
function renderDoughnutChart(totalAtt, absent, pct) {

  new Chart(document.getElementById("doughnutChart"), {
    type: "doughnut",
    data: {
      labels: ["Present", "Absent"],
      datasets: [{
        data: [totalAtt, absent],
        backgroundColor: ["rgba(22,163,74,0.85)", "rgba(239,68,68,0.85)"],
        borderWidth: 0,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      cutout: "72%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { family: "Poppins", size: 12 },
            usePointStyle: true,
            pointStyleWidth: 8,
            padding: 16
          }
        },
        tooltip: {
          backgroundColor: "#1e293b",
          titleFont: { family: "Poppins", size: 12 },
          bodyFont:  { family: "Poppins", size: 12 },
          padding: 12,
          cornerRadius: 8,
        }
      }
    },
    plugins: [{
      id: "centerText",
      beforeDraw(chart) {
        const { ctx, chartArea: { top, left, width, height } } = chart;
        ctx.save();
        const cx = left + width / 2;
        const cy = top  + height / 2;
        ctx.font         = "bold 28px Poppins";
        ctx.fillStyle    = "#1e293b";
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pct + "%", cx, cy - 8);
        ctx.font      = "12px Poppins";
        ctx.fillStyle = "#64748b";
        ctx.fillText("Attendance", cx, cy + 18);
        ctx.restore();
      }
    }]
  });

}


// ===============================
// HORIZONTAL BAR CHART
// Top events by registrations
// ===============================
function renderHorizontalBar(labels, regCounts) {

  // Sort by registration count descending
  const sorted = labels
    .map((label, i) => ({ label, count: regCounts[i] }))
    .sort((a, b) => b.count - a.count);

  new Chart(document.getElementById("horizontalBar"), {
    type: "bar",
    data: {
      labels: sorted.map(e => e.label),
      datasets: [{
        label: "Registrations",
        data: sorted.map(e => e.count),
        backgroundColor: sorted.map((_, i) =>
          `hsla(${220 + i * 15}, 80%, ${55 + i * 3}%, 0.85)`
        ),
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e293b",
          titleFont: { family: "Poppins", size: 12 },
          bodyFont:  { family: "Poppins", size: 12 },
          padding: 12,
          cornerRadius: 8,
        }
      },
      scales: {
        x: {
          grid: { color: "#f1f5f9" },
          ticks: { font: { family: "Poppins", size: 11 }, color: "#64748b", precision: 0 },
          beginAtZero: true
        },
        y: {
          grid: { display: false },
          ticks: { font: { family: "Poppins", size: 11 }, color: "#1e293b" }
        }
      }
    }
  });

}


// ===============================
// INIT
// ===============================
loadAnalytics();