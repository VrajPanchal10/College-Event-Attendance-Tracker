const express = require("express");
const router = express.Router();

const {
  markAttendance,
  getStudentAttendance,
  getAttendanceByEvent
} = require("../controllers/attendanceController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");


// Faculty mark attendance
router.post(
  "/mark-attendance",
  authMiddleware,
  roleMiddleware("faculty"),
  markAttendance
);


// Student attendance
router.get(
  "/student-attendance",
  authMiddleware,
  roleMiddleware("student"),
  getStudentAttendance
);


// Faculty view attendance per event
router.get(
  "/attendance/:eventId",
  authMiddleware,
  roleMiddleware("faculty"),
  getAttendanceByEvent
);


module.exports = router;