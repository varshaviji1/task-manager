const mongoose = require("mongoose");
const Task = require("../models/Task");

// @desc    Get dashboard statistics for the logged-in user
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Aggregate tasks grouped by status for the authenticated user
    const stats = await Task.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Initialize counts
    let totalTasks = 0;
    let pendingTasks = 0;
    let inProgressTasks = 0;
    let completedTasks = 0;

    // Map aggregated results to respective variables
    stats.forEach((stat) => {
      totalTasks += stat.count;
      if (stat._id === "Pending") {
        pendingTasks = stat.count;
      } else if (stat._id === "In Progress") {
        inProgressTasks = stat.count;
      } else if (stat._id === "Completed") {
        completedTasks = stat.count;
      }
    });

    res.status(200).json({
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
