const rateLimit = require("express-rate-limit");

// ===============================
// LOGIN RATE LIMITER
// Max 10 attempts per IP per 15 minutes
// Prevents brute-force password attacks
// ===============================
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max: 10,
  message: {
    message: "Too many login attempts. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});


// ===============================
// REGISTER RATE LIMITER
// Max 5 accounts per IP per hour
// Prevents spam account creation
// ===============================
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,    // 1 hour
  max: 5,
  message: {
    message: "Too many accounts created from this IP. Please try again after an hour."
  },
  standardHeaders: true,
  legacyHeaders: false
});


module.exports = { loginLimiter, registerLimiter };