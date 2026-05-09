const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Attendance = require("../models/Attendance");

/**
 * GET /api/analytics
 * Returns comprehensive analytics for faculty
 */
exports.getAnalytics = async (req, res) => {
  try {
    // 1. Overall Stats
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const totalAttendance = await Attendance.countDocuments();

    // 2. Per-Event Breakdown (Aggregation)
    // We use lookup to join registrations and attendances for each event
    const eventStats = await Event.aggregate([
      {
        $lookup: {
          from: "registrations",
          localField: "_id",
          foreignField: "eventId",
          as: "registrations"
        }
      },
      {
        $lookup: {
          from: "attendances",
          localField: "_id",
          foreignField: "eventId",
          as: "attendances"
        }
      },
      {
        $project: {
          title: 1,
          category: 1,
          date: 1,
          regCount: { $size: "$registrations" },
          attCount: { $size: "$attendances" }
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json({
      totalEvents,
      totalRegistrations,
      totalAttendance,
      eventStats
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch analytics",
      error: error.message
    });
  }
};
