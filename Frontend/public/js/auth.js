const API_URL = "http://localhost:5000/api";


// ===============================
// PASSWORD STRENGTH — REGISTER
// ===============================
const PWD_KEYS   = ['len', 'upper', 'lower', 'num', 'special'];
const PWD_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
const PWD_COLORS = ['', '#ef4444', '#f59e0b', '#3b82f6', '#2563eb', '#16a34a'];

function getPwdRules(v) {
  return {
    len:     v.length >= 6,
    upper:   /[A-Z]/.test(v),
    lower:   /[a-z]/.test(v),
    num:     /[0-9]/.test(v),
    special: /[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]/.test(v)
  };
}

function showRegisterPop() {
  const pop = document.getElementById('registerPop');
  if (pop) pop.classList.add('show');
}

function hideRegisterPop() {
  setTimeout(() => {
    const pop = document.getElementById('registerPop');
    if (pop) pop.classList.remove('show');
  }, 200);
}

function checkRegisterPwd(v) {
  const r      = getPwdRules(v);
  const passed = PWD_KEYS.filter(k => r[k]).length;

  PWD_KEYS.forEach(k => {
    const label = document.getElementById('rpl-' + k);
    const fill  = document.getElementById('rpf-' + k);
    const check = document.getElementById('rpc-' + k);
    if (label) label.classList.toggle('pass', r[k]);
    if (fill)  fill.classList.toggle('pass',  r[k]);
    if (check) check.classList.toggle('pass', r[k]);
  });

  const overallFill  = document.getElementById('rOverallFill');
  const overallTxt   = document.getElementById('rOverallTxt');
  const overallCount = document.getElementById('rOverallCount');

  if (overallFill) {
    overallFill.style.width      = (passed / 5 * 100) + '%';
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

function toggleRegisterEye() {
  const inp = document.getElementById('password');
  const btn = document.getElementById('regEyeBtn');
  if (!inp) return;
  if (inp.type === 'password') { inp.type = 'text';     if (btn) btn.innerHTML = '&#128064;'; }
  else                         { inp.type = 'password'; if (btn) btn.innerHTML = '&#128065;'; }
}


// ===============================
// LOGIN — Fix #4: Loading state + Fix #2: No alert()
// ===============================
async function login(event) {
  event.preventDefault();

  const email    = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role     = document.getElementById("role").value;

  // Fix #4: Show loading state on button
  const btn = document.getElementById("loginBtn");
  const originalText = btn ? btn.innerHTML : "";
  if (btn) {
    btn.innerHTML = "Signing in...";
    btn.disabled  = true;
  }

  try {
    const res  = await fetch(`${API_URL}/auth/login`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password, role })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role",  data.role);
      localStorage.setItem("name",  data.name);
      localStorage.setItem("email", data.email);

      if (data.role === "student") {
        window.location.href = "student-dashboard.html";
      } else if (data.role === "faculty") {
        window.location.href = "faculty-dashboard.html";
      }

    } else {
      // Fix #2: Show styled error instead of alert()
      showAuthError(data.message || "Login failed. Please check your credentials.");
      if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
    }

  } catch (err) {
    console.error("Login error:", err);
    showAuthError("Connection error. Please check your network and try again.");
    if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
  }
}


