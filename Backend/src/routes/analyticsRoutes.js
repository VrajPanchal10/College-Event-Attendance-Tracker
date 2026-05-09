const express = require("express");
const router = express.Router();
const { getAnalytics } = require("../controllers/analyticsController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// GET /api/analytics
// Restricted to Faculty
router.get("/", authMiddleware, roleMiddleware("faculty"), getAnalytics);

module.exports = router;
