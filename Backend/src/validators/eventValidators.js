const { body } = require("express-validator");

// ===============================
// CREATE / UPDATE EVENT VALIDATORS
// ===============================
const eventValidators = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Event title is required")
    .isLength({ min: 3, max: 80 })
    .withMessage("Title must be between 3 and 80 characters"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(["Tech", "Non-Tech", "Yugantar", "Gyanotsav", "Sports"])
    .withMessage("Category must be one of: Tech, Non-Tech, Yugantar, Gyanotsav, Sports"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("venue")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Venue cannot exceed 100 characters"),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date")
    .custom((value) => {
      if (value) {
        const inputDate = new Date(value);
        const today    = new Date();
        today.setHours(0, 0, 0, 0);
        if (inputDate < today) {
          throw new Error("Event date cannot be in the past");
        }
      }
      return true;
    })
];

module.exports = { eventValidators };