// ===============================
// REGISTER — Fix #4: Loading state + Fix #2: No alert()
// ===============================
async function register(event) {
  event.preventDefault();

  const name     = document.getElementById("name").value.trim();
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role     = document.getElementById("role").value;

  // Frontend password strength check
  const rules  = getPasswordRules(password);
  const allPass = Object.values(rules).every(Boolean);

  if (!allPass) {
    showRegisterPop();
    checkRegisterPwd(password);
    showAuthError("Please make sure your password meets all the requirements shown.");
    return;
  }

  // Fix #4: Show loading state
  const btn = document.getElementById("registerBtn");
  const originalText = btn ? btn.innerHTML : "";
  if (btn) {
    btn.innerHTML = "Creating account...";
    btn.disabled  = true;
  }

  try {
    const res  = await fetch(`${API_URL}/auth/register`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();

    if (res.ok) {
      // Fix #2: No alert() — show inline success then redirect
      showAuthSuccess(data.message || "Account created! Redirecting to login...");
      setTimeout(() => { window.location.href = "login.html"; }, 1800);
    } else {
      showAuthError(data.message || "Registration failed.");
      if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
    }

  } catch (err) {
    console.error("Register error:", err);
    showAuthError("Connection error. Please check your network and try again.");
    if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
  }
}


// ===============================
// AUTH ERROR / SUCCESS DISPLAY
// Fix #2: Replaces all alert() calls with inline styled messages
// ===============================
function showAuthError(msg) {
  let el = document.getElementById("authMsg");
  if (!el) {
    el = document.createElement("div");
    el.id = "authMsg";
    el.className = "auth-msg auth-msg-error";
    // Insert before the first button or at end of form
    const form = document.querySelector("form");
    if (form) form.insertBefore(el, form.querySelector("button[type='submit']"));
  }
  el.className = "auth-msg auth-msg-error";
  el.textContent = msg;
  el.style.display = "block";
  // Auto-hide after 5s
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.display = "none"; }, 5000);
}

function showAuthSuccess(msg) {
  let el = document.getElementById("authMsg");
  if (!el) {
    el = document.createElement("div");
    el.id = "authMsg";
    const form = document.querySelector("form");
    if (form) form.insertBefore(el, form.querySelector("button[type='submit']"));
  }
  el.className = "auth-msg auth-msg-success";
  el.textContent = msg;
  el.style.display = "block";
}


// ===============================
// PASSWORD RULES HELPER
// ===============================
function getPasswordRules(val) {
  return {
    len:     val.length >= 6,
    upper:   /[A-Z]/.test(val),
    lower:   /[a-z]/.test(val),
    num:     /[0-9]/.test(val),
    special: /[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]/.test(val)
  };
}


// ===============================
// PASSWORD STRENGTH — live update
// ===============================
const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
const STRENGTH_COLORS = ["", "#ef4444", "#f59e0b", "#3b82f6", "#2563eb", "#16a34a"];
const RULE_KEYS       = ["len", "upper", "lower", "num", "special"];

function checkPasswordStrength(val) {
  const rules  = getPasswordRules(val);
  const passed = RULE_KEYS.filter(k => rules[k]).length;

  RULE_KEYS.forEach(k => {
    const lbl = document.getElementById("pl-" + k);
    const fil = document.getElementById("pf-" + k);
    const chk = document.getElementById("pc-" + k);
    if (lbl) lbl.classList.toggle("pass", rules[k]);
    if (fil) fil.classList.toggle("pass", rules[k]);
    if (chk) chk.classList.toggle("pass", rules[k]);
  });

  const fill = document.getElementById("overallFill");
  if (fill) {
    fill.style.width      = (passed / 5 * 100) + "%";
    fill.style.background = STRENGTH_COLORS[passed] || "#e2e8f0";
  }

  const txt   = document.getElementById("overallTxt");
  const count = document.getElementById("overallCount");
  if (txt)   { txt.textContent = passed > 0 ? STRENGTH_LABELS[passed] : "Start typing"; txt.style.color = STRENGTH_COLORS[passed] || "#94a3b8"; }
  if (count) { count.textContent = passed + " / 5"; count.style.color = STRENGTH_COLORS[passed] || "#94a3b8"; }

  const btn = document.getElementById("registerBtn");
  if (btn) btn.disabled = passed < 5;
}


// ===============================
// POPOVER — show / hide
// ===============================
function showPopover() {
  const pop = document.getElementById("pwdPopover");
  if (pop) pop.classList.add("show");
}

function hidePopover() {
  setTimeout(() => {
    const pop = document.getElementById("pwdPopover");
    if (pop) pop.classList.remove("show");
  }, 200);
}


// ===============================
// EYE TOGGLE — show / hide password (Login page)
// ===============================
function toggleEye() {
  const inp = document.getElementById("password");
  const btn = document.getElementById("eyeBtn");
  if (!inp) return;

  if (inp.type === "password") {
    inp.type      = "text";
    if (btn) btn.innerHTML = "&#128064;";
  } else {
    inp.type      = "password";
    if (btn) btn.innerHTML = "&#128065;";
  }
}