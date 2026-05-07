const express = require("express");
const router = express.Router();

const Registration = require("../models/Registration");
const Attendance = require("../models/Attendance");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// DELETE /api/reset-demo
router.delete(
  "/reset-demo",
  authMiddleware,
  roleMiddleware("faculty"),   // 🔐 Only faculty can reset
  async (req, res) => {
    try {
      await Registration.deleteMany({});
      await Attendance.deleteMany({});

      res.status(200).json({
        message: "Demo data reset successfully"
      });
    } catch (error) {
      res.status(500).json({
        message: "Reset failed",
        error: error.message
      });
    }
  }
);

module.exports = router;
