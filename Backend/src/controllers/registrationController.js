const Registration = require("../models/Registration");
const Attendance    = require("../models/Attendance");
const Event         = require("../models/Event");

// ================================
// Student registers for event
// ================================
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const registration = await Registration.create({
      studentId: req.user.id,
      eventId
    });

    res.status(201).json({
      message: "Registered successfully",
      registration
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already registered for this event" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ================================
// Student cancels their registration
// ================================
exports.unregisterFromEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const studentId   = req.user.id;

    // Block cancellation if attendance was already marked
    const attended = await Attendance.findOne({ eventId, studentId });
    if (attended) {
      return res.status(400).json({
        message: "Cannot cancel — attendance has already been marked for this event."
      });
    }

    const result = await Registration.findOneAndDelete({ studentId, eventId });

    if (!result) {
      return res.status(404).json({ message: "Registration not found." });
    }

    res.json({ message: "Registration cancelled successfully." });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ================================
// Faculty fetches registered students for an event
// ================================
exports.getRegistrationsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const registrations = await Registration.find({ eventId })
      .populate("studentId", "name email");

    res.status(200).json(registrations);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching registrations",
      error: error.message
    });
  }
};


// ================================
// Student fetches their own registrations
// ================================
exports.getMyRegistrations = async (req, res) => {
  try {
    const studentId = req.user.id;

    const registrations = await Registration.find({ studentId })
      .select("eventId");

    res.status(200).json(registrations);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching your registrations",
      error: error.message
    });
  }
};