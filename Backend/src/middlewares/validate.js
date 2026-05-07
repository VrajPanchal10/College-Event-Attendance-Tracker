const { validationResult } = require("express-validator");

// ===============================
// VALIDATE MIDDLEWARE
// Plug this after any validator array in a route.
// If there are errors it returns 400 with the
// first error message — no need to touch controllers.
// ===============================
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Return only the first error message — clean and simple
    return res.status(400).json({
      message: errors.array()[0].msg
    });
  }

  next();
};

module.exports = validate;