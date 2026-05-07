const express = require("express");
const router  = express.Router();

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent
} = require("../controllers/eventController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload         = require("../middlewares/upload");
const validate       = require("../middlewares/validate");

const { eventValidators } = require("../validators/eventValidators");


// CREATE EVENT
router.post(
  "/",
  authMiddleware,
  roleMiddleware("faculty"),
  upload.single("image"),
  eventValidators,
  validate,
  createEvent
);

// GET ALL EVENTS
router.get("/", authMiddleware, getAllEvents);

// GET SINGLE EVENT
router.get("/:id", authMiddleware, getEventById);

// UPDATE EVENT
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("faculty"),
  upload.single("image"),
  eventValidators,
  validate,
  updateEvent
);

// DELETE EVENT
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("faculty"),
  deleteEvent
);

module.exports = router;