const Registration = require("../models/Registration");
const Attendance = require("../models/Attendance");

exports.resetDemoData = async (req, res) => {
  try {

    await Registration.deleteMany({});
    await Attendance.deleteMany({});

    res.status(200).json({
      message: "Demo data reset successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Error resetting demo data",
      error: error.message
    });
  }
};
