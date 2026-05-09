const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:5000"
  : "https://college-event-attendance-tracker.onrender.com";
const API_URL = `${BASE_URL}/api`;
const token   = localStorage.getItem("token");
const role    = localStorage.getItem("role");

// ===============================
// AUTH CHECK
// ===============================
if (!token) {
  window.location.href = "login.html";
}


// ===============================
// LOGOUT
// ===============================
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}


// ===============================
// SET BACK LINK based on role
// ===============================
const backHref = role === "faculty" ? "faculty-dashboard.html" : "student-dashboard.html";
const backBtn = document.getElementById("backBtn");
if (backBtn) backBtn.href = backHref;

const backMobile = document.getElementById("backLinkMobile");
if (backMobile) backMobile.href = backHref;

document.getElementById("topbarRole").innerText =
  role === "faculty" ? "Faculty" : "Student";


// ===============================
// LOAD PROFILE
// ===============================
async function loadProfile() {

  try {

    // Fetch profile + stats in parallel
    const headers = { Authorization: "Bearer " + token };

    const profileRes = await fetch(`${API_URL}/auth/profile`, { headers });
    const user = await profileRes.json();

    // ── Fill header card ──
    const initial = user.name ? user.name.charAt(0).toUpperCase() : "?";
    document.getElementById("avatarInitial").innerText = initial;
    document.getElementById("profileName").innerText   = user.name;
    document.getElementById("profileEmail").innerText  = user.email;

    const roleBadge = document.getElementById("profileRole");
    if (user.role === "faculty") {
      roleBadge.innerText = "🏫 Faculty";
      roleBadge.classList.add("faculty");
    } else {
      roleBadge.innerText = "🎓 Student";
    }

    // ── Fill info rows ──
    document.getElementById("infoName").innerText   = user.name;
    document.getElementById("infoEmail").innerText  = user.email;
    document.getElementById("infoRole").innerText   =
      user.role.charAt(0).toUpperCase() + user.role.slice(1);
    document.getElementById("infoJoined").innerText =
      user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-IN", { year:"numeric", month:"long", day:"numeric" })
        : "—";

    // ── Load stats based on role ──
    if (user.role === "student") {
      await loadStudentStats();
    } else {
      await loadFacultyStats();
    }

    // ── Update localStorage name (in case it changed) ──
    localStorage.setItem("name", user.name);
    localStorage.setItem("email", user.email);

  } catch (error) {
    console.error("Profile Load Error:", error);
    showToast("Failed to load profile", "error");
  }

}


// ===============================
// STUDENT STATS
// ===============================
async function loadStudentStats() {

  try {

    const headers = { Authorization: "Bearer " + token };

    const [attRes, regRes] = await Promise.all([
      fetch(`${API_URL}/student-attendance`, { headers }),
      fetch(`${API_URL}/my-registrations`,   { headers })
    ]);

    const attendance    = await attRes.json();
    const registrations = await regRes.json();

    const pct = registrations.length === 0
      ? 0
      : Math.round((attendance.length / registrations.length) * 100);

    document.getElementById("stat1").innerText      = registrations.length;
    document.getElementById("stat1Label").innerText = "Events Registered";
    document.getElementById("stat2").innerText      = attendance.length;
    document.getElementById("stat2Label").innerText = "Events Attended";
    document.getElementById("stat3").innerText      = pct + "%";
    document.getElementById("stat3Label").innerText = "Attendance Rate";

  } catch (error) {
    console.error("Student stats error:", error);
  }

}


// ===============================
// FACULTY STATS
// ===============================
async function loadFacultyStats() {

  try {

    const headers = { Authorization: "Bearer " + token };
    const eventsRes = await fetch(`${API_URL}/events`, { headers });
    const events = await eventsRes.json();

    // Get total registrations across all events
    const regResults = await Promise.all(
      events.map(e =>
        fetch(`${API_URL}/registrations/${e._id}`, { headers })
          .then(r => r.json()).catch(() => [])
      )
    );

    const totalRegs = regResults.reduce((sum, r) => sum + r.length, 0);

    document.getElementById("stat1").innerText      = events.length;
    document.getElementById("stat1Label").innerText = "Events Created";
    document.getElementById("stat2").innerText      = totalRegs;
    document.getElementById("stat2Label").innerText = "Total Registrations";
    document.getElementById("stat3").innerText      = "—";
    document.getElementById("stat3Label").innerText = "More coming soon";

  } catch (error) {
    console.error("Faculty stats error:", error);
  }

}


