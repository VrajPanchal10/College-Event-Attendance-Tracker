const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? `http://${window.location.hostname}:5000`
  : "https://college-event-attendance-tracker.onrender.com";
const API_URL = `${BASE_URL}/api`;

// ── Render Cold-Start Wakeup ──
(async function wakeUpServer() {
  try {
    // Ping root endpoint to wake up Render free tier
    await fetch("https://college-event-attendance-tracker.onrender.com/");
    
    const hint = document.getElementById("serverWarmHint");
    if (hint) hint.classList.add("hidden");
  } catch (e) {
    // Silent fail
  }
})();

// ===============================
// PASSWORD UTILITIES
// ===============================
const PWD_KEYS = ['len', 'upper', 'lower', 'num', 'special'];
const PWD_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
const PWD_COLORS = ['', '#ef4444', '#f59e0b', '#3b82f6', '#2563eb', '#16a34a'];

function getPasswordRules(val) {
  return {
    len: val.length >= 6,
    upper: /[A-Z]/.test(val),
    lower: /[a-z]/.test(val),
    num: /[0-9]/.test(val),
    special: /[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]/.test(val)
  };
}

function showPopover(id = 'registerPop') {
  const pop = document.getElementById(id);
  if (pop) pop.classList.add('show');
}

function hidePopover(id = 'registerPop') {
  setTimeout(() => {
    const pop = document.getElementById(id);
    if (pop) pop.classList.remove('show');
  }, 200);
}

function updatePasswordStrengthUI(val, prefix = 'r') {
  const rules = getPasswordRules(val);
  const passed = PWD_KEYS.filter(k => rules[k]).length;

  PWD_KEYS.forEach(k => {
    const label = document.getElementById(`${prefix}pl-${k}`);
    const fill = document.getElementById(`${prefix}pf-${k}`);
    const check = document.getElementById(`${prefix}pc-${k}`);
    if (label) label.classList.toggle('pass', rules[k]);
    if (fill) fill.classList.toggle('pass', rules[k]);
    if (check) check.classList.toggle('pass', rules[k]);
  });

  const overallFill = document.getElementById(`${prefix}OverallFill`);
  const overallTxt = document.getElementById(`${prefix}OverallTxt`);
  const overallCount = document.getElementById(`${prefix}OverallCount`);

  if (overallFill) {
    overallFill.style.width = (passed / 5 * 100) + '%';
    overallFill.style.background = PWD_COLORS[passed] || '#e2e8f0';
  }
  if (overallTxt) {
    overallTxt.textContent = passed > 0 ? PWD_LABELS[passed] : 'Start typing';
    overallTxt.style.color = PWD_COLORS[passed] || '#94a3b8';
  }
  if (overallCount) {
    overallCount.textContent = passed + ' / 5';
    overallCount.style.color = PWD_COLORS[passed] || '#94a3b8';
  }

  const btn = document.getElementById('registerBtn');
  if (btn) btn.disabled = passed < 5;
}

// Aliases for compatibility with existing HTML
function checkRegisterPwd(v) { updatePasswordStrengthUI(v, 'r'); }
function showRegisterPop() { showPopover('registerPop'); }
function hideRegisterPop() { hidePopover('registerPop'); }

// ===============================
// AUTHENTICATION
// ===============================
async function login(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  const btn = document.getElementById("loginBtn");
  const originalText = btn ? btn.innerHTML : "";
  if (btn) {
    btn.innerHTML = "Signing in...";
    btn.disabled = true;
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);
      localStorage.setItem("email", data.email);
      localStorage.setItem("loginToast", "true");

      window.location.href = data.role === "student" ? "student-dashboard.html" : "faculty-dashboard.html";
    } else {
      showToast(data.message || "Login failed.", "error");
      if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
    }
  } catch (err) {
    showToast("Connection error. Please try again.", "error");
    if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
  }
}

async function register(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  const rules = getPasswordRules(password);
  if (!Object.values(rules).every(Boolean)) {
    showRegisterPop();
    checkRegisterPwd(password);
    showToast("Please meet all password requirements.", "error");
    return;
  }

  const btn = document.getElementById("registerBtn");
  const originalText = btn ? btn.innerHTML : "";
  if (btn) {
    btn.innerHTML = "Creating account...";
    btn.disabled = true;
  }

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();
    if (res.ok) {
      showToast(data.message || "Account created!", "success");
      setTimeout(() => { window.location.href = "login.html"; }, 1500);
    } else {
      showToast(data.message || "Registration failed.", "error");
      if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
    }
  } catch (err) {
    showToast("Connection error. Please try again.", "error");
    if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
  }
}

// ===============================
// UI HELPERS
// ===============================
function toggleEye(id = 'password', btnId = 'eyeBtn') {
  const inp = document.getElementById(id);
  const btn = document.getElementById(btnId);
  if (!inp) return;
  const isPwd = inp.type === "password";
  inp.type = isPwd ? "text" : "password";
  if (btn) btn.innerHTML = isPwd ? "&#128064;" : "&#128065;";
}

function toggleRegisterEye() { toggleEye('password', 'regEyeBtn'); }