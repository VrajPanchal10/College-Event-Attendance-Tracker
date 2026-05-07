// const express  = require("express");
// const router   = express.Router();

// const {
//   register,
//   login,
//   getProfile,
//   changePassword
// } = require("../controllers/authController");

// const authMiddleware = require("../middlewares/authMiddleware");
// const validate       = require("../middlewares/validate");

// const {
//   registerValidators,
//   loginValidators,
//   changePasswordValidators
// } = require("../validators/authValidators");

// const {
//   loginLimiter,
//   registerLimiter
// } = require("../middlewares/rateLimiter");


// // POST /api/auth/register
// // Rate limited + validated
// router.post(
//   "/register",
//   registerLimiter,
//   registerValidators,
//   validate,
//   register
// );

// // POST /api/auth/login
// // Rate limited + validated
// router.post(
//   "/login",
//   loginLimiter,
//   loginValidators,
//   validate,
//   login
// );

// // GET /api/auth/profile
// router.get(
//   "/profile",
//   authMiddleware,
//   getProfile
// );

// // PUT /api/auth/change-password
// router.put(
//   "/change-password",
//   authMiddleware,
//   changePasswordValidators,
//   validate,
//   changePassword
// );

// module.exports = router;

const express  = require("express");
const router   = express.Router();

const {
  register,
  login,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register",        register);
router.post("/login",           login);
router.get( "/profile",         authMiddleware, getProfile);
router.put( "/change-password", authMiddleware, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

module.exports = router;