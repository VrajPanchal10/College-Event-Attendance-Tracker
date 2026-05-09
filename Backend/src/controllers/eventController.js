const Event        = require("../models/Event");
const Registration = require("../models/Registration");
const Attendance   = require("../models/Attendance");


// ===============================
// CREATE EVENT
// ===============================
exports.createEvent = async (req, res) => {

  try {

    const { title, category, description, date, venue } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        message: "Title and category are required"
      });
    }

    // If a file was uploaded, store its path
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const event = await Event.create({
      title,
      category,
      description,
      date,
      venue,
      imageUrl,
      createdBy: req.user.id
    });

    res.status(201).json({
      message: "Event created successfully",
      event
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error",
      error: error.message
    });

  }

};


// ===============================
// GET ALL EVENTS
// With optional pagination
// ===============================
exports.getAllEvents = async (req, res) => {

  try {

    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 100; // default large limit to avoid breaking existing frontend
    const skip  = (page - 1) * limit;

    const events = await Event.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments();

    res.json({
      events,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

};


// ===============================
// GET EVENT BY ID
// ===============================
exports.getEventById = async (req, res) => {

  try {

    const { id } = req.params;

    const event = await Event.findById(id)
      .populate("createdBy", "name email");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);

  } catch (error) {

    res.status(500).json({
      message: "Server error",
      error: error.message
    });

  }

};


// ===============================
// UPDATE EVENT
// ===============================
exports.updateEvent = async (req, res) => {

  try {

    const { id }   = req.params;
    const updates  = { ...req.body };

    // Only overwrite imageUrl if a new file was uploaded
    if (req.file) {
      updates.imageUrl = `/uploads/${req.file.filename}`;
    }

    const event = await Event.findByIdAndUpdate(id, updates, { new: true });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      message: "Event updated successfully",
      event
    });

  } catch (error) {

    res.status(500).json({
      message: "Update failed",
      error: error.message
    });

  }

};


// ===============================
// DELETE EVENT
// Atomic cascading delete
// ===============================
exports.deleteEvent = async (req, res) => {

  try {

    const { id } = req.params;

    // Start a simple transaction-like sequence (or just sequential deletes)
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Clean up related records
    await Registration.deleteMany({ eventId: id });
    await Attendance.deleteMany({ eventId: id });

    res.json({ message: "Event and all related records deleted successfully" });

  } catch (error) {

    res.status(500).json({
      message: "Delete failed",
      error: error.message
    });

  }

};


// ===============================
// CLEAR EVENT RECORDS
// ===============================
exports.clearEventRecords = async (req, res) => {

  try {

    const { id } = req.params;

    await Registration.deleteMany({ eventId: id });
    await Attendance.deleteMany({ eventId: id });

    res.json({ message: "All records for this event cleared successfully" });

  } catch (error) {

    res.status(500).json({
      message: "Failed to clear records",
      error: error.message
    });

  }

};