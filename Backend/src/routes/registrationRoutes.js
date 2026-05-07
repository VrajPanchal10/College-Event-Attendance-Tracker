const express = require("express");
const router  = express.Router();

const {
  registerForEvent,
  unregisterFromEvent,
  getRegistrationsByEvent,
  getMyRegistrations
} = require("../controllers/registrationController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");


// ================================
// Student registers for event
// ================================
router.post(
  "/register-event",
  authMiddleware,
  roleMiddleware("student"),
  registerForEvent
);


// ================================
// Student cancels their registration
// ================================
router.delete(
  "/unregister/:eventId",
  authMiddleware,
  roleMiddleware("student"),
  unregisterFromEvent
);


// ================================
// Faculty gets registrations for specific event
// ================================
router.get(
  "/registrations/:eventId",
  authMiddleware,
  roleMiddleware("faculty"),
  getRegistrationsByEvent
);


// ================================
// Student gets their own registrations
// ================================
router.get(
  "/my-registrations",
  authMiddleware,
  roleMiddleware("student"),
  getMyRegistrations
);

module.exports = router;