const Task = require("../models/Task");

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, subject, priority, status, dueDate } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: "Please add a task title" });
    }

    // Create task associated with the authenticated user
    const task = await Task.create({
      title,
      description,
      subject,
      priority,
      status,
      dueDate,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks for the logged-in user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    // Retrieve tasks belonging only to the authenticated user
    // Sort tasks by latest created first (createdAt desc)
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    // If task doesn't exist
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ensure user owns the task
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to access this task" });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    // If invalid cast/ObjectID format
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Task not found" });
    }
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    // If task doesn't exist
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ensure user owns the task
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    // Update task details with request body (run schema validators)
    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Task not found" });
    }
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    // If task doesn't exist
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ensure user owns the task
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this task" });
    }

    // Delete the task
    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: "Task removed successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Task not found" });
    }
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
