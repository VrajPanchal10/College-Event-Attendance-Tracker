const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:5000"
  : "https://college-event-attendance-tracker.onrender.com";
const API_URL = `${BASE_URL}/api`;
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
// LOAD ANALYTICS
// — Fetches events, registrations,
//   and attendance in parallel
// ===============================
async function loadAnalytics() {

  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "block";

  try {
    // Fetch consolidated analytics data from the new endpoint
    const res = await fetch(`${API_URL}/analytics`, {
      headers: { Authorization: "Bearer " + token }
    });

    if (!res.ok) throw new Error("Failed to fetch analytics");

    const data = await res.json();
    const { totalEvents, totalRegistrations, totalAttendance, eventStats } = data;

    if (loader) loader.style.display = "none";

    // Handle empty state
    if (!eventStats || eventStats.length === 0) {
      document.querySelectorAll(".chart-card").forEach(card => card.style.display = "none");
      const emptyState = document.getElementById("emptyState");
      if (emptyState) emptyState.style.display = "block";
      return;
    }

    // Hide empty state if data exists
    const emptyState = document.getElementById("emptyState");
    if (emptyState) emptyState.style.display = "none";
    document.querySelectorAll(".chart-card").forEach(card => card.style.display = "block");

    // Calculate overall stats
    const absent = totalRegistrations - totalAttendance;
    const pct    = totalRegistrations === 0 ? 0 : Math.round((totalAttendance / totalRegistrations) * 100);

    // Update stat cards
    document.getElementById("totalEvents").innerText        = totalEvents;
    document.getElementById("totalRegistrations").innerText = totalRegistrations;
    document.getElementById("totalAttended").innerText      = totalAttendance;
    document.getElementById("attendancePercent").innerText  = pct + "%";

    // Build chart data arrays
    const labels    = eventStats.map(e => e.title);
    const regCounts = eventStats.map(e => e.regCount);
    const attCounts = eventStats.map(e => e.attCount);

    // Render charts
    renderBarChart(labels, regCounts, attCounts);
    renderDoughnutChart(totalAttendance, absent, pct);
    renderHorizontalBar(labels, regCounts);

  } catch (error) {
    if (loader) loader.style.display = "none";
    console.error("Analytics Load Error:", error);
    showToast("Failed to load analytics. Please try again later.", "error");
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
      maintainAspectRatio: false,
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
      maintainAspectRatio: false,
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
      maintainAspectRatio: false,
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