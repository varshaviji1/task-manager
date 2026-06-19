const mongoose = require("mongoose");

// Schema definition for the Task model
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a task title"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  subject: {
    type: String,
    trim: true,
  },
  priority: {
    type: String,
    enum: {
      values: ["Low", "Medium", "High"],
      message: "Priority must be either Low, Medium, or High",
    },
    default: "Medium",
  },
  status: {
    type: String,
    enum: {
      values: ["Pending", "In Progress", "Completed"],
      message: "Status must be either Pending, In Progress, or Completed",
    },
    default: "Pending",
  },
  dueDate: {
    type: Date,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "A task must belong to a user"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Task", TaskSchema);