// ===============================
// CHANGE PASSWORD — VALIDATION
// ===============================
function setValid(id) {
  const f = document.getElementById("f-" + id);
  if (f) { f.classList.remove("error"); f.classList.add("valid"); }
}
function setError(id) {
  const f = document.getElementById("f-" + id);
  if (f) { f.classList.remove("valid"); f.classList.add("error"); }
}
function setNeutral(id) {
  const f = document.getElementById("f-" + id);
  if (f) { f.classList.remove("valid", "error"); }
}

function clearPwdError() {
  setNeutral("currentPassword");
}


// ===============================
// PASSWORD POPOVER — PROFILE
// ===============================
const PROF_KEYS   = ['len', 'upper', 'lower', 'num', 'special'];
const PROF_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
const PROF_COLORS = ['', '#ef4444', '#f59e0b', '#3b82f6', '#2563eb', '#16a34a'];

function getProfPwdRules(v) {
  return {
    len:     v.length >= 6,
    upper:   /[A-Z]/.test(v),
    lower:   /[a-z]/.test(v),
    num:     /[0-9]/.test(v),
    special: /[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]/.test(v)
  };
}

function showProfilePop() {
  const pop = document.getElementById('profilePop');
  if (pop) pop.classList.add('show');
}

function hideProfilePop() {
  setTimeout(() => {
    const pop = document.getElementById('profilePop');
    if (pop) pop.classList.remove('show');
  }, 200);
}

function toggleProfileEye() {
  const inp = document.getElementById('newPassword');
  const btn = document.getElementById('profileEyeBtn');
  if (!inp) return;
  if (inp.type === 'password') { inp.type = 'text';     if (btn) btn.innerHTML = '&#128064;'; }
  else                         { inp.type = 'password'; if (btn) btn.innerHTML = '&#128065;'; }
}

function validateNewPassword(val) {
  if (val === undefined) val = document.getElementById("newPassword").value;

  if (!val) { setNeutral("newPassword"); return false; }

  const r      = getProfPwdRules(val);
  const passed = PROF_KEYS.filter(k => r[k]).length;

  PROF_KEYS.forEach(k => {
    const label = document.getElementById('ppl-' + k);
    const fill  = document.getElementById('ppf-' + k);
    const check = document.getElementById('ppc-' + k);
    if (label) label.classList.toggle('pass', r[k]);
    if (fill)  fill.classList.toggle('pass',  r[k]);
    if (check) check.classList.toggle('pass', r[k]);
  });

  const overallFill  = document.getElementById('pOverallFill');
  const overallTxt   = document.getElementById('pOverallTxt');
  const overallCount = document.getElementById('pOverallCount');

  if (overallFill) {
    overallFill.style.width      = (passed / 5 * 100) + '%';
    overallFill.style.background = PROF_COLORS[passed] || '#e2e8f0';
  }
  if (overallTxt) {
    overallTxt.textContent = passed > 0 ? PROF_LABELS[passed] : 'Start typing';
    overallTxt.style.color = PROF_COLORS[passed] || '#94a3b8';
  }
  if (overallCount) {
    overallCount.textContent = passed + ' / 5';
    overallCount.style.color = PROF_COLORS[passed] || '#94a3b8';
  }

  if (passed < 5) { setError("newPassword"); return false; }

  setValid("newPassword");
  validateConfirmPassword();
  return true;
}

function validateConfirmPassword() {
  const newPwd  = document.getElementById("newPassword").value;
  const confirm = document.getElementById("confirmPassword").value;
  if (!confirm) { setNeutral("confirmPassword"); return false; }
  if (confirm !== newPwd) { setError("confirmPassword"); return false; }
  setValid("confirmPassword"); return true;
}


// ===============================
// CHANGE PASSWORD — SUBMIT
// ===============================
async function changePassword() {

  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword     = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Validate
  if (!currentPassword) { setError("currentPassword"); showToast("Please enter your current password", "error"); return; }
  if (!validateNewPassword())    return;
  if (!validateConfirmPassword()) return;

  try {

    const res = await fetch(`${API_URL}/auth/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const data = await res.json();

    if (res.ok) {
      showToast(data.message, "success");
      // Clear fields
      document.getElementById("currentPassword").value = "";
      document.getElementById("newPassword").value     = "";
      document.getElementById("confirmPassword").value = "";
      setNeutral("currentPassword");
      setNeutral("newPassword");
      setNeutral("confirmPassword");
    } else {
      if (data.message.includes("Current")) setError("currentPassword");
      showToast(data.message, "error");
    }

  } catch (error) {
    console.error("Change Password Error:", error);
    showToast("Failed to change password", "error");
  }

}


// ===============================
// TOAST
// ===============================
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.style.background = type === "error" ? "#dc2626" : "#16a34a";
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 3000);
}


// ===============================
// INIT
// ===============================
loadProfile();