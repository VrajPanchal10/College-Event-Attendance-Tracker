const { body } = require("express-validator");


// ===============================
// PASSWORD STRENGTH RULE
// Reused in register + changePassword
// Requirements:
//   — min 6 characters
//   — at least 1 uppercase letter
//   — at least 1 lowercase letter
//   — at least 1 number
//   — at least 1 special character
// ===============================
const passwordStrengthRules = (fieldName = "password") =>
  body(fieldName)
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage("Password must contain at least one special character (!@#$%^&* etc.)");


// ===============================
// REGISTER VALIDATORS
// ===============================
const registerValidators = [

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  passwordStrengthRules("password"),

  body("role")
    .optional()
    .isIn(["student", "faculty"])
    .withMessage("Role must be either student or faculty")

];


// ===============================
// LOGIN VALIDATORS
// — Password not checked for strength on login
//   (only checks if it's not empty)
// ===============================
const loginValidators = [

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  body("role")
    .optional()
    .isIn(["student", "faculty"])
    .withMessage("Role must be either student or faculty")

];


// ===============================
// CHANGE PASSWORD VALIDATORS
// ===============================
const changePasswordValidators = [

  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  passwordStrengthRules("newPassword")

];


module.exports = {
  registerValidators,
  loginValidators,
  changePasswordValidators
};