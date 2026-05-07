const Attendance = require("../models/Attendance");
const Registration = require("../models/Registration");

// ===============================
// MARK ATTENDANCE (Faculty)
// ===============================
exports.markAttendance = async (req, res) => {
  try {
    const { eventId, studentId } = req.body;

    // Check if student registered
    const registration = await Registration.findOne({
      eventId,
      studentId
    });

    if (!registration) {
      return res.status(400).json({
        message: "Student is not registered for this event."
      });
    }

    // Prevent duplicate attendance
    const existingAttendance = await Attendance.findOne({
      eventId,
      studentId
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: "Attendance already marked for this student."
      });
    }

    // Create attendance
    const attendance = await Attendance.create({
      eventId,
      studentId,
      markedBy: req.user.id
    });

    res.status(201).json({
      message: "Attendance marked successfully",
      attendance
    });

  } catch (error) {
    res.status(500).json({
      message: "Error marking attendance",
      error: error.message
    });
  }
};


// ===============================
// GET STUDENT ATTENDANCE (Student)
// ===============================
exports.getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;

    const attendanceRecords = await Attendance.find({ studentId })
      .populate("eventId", "title category date venue");

    res.status(200).json(attendanceRecords);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching attendance",
      error: error.message
    });
  }
};



// ===============================
// GET ATTENDANCE BY EVENT
// ===============================
exports.getAttendanceByEvent = async (req, res) => {

  try {

    const { eventId } = req.params;

    const attendance = await Attendance.find({ eventId })
      .populate("studentId", "name email");

    res.json(attendance);

  }

  catch (error) {

    res.status(500).json({
      message: "Error fetching attendance",
      error: error.message
    });

  }

